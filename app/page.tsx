import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Shield, Zap, Lock, ArrowRight, BarChart3, Globe } from 'lucide-react';


export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 relative overflow-hidden border-b bg-card/30">


        <div className="container px-4 md:px-6 mx-auto text-center space-y-8 relative z-10">


          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-6 duration-500 max-w-4xl mx-auto">
            Next-Gen Network <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-purple-600">
              Threat Detection
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
            Secure your infrastructure with our advanced CNN-based intrusion detection system.
            Instantly analyze traffic patterns to identify potential threats with 99.9% accuracy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Link href="/analyze">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                Start Analysis <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>

          </div>
        </div>
      </section>


    </div>
  );
}
