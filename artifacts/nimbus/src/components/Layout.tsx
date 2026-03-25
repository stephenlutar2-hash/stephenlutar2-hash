import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { BrainCircuit, Activity, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Predictions", icon: BrainCircuit },
    { path: "/alerts", label: "System Alerts", icon: Activity },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden text-foreground selection:bg-primary/30">
      {/* Background image if exists */}
      <div 
        className="absolute inset-0 z-[-2] opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/neural-bg.png)` }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-background/50 via-background to-background" />

      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/30 text-primary">
              <Cpu className="w-6 h-6 animate-pulse-slow" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary glow-text">
                NIMBUS
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-1">Predictive Intelligence Core</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border">
            {navItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "relative px-4 py-2 rounded-md text-sm font-display font-medium tracking-wide uppercase transition-colors flex items-center gap-2",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-md z-0"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 z-10 relative" />
                  <span className="z-10 relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
