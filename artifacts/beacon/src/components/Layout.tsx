import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, Server, Brain, MonitorPlay, Shield, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview Dashboard", icon: Activity },
  { href: "/zeus", label: "Zeus Core", icon: Server },
  { href: "/inca", label: "INCA Engine", icon: Brain },
  { href: "/dreamera", label: "Dream Era", icon: MonitorPlay },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex w-full relative">
      {/* Background Effect */}
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/beacon-mesh.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen'
        }}
      />

      {/* Sidebar */}
      <aside className="w-72 fixed inset-y-0 left-0 z-20 glass-panel border-r border-border/50 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,191,255,0.4)]">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-widest text-white glow-text">BEACON</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-display">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-[inset_0_0_20px_rgba(0,191,255,0.1)]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-primary" : "")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-background/50 rounded-xl p-4 border border-border/50 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">SYSTEM ONLINE</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 relative z-10 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-20 glass-panel border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 text-muted-foreground">
            <Search className="w-5 h-5" />
            <input 
              type="text" 
              placeholder="Query telemetry data..." 
              className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-muted-foreground/50 text-foreground font-mono focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-muted-foreground hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-border/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">S. Lutar</p>
                <p className="text-xs text-primary font-mono">EMPEROR</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/30 flex items-center justify-center font-display font-bold text-lg">
                SL
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
