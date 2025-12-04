'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Shield, Activity, Users, Home } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Analyze Traffic', href: '/analyze', icon: Activity },
        { name: 'Our Team', href: '/team', icon: Users },
    ];

    return (
        <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative w-10 h-10 transition-transform group-hover:scale-105 duration-300">
                        <Image
                            src="/logo.png"
                            alt="CyberThreat Detector Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-lg leading-tight tracking-tight text-foreground">
                            CyberThreat<span className="text-primary">Detector</span>
                        </h1>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                            AI Security Guard
                        </span>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
