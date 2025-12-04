import PredictionForm from '@/app/components/PredictionForm';
import { Activity } from 'lucide-react';

export default function AnalyzePage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto mb-12 text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4">
                    <Activity className="w-8 h-8" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Network Traffic Analysis</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Enter network packet details below to run our AI detection model.
                    Results are generated in real-time.
                </p>
            </div>

            <PredictionForm />
        </div>
    );
}
