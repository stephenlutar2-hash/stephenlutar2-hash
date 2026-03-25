import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center">
      <div className="glass-panel p-8 rounded-xl text-center max-w-md border-destructive/20">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive animate-pulse" />
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">SECTOR NOT FOUND</h1>
        <p className="text-sm text-muted-foreground mb-6 font-mono">
          ERROR 404: The requested neural pathway does not exist in the current sector matrix.
        </p>
        <Link 
          href="/" 
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-display font-semibold text-primary-foreground shadow hover:bg-primary/90 uppercase tracking-widest transition-all glow-text"
        >
          Return to Core
        </Link>
      </div>
    </div>
  );
}
