export default function Footer() {
    return (
        <footer className="border-t py-12 mt-auto bg-card/50">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
                <p>&copy; 2025 CyberThreat Detector. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
                </div>
            </div>
        </footer>
    );
}
