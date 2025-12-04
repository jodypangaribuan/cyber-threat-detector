'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Activity, AlertTriangle, CheckCircle, Server, Zap,
    Network, ArrowRight, BarChart3, Lock, Wifi
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import clsx from 'clsx';

interface PredictionResult {
    class: string;
    confidence: number;
    probabilities: number[];
}

export default function PredictionForm() {
    const [formData, setFormData] = useState({
        Protocol: '',
        Packet_Length: 0,
        Duration: 0,
        Source_Port: 0,
        Destination_Port: 0,
        Bytes_Sent: 0,
        Bytes_Received: 0,
        Flags: '',
        Flow_Packets_s: 0,
        Flow_Bytes_s: 0,
        Avg_Packet_Size: 0,
        Total_Fwd_Packets: 0,
        Total_Bwd_Packets: 0,
        Fwd_Header_Length: 0,
        Bwd_Header_Length: 0,
        Sub_Flow_Fwd_Bytes: 0,
        Sub_Flow_Bwd_Bytes: 0,
        Inbound: 0
    });

    const [metadata, setMetadata] = useState<{ protocols: string[], flags: string[] }>({ protocols: [], flags: [] });
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState('');

    const handleLiveScan = async () => {
        setScanning(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post('http://127.0.0.1:5001/analyze_live');

            // Update form with captured data
            if (response.data.captured_features) {
                setFormData(prev => ({
                    ...prev,
                    ...response.data.captured_features
                }));
            }

            setResult(response.data);
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Failed to scan network. Ensure backend is running with necessary privileges.';
            setError(msg);
            console.error(err);
        } finally {
            setScanning(false);
        }
    };

    useEffect(() => {
        axios.get('http://127.0.0.1:5001/metadata')
            .then(res => setMetadata(res.data))
            .catch(err => console.error("Failed to fetch metadata", err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post('http://127.0.0.1:5001/predict', formData);
            setResult(response.data);
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Failed to analyze threat. Ensure backend is running.';
            setError(msg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formSections = [
        {
            title: "Core Parameters",
            icon: Network,
            fields: [
                { name: 'Protocol', type: 'select', options: metadata.protocols, placeholder: 'Select Protocol' },
                { name: 'Flags', type: 'select', options: metadata.flags, placeholder: 'Select Flags' },
                { name: 'Inbound', type: 'select', options: ['0', '1'], labels: ['Outbound', 'Inbound'], placeholder: 'Direction' },
            ]
        },
        {
            title: "Traffic Metrics",
            icon: Activity,
            fields: [
                { name: 'Packet_Length', label: 'Packet Length' },
                { name: 'Duration', label: 'Duration (s)' },
                { name: 'Avg_Packet_Size', label: 'Avg Pkt Size' },
                { name: 'Bytes_Sent', label: 'Bytes Sent' },
                { name: 'Bytes_Received', label: 'Bytes Received' },
            ]
        },
        {
            title: "Flow Statistics",
            icon: Zap,
            fields: [
                { name: 'Flow_Packets_s', label: 'Flow Pkts/s' },
                { name: 'Flow_Bytes_s', label: 'Flow Bytes/s' },
                { name: 'Source_Port', label: 'Source Port' },
                { name: 'Destination_Port', label: 'Dest Port' },
            ]
        },
        {
            title: "Advanced Headers",
            icon: Server,
            fields: [
                { name: 'Total_Fwd_Packets', label: 'Total Fwd' },
                { name: 'Total_Bwd_Packets', label: 'Total Bwd' },
                { name: 'Fwd_Header_Length', label: 'Fwd Header' },
                { name: 'Bwd_Header_Length', label: 'Bwd Header' },
                { name: 'Sub_Flow_Fwd_Bytes', label: 'Sub Fwd Bytes' },
                { name: 'Sub_Flow_Bwd_Bytes', label: 'Sub Bwd Bytes' },
            ]
        }
    ];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

            {/* Form Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="xl:col-span-8 space-y-6"
            >
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                        {formSections.map((section, idx) => (
                            <Card key={section.title} className="border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                                <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <section.icon className="w-5 h-5" />
                                        </div>
                                        <CardTitle className="text-lg font-semibold">{section.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {section.fields.map((field: any) => (
                                            <div key={field.name} className="space-y-2 group">
                                                <Label
                                                    htmlFor={field.name}
                                                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider group-focus-within:text-primary transition-colors"
                                                >
                                                    {field.label || field.name}
                                                </Label>

                                                {field.type === 'select' ? (
                                                    <Select onValueChange={(val) => handleSelectChange(field.name, val)}>
                                                        <SelectTrigger id={field.name} className="bg-background/50 focus:ring-primary/20 transition-all">
                                                            <SelectValue placeholder={field.placeholder} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {field.options?.map((opt: string, i: number) => (
                                                                <SelectItem key={opt} value={opt}>
                                                                    {field.labels ? field.labels[i] : opt}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        id={field.name}
                                                        type="number"
                                                        name={field.name}
                                                        placeholder="0"
                                                        onChange={handleChange}
                                                        className="font-mono text-sm bg-background/50 focus:ring-primary/20 transition-all"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={loading || scanning}
                            onClick={handleLiveScan}
                            size="lg"
                            className="w-full md:w-auto min-w-[200px] h-12 text-base shadow-lg hover:shadow-xl transition-all border border-primary/20"
                        >
                            {scanning ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    <span>Scanning Network...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Wifi className="w-5 h-5" />
                                    <span>Scan My Network</span>
                                </div>
                            )}
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading || scanning}
                            size="lg"
                            className="w-full md:w-auto min-w-[200px] h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Analyzing Traffic...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    <span>Analyze Threat</span>
                                    <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>

            {/* Results Section - Sticky Sidebar */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="xl:col-span-4 xl:sticky xl:top-24 space-y-6"
            >
                <Card className="border-border/60 shadow-lg overflow-hidden relative min-h-[400px] flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-transparent pointer-events-none" />

                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Analysis Result
                        </CardTitle>
                        <CardDescription>Real-time threat classification</CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            {!result && !error ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center py-12 text-muted-foreground/50"
                                >
                                    <div className="relative w-24 h-24 mx-auto mb-6">
                                        <div className="absolute inset-0 border-4 border-muted-foreground/10 rounded-full animate-[spin_10s_linear_infinite]" />
                                        <div className="absolute inset-2 border-4 border-muted-foreground/10 rounded-full animate-[spin_7s_linear_infinite_reverse]" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Wifi className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium">Waiting for traffic data...</p>
                                </motion.div>
                            ) : error ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4"
                                >
                                    <Alert variant="destructive" className="border-red-500/20 bg-red-500/5">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Analysis Failed</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                </motion.div>
                            ) : result && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center relative">
                                        <div className={clsx(
                                            "inline-flex p-6 rounded-full mb-4 ring-8 ring-opacity-20",
                                            result.class === 'Normal'
                                                ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500"
                                                : "bg-red-500/10 text-red-500 ring-red-500"
                                        )}>
                                            {result.class === 'Normal' ? <CheckCircle className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
                                        </div>

                                        <h3 className={clsx(
                                            "text-3xl font-bold tracking-tight mb-2",
                                            result.class === 'Normal' ? "text-emerald-500" : "text-red-500"
                                        )}>
                                            {result.class === 'Normal' ? 'Normal Traffic' : result.class}
                                        </h3>

                                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                            <Lock className="w-3 h-3" />
                                            <span>Confidence Score</span>
                                        </div>
                                        <div className="text-5xl font-bold tracking-tighter mt-1 text-foreground">
                                            {(result.confidence * 100).toFixed(1)}<span className="text-2xl text-muted-foreground">%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Threat Level</span>
                                            <Badge variant={result.class === 'Normal' ? "outline" : "destructive"}>
                                                {result.class === 'Normal' ? 'Low' : 'Critical'}
                                            </Badge>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Action Required</span>
                                            <span className="font-medium">
                                                {result.class === 'Normal' ? 'None' : 'Immediate Response'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>

                    {result && (
                        <CardFooter className="bg-muted/30 border-t p-4">
                            <Button variant="outline" className="w-full text-xs" onClick={() => setResult(null)}>
                                Clear Result
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}
