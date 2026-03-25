import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-serif font-bold gold-gradient mb-4">404</h1>
        <p className="text-muted-foreground text-lg mb-8">Page not found</p>
        <Link href="/" className="text-primary hover:underline">Return to Home</Link>
      </div>
    </div>
  );
}
