import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Linkedin, Twitter } from 'lucide-react';

const teamMembers = [
    {
        name: "Alex Chen",
        role: "Lead AI Engineer",
        bio: "Specializes in deep learning and neural network architectures for cybersecurity.",
        initials: "AC"
    },
    {
        name: "Sarah Johnson",
        role: "Security Analyst",
        bio: "10+ years of experience in network forensics and threat hunting.",
        initials: "SJ"
    },
    {
        name: "Michael Ross",
        role: "Full Stack Developer",
        bio: "Expert in building scalable web applications and real-time dashboards.",
        initials: "MR"
    },
    {
        name: "Emily Zhang",
        role: "Data Scientist",
        bio: "Focuses on feature engineering and dataset optimization for ML models.",
        initials: "EZ"
    },
    {
        name: "David Patel",
        role: "DevOps Engineer",
        bio: "Ensures smooth deployment and infrastructure security.",
        initials: "DP"
    }
];

export default function TeamPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Meet the Team</h1>
                <p className="text-xl text-muted-foreground">
                    The brilliant minds behind CyberThreat Detector.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                {teamMembers.map((member, i) => (
                    <Card key={i} className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] max-w-sm">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-4 relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                                <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                                    <AvatarFallback>{member.initials}</AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle className="text-xl">{member.name}</CardTitle>
                            <CardDescription className="text-primary font-medium">{member.role}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {member.bio}
                            </p>
                            <div className="flex justify-center gap-4 text-muted-foreground pt-2">
                                <Github className="w-5 h-5 hover:text-foreground cursor-pointer transition-colors" />
                                <Linkedin className="w-5 h-5 hover:text-foreground cursor-pointer transition-colors" />
                                <Twitter className="w-5 h-5 hover:text-foreground cursor-pointer transition-colors" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
