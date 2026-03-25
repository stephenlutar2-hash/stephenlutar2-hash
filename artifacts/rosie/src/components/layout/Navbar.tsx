import { Link } from "wouter";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary p-[1px]">
              <div className="w-full h-full bg-background rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
            </div>
            <Link href="/" className="font-display font-bold text-2xl tracking-wider text-foreground">
              ROSIE<span className="text-primary">.</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#projects" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Protected Projects</a>
            <a href="#command-center" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Command Center</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</a>
            
            <button className="relative group overflow-hidden rounded-lg px-6 py-2.5 bg-primary/10 text-primary font-display font-semibold text-sm border border-primary/30 transition-all hover:bg-primary hover:text-primary-foreground glow-shadow">
              <span className="relative z-10">Access Demo</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-foreground p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
              <a onClick={() => setIsOpen(false)} href="#features" className="block px-3 py-4 text-base font-medium text-muted-foreground hover:text-primary border-b border-white/5">Features</a>
              <a onClick={() => setIsOpen(false)} href="#projects" className="block px-3 py-4 text-base font-medium text-muted-foreground hover:text-primary border-b border-white/5">Projects</a>
              <a onClick={() => setIsOpen(false)} href="#command-center" className="block px-3 py-4 text-base font-medium text-muted-foreground hover:text-primary border-b border-white/5">Command Center</a>
              <a onClick={() => setIsOpen(false)} href="#pricing" className="block px-3 py-4 text-base font-medium text-muted-foreground hover:text-primary border-b border-white/5">Pricing</a>
              <button className="mt-6 w-full rounded-lg px-6 py-3 bg-primary text-primary-foreground font-display font-semibold text-sm glow-shadow">
                Access Demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
