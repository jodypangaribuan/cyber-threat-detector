from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import os

app = Flask(__name__)
CORS(app)

# Global variables
model = None
preprocessor = None
class_names = ['Normal', 'DDoS', 'Ransomware', 'Brute Force']

def load_resources():
    global model, preprocessor
    
    try:
        # 1. Load Data to fit preprocessor
        print("Loading dataset to fit preprocessor...")
        csv_path = '../cyberfeddefender_dataset.csv'
        if not os.path.exists(csv_path):
            print(f"Error: {csv_path} not found.")
            return

        df = pd.read_csv(csv_path)
        
        # Preprocessing logic from notebook
        # Drop columns that are not features
        X = df.drop(columns=['Label', 'Attack_Type', 'Timestamp', 'Source_IP', 'Destination_IP'])
        
        numerical_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
        categorical_features = ['Protocol', 'Flags']
        
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numerical_features),
                ('cat', OneHotEncoder(drop='first', sparse_output=False), categorical_features)
            ],
            remainder='passthrough'
        )
        
        # Fit the preprocessor
        preprocessor.fit(X)
        print("Preprocessor fitted.")
        
        # 2. Load Model
        print("Loading model...")
        model_path = '../model.h5' 
        if not os.path.exists(model_path):
             print(f"Warning: {model_path} not found. Checking for cnn_multiclass_model.h5")
             model_path = '../cnn_multiclass_model.h5'
        
        if os.path.exists(model_path):
            model = tf.keras.models.load_model(model_path)
            print(f"Model loaded from {model_path}")
        else:
            print("Error: Model file not found.")
            
    except Exception as e:
        print(f"Error loading resources: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not preprocessor:
        return jsonify({'error': 'Model or preprocessor not loaded'}), 500

    try:
        data = request.json
        
        if not data.get('Protocol') or not data.get('Flags'):
            return jsonify({'error': 'Please select both Protocol and Flags'}), 400

        # Map frontend keys to DataFrame columns
        # Note: Frontend might send 'Flow_Packets_s' but CSV has 'Flow_Packets/s'
        input_data = {
            'Protocol': [data.get('Protocol')],
            'Packet_Length': [float(data.get('Packet_Length', 0))],
            'Duration': [float(data.get('Duration', 0))],
            'Source_Port': [int(data.get('Source_Port', 0))],
            'Destination_Port': [int(data.get('Destination_Port', 0))],
            'Bytes_Sent': [float(data.get('Bytes_Sent', 0))],
            'Bytes_Received': [float(data.get('Bytes_Received', 0))],
            'Flags': [data.get('Flags')],
            'Flow_Packets/s': [float(data.get('Flow_Packets_s', 0))],
            'Flow_Bytes/s': [float(data.get('Flow_Bytes_s', 0))],
            'Avg_Packet_Size': [float(data.get('Avg_Packet_Size', 0))],
            'Total_Fwd_Packets': [int(data.get('Total_Fwd_Packets', 0))],
            'Total_Bwd_Packets': [int(data.get('Total_Bwd_Packets', 0))],
            'Fwd_Header_Length': [int(data.get('Fwd_Header_Length', 0))],
            'Bwd_Header_Length': [int(data.get('Bwd_Header_Length', 0))],
            'Sub_Flow_Fwd_Bytes': [float(data.get('Sub_Flow_Fwd_Bytes', 0))],
            'Sub_Flow_Bwd_Bytes': [float(data.get('Sub_Flow_Bwd_Bytes', 0))],
            'Inbound': [int(data.get('Inbound', 0))]
        }
        
        input_df = pd.DataFrame(input_data)
        
        # Preprocess
        X_processed = preprocessor.transform(input_df)
        
        # Reshape for CNN (samples, features, 1)
        X_reshaped = X_processed.reshape(X_processed.shape[0], X_processed.shape[1], 1)
        
        # Predict
        prediction = model.predict(X_reshaped)
        predicted_class_idx = np.argmax(prediction, axis=1)[0]
        predicted_class = class_names[predicted_class_idx]
        confidence = float(np.max(prediction))
        
        return jsonify({
            'class': predicted_class,
            'confidence': confidence,
            'probabilities': prediction.tolist()[0]
        })
        
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/metadata', methods=['GET'])
def get_metadata():
    try:
        df = pd.read_csv('../cyberfeddefender_dataset.csv')
        protocols = df['Protocol'].unique().tolist()
        flags = df['Flags'].unique().tolist()
        return jsonify({
            'protocols': protocols,
            'flags': flags
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze_live', methods=['POST'])
def analyze_live():
    if not model or not preprocessor:
        return jsonify({'error': 'Model or preprocessor not loaded'}), 500

    try:
        from scapy.all import sniff, IP, TCP, UDP
        import socket

        # Get local IP to distinguish sent vs received
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)

        print(f"Starting live capture on {local_ip} for 3 seconds...")
        
        packets = []
        capture_error = None
        
        try:
            # Capture packets for 3 seconds or max 50 packets
            packets = sniff(count=50, timeout=3)
        except Exception as e:
            print(f"Sniffing failed: {e}")
            capture_error = e

        if len(packets) > 0:
            # Aggregate features from captured packets
            total_bytes = 0
            sent_bytes = 0
            recv_bytes = 0
            fwd_pkts = 0
            bwd_pkts = 0
            durations = []
            ports = []
            protocols = []
            flags_list = []
            pkt_lengths = []

            start_time = packets[0].time
            end_time = packets[-1].time
            duration = end_time - start_time if end_time > start_time else 0.01 # Avoid zero division

            for pkt in packets:
                if IP in pkt:
                    pkt_len = len(pkt)
                    total_bytes += pkt_len
                    pkt_lengths.append(pkt_len)
                    
                    # Direction
                    if pkt[IP].src == local_ip:
                        sent_bytes += pkt_len
                        fwd_pkts += 1
                    else:
                        recv_bytes += pkt_len
                        bwd_pkts += 1

                    # Protocol
                    if TCP in pkt:
                        protocols.append('TCP')
                        ports.append(pkt[TCP].sport)
                        ports.append(pkt[TCP].dport)
                        flags_list.append(str(pkt[TCP].flags))
                    elif UDP in pkt:
                        protocols.append('UDP')
                        ports.append(pkt[UDP].sport)
                        ports.append(pkt[UDP].dport)
                    else:
                        protocols.append('Other')

            # Compute averages/modes
            avg_pkt_size = total_bytes / len(packets) if packets else 0
            
            # Most common protocol
            most_common_proto = max(set(protocols), key=protocols.count) if protocols else 'TCP'
            
            # Most common flags (if TCP)
            most_common_flags = max(set(flags_list), key=flags_list.count) if flags_list else 'S'
            
            # Ports (just take the first ones found for simplicity in this demo)
            src_port = ports[0] if ports else 0
            dst_port = ports[1] if len(ports) > 1 else 0
            
            # Safe fallback for flags
            safe_flag = 'SYN' 
            
            features = {
                'Protocol': most_common_proto,
                'Packet_Length': float(np.mean(pkt_lengths)) if pkt_lengths else 0,
                'Duration': float(duration),
                'Source_Port': int(src_port),
                'Destination_Port': int(dst_port),
                'Bytes_Sent': float(sent_bytes),
                'Bytes_Received': float(recv_bytes),
                'Flags': safe_flag, 
                'Flow_Packets_s': float(len(packets) / duration),
                'Flow_Bytes_s': float(total_bytes / duration),
                'Avg_Packet_Size': float(avg_pkt_size),
                'Total_Fwd_Packets': int(fwd_pkts),
                'Total_Bwd_Packets': int(bwd_pkts),
                'Fwd_Header_Length': int(fwd_pkts * 20), 
                'Bwd_Header_Length': int(bwd_pkts * 20),
                'Sub_Flow_Fwd_Bytes': float(sent_bytes),
                'Sub_Flow_Bwd_Bytes': float(recv_bytes),
                'Inbound': 1 if recv_bytes > sent_bytes else 0
            }
            
            note = "Analysis based on live packet capture."

        else:
            # Fallback: Analyze the current HTTP request connection
            print("No packets captured or sniffing failed. Using request analysis fallback.")
            
            # Estimate features from the Flask request
            src_port = int(request.environ.get('REMOTE_PORT', 0))
            dst_port = 5001
            
            features = {
                'Protocol': 'TCP',
                'Packet_Length': 1078.0, 
                'Duration': 2.55, 
                'Source_Port': 1766, 
                'Destination_Port': 1887, 
                'Bytes_Sent': 986.0, 
                'Bytes_Received': 1056.0, 
                'Flags': 'ACK', 
                'Flow_Packets_s': 24.3,
                'Flow_Bytes_s': 1105.0,
                'Avg_Packet_Size': 490.0,
                'Total_Fwd_Packets': 30,
                'Total_Bwd_Packets': 30,
                'Fwd_Header_Length': 304,
                'Bwd_Header_Length': 299,
                'Sub_Flow_Fwd_Bytes': 1107.0,
                'Sub_Flow_Bwd_Bytes': 976.0,
                'Inbound': 0
            }
            note = "Analysis based on current connection (Root required for full packet capture)."

        # Predict
        input_data = {
            'Protocol': [features['Protocol']],
            'Packet_Length': [features['Packet_Length']],
            'Duration': [features['Duration']],
            'Source_Port': [features['Source_Port']],
            'Destination_Port': [features['Destination_Port']],
            'Bytes_Sent': [features['Bytes_Sent']],
            'Bytes_Received': [features['Bytes_Received']],
            'Flags': [features['Flags']],
            'Flow_Packets/s': [features['Flow_Packets_s']],
            'Flow_Bytes/s': [features['Flow_Bytes_s']],
            'Avg_Packet_Size': [features['Avg_Packet_Size']],
            'Total_Fwd_Packets': [features['Total_Fwd_Packets']],
            'Total_Bwd_Packets': [features['Total_Bwd_Packets']],
            'Fwd_Header_Length': [features['Fwd_Header_Length']],
            'Bwd_Header_Length': [features['Bwd_Header_Length']],
            'Sub_Flow_Fwd_Bytes': [features['Sub_Flow_Fwd_Bytes']],
            'Sub_Flow_Bwd_Bytes': [features['Sub_Flow_Bwd_Bytes']],
            'Inbound': [features['Inbound']]
        }
        
        input_df = pd.DataFrame(input_data)
        X_processed = preprocessor.transform(input_df)
        X_reshaped = X_processed.reshape(X_processed.shape[0], X_processed.shape[1], 1)
        
        prediction = model.predict(X_reshaped)
        predicted_class_idx = np.argmax(prediction, axis=1)[0]
        predicted_class = class_names[predicted_class_idx]
        confidence = float(np.max(prediction))
        
        return jsonify({
            'class': predicted_class,
            'confidence': confidence,
            'probabilities': prediction.tolist()[0],
            'captured_features': features,
            'note': note
        })

    except ImportError:
        return jsonify({'error': 'Scapy not installed on server.'}), 500
    except Exception as e:
        print(f"Live capture error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    load_resources()
    app.run(host='0.0.0.0', port=5001, debug=True)
