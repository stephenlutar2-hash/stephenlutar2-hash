import { ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@szl-holdings/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md text-center glass-panel p-12 rounded-2xl border border-destructive/20">
        <ShieldAlert className="h-20 w-20 text-destructive mx-auto mb-6" />
        <h1 className="text-4xl font-display font-bold mb-4 tracking-widest uppercase">404 - Breach</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          The requested sector does not exist in the Aegis database. Access denied.
        </p>
        <Link href="/" className="inline-block">
          <Button variant="glow" className="w-full">
            Return to Core
          </Button>
        </Link>
      </div>
    </div>
  );
}
