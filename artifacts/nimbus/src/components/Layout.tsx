import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { BrainCircuit, Activity, Cpu, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Predictions", icon: BrainCircuit },
    { path: "/alerts", label: "System Alerts", icon: Activity },
  ];

  function handleLogout() {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    window.location.href = `${import.meta.env.BASE_URL}login`;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden text-foreground selection:bg-primary/30">
      <div 
        className="absolute inset-0 z-[-2] opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/neural-bg.png)` }}
      />
      <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-background/50 via-background to-background" />

      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg border border-primary/30 text-primary">
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse-slow" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg sm:text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary glow-text">
                NIMBUS
              </h1>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground -mt-1">Predictive Intelligence</p>
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

          <div className="flex items-center gap-2">
            <button onClick={handleLogout} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Disconnect
            </button>
            <button className="md:hidden p-2 rounded-lg hover:bg-white/10 text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl"
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-display font-medium tracking-wide uppercase transition-colors",
                      isActive ? "text-primary bg-primary/10 border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
                <LogOut className="w-4 h-4" /> Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 relative z-10">
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
