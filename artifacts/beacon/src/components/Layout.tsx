import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Activity, Server, Brain, MonitorPlay, Shield, Search, Bell, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview Dashboard", icon: Activity },
  { href: "/zeus", label: "Zeus Core", icon: Server },
  { href: "/inca", label: "INCA Engine", icon: Brain },
  { href: "/dreamera", label: "Dream Era", icon: MonitorPlay },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    window.location.href = `${import.meta.env.BASE_URL}login`;
  }

  return (
    <div className="min-h-screen flex w-full relative">
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/beacon-mesh.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen'
        }}
      />

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "w-72 fixed inset-y-0 left-0 z-40 glass-panel border-r border-border/50 flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,191,255,0.4)]">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-widest text-white glow-text">BEACON</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-display">Command Center</p>
            </div>
          </div>
          <button className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setSidebarOpen(false)}
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

        <div className="p-4 mt-auto space-y-3">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-colors text-sm">
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
          <div className="bg-background/50 rounded-xl p-4 border border-border/50 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">SYSTEM ONLINE</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 relative z-10 flex flex-col min-h-screen">
        <header className="h-16 sm:h-20 glass-panel border-b border-border/50 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="md:hidden p-2 rounded-lg hover:bg-white/10 text-muted-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-4 text-muted-foreground">
              <Search className="w-5 h-5" />
              <input 
                type="text" 
                placeholder="Query telemetry data..." 
                className="bg-transparent border-none outline-none text-sm w-48 lg:w-64 placeholder:text-muted-foreground/50 text-foreground font-mono focus:ring-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="relative text-muted-foreground hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
            </button>
            <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-border/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">S. Lutar</p>
                <p className="text-xs text-primary font-mono">EMPEROR</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/30 flex items-center justify-center font-display font-bold text-sm sm:text-lg">
                SL
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
