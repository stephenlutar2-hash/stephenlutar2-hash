import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center max-w-md mx-4 p-10 rounded-xl luxury-border bg-card">
        <h1 className="text-5xl font-serif font-bold gold-gradient mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-6">Page not found</p>
        <Link
          href="/"
          className="btn-primary inline-flex items-center px-6 py-3 font-medium text-sm tracking-wider uppercase rounded-sm"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
