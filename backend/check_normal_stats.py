import pandas as pd
import numpy as np

def get_normal_stats():
    try:
        df = pd.read_csv('../cyberfeddefender_dataset.csv')
        # Filter for Normal traffic
        normal_df = df[df['Label'] == 0] # Assuming 0 is Normal, let's check class names
        
        # Actually, let's check the 'Attack_Type' column
        if 'Attack_Type' in df.columns:
            normal_df = df[df['Attack_Type'] == 'Normal']
        
        print("Normal Traffic Stats (Mean):")
        stats = normal_df.describe().loc['mean']
        print(stats)
        
        # Also print mode for categorical
        print("\nTop Protocol:")
        print(normal_df['Protocol'].mode()[0])
        print("\nTop Flags:")
        print(normal_df['Flags'].mode()[0])

    except Exception as e:
        print(e)

if __name__ == "__main__":
    get_normal_stats()
