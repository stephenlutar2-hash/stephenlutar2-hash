import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-4 glass-panel rounded-xl border border-border/50 p-8">
        <div className="flex mb-4 gap-3 items-center">
          <AlertCircle className="h-8 w-8 text-red-400 shrink-0" />
          <h1 className="text-2xl font-display font-bold text-white">404 Page Not Found</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
    </div>
  );
}
