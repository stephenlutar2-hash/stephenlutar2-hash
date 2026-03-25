import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@workspace/ui";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        isScrolled 
          ? "bg-background/80 backdrop-blur-lg border-b border-border/50 py-4" 
          : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-primary/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
            <span className="font-display font-bold text-black text-xl">L</span>
          </div>
          <span className="font-display font-bold text-xl tracking-[0.2em] text-foreground">LUTAR</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-sm font-sans tracking-widest text-muted-foreground hover:text-primary transition-colors uppercase">Vision</a>
          <a href="#empire" className="text-sm font-sans tracking-widest text-muted-foreground hover:text-primary transition-colors uppercase">Empire</a>
          <a href="#holdings" className="text-sm font-sans tracking-widest text-muted-foreground hover:text-primary transition-colors uppercase">Holdings</a>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-sm border border-primary/50 text-primary text-sm font-sans tracking-widest uppercase hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300">
            Access System
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border p-6 flex flex-col gap-6 md:hidden">
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-sans tracking-widest text-foreground uppercase">Vision</a>
          <a href="#empire" onClick={() => setMobileMenuOpen(false)} className="text-sm font-sans tracking-widest text-foreground uppercase">Empire</a>
          <a href="#holdings" onClick={() => setMobileMenuOpen(false)} className="text-sm font-sans tracking-widest text-foreground uppercase">Holdings</a>
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-primary text-sm font-sans tracking-widest uppercase">
            Access System
          </Link>
        </div>
      )}
    </nav>
  );
}
