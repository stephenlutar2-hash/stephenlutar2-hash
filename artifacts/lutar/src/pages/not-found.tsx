import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-8xl font-display font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-sans uppercase tracking-widest text-white mb-6">Sector Not Found</h2>
        <p className="text-muted-foreground font-sans max-w-md mx-auto mb-8">
          The coordinates you entered do not exist within the Lutar architecture. Verify the address and try again.
        </p>
        <Link href="/" className="inline-flex items-center justify-center h-11 px-8 rounded-sm bg-primary text-primary-foreground font-sans text-sm font-semibold tracking-widest uppercase hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
          Return to Command
        </Link>
      </div>
    </div>
  );
}
