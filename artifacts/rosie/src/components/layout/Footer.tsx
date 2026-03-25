import { Shield, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-card/30 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-xl tracking-wider">ROSIE.</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Next-generation autonomous security monitoring. Protecting your digital empire 24/7/365 without sleeping.
            </p>
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground cursor-default" title="Twitter">
                <Twitter className="w-4 h-4" />
              </span>
              <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground cursor-default" title="GitHub">
                <Github className="w-4 h-4" />
              </span>
              <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground cursor-default" title="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a></li>
              <li><a href="#command-center" className="text-sm text-muted-foreground hover:text-primary transition-colors">Command Center</a></li>
              <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="/apps-showcase/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><a href="/apps-showcase/catalog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Platform Catalog</a></li>
              <li><a href="/readiness-report/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Readiness Report</a></li>
              <li><a href="/lyte/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Lyte Command Center</a></li>
              <li><a href="/beacon/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Beacon Telemetry</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">Portfolio</h4>
            <ul className="space-y-4">
              <li><a href="/aegis/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Aegis Security</a></li>
              <li><a href="/nimbus/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Nimbus Analytics</a></li>
              <li><a href="/carlota-jo/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Carlota Jo Consulting</a></li>
              <li><a href="/career/" className="text-sm text-muted-foreground hover:text-primary transition-colors">About the Founder</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} SZL Holdings. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 glow-shadow animate-pulse"></span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
