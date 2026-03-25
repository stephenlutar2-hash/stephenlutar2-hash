import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-display font-black text-primary/30">404</h1>
        <p className="text-muted-foreground">Page not found.</p>
        <button onClick={() => setLocation("/")} className="text-primary hover:underline text-sm">Return to Showcase</button>
      </div>
    </div>
  );
}
