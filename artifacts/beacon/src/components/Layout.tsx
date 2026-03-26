import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, Server, Brain, MonitorPlay, Shield, Search, Bell, Upload, LayoutGrid, Grid3x3, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { LayoutShell, type NavItem } from "@szl-holdings/platform";

const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Overview Dashboard", icon: Activity },
  { path: "/metric-tiles", label: "Metric Tiles", icon: LayoutGrid },
  { path: "/health-matrix", label: "Health Matrix", icon: Grid3x3 },
  { path: "/trend-forecasting", label: "Trend Forecast", icon: TrendingUp },
  { path: "/anomaly-correlation", label: "Anomaly Correlation", icon: AlertTriangle },
  { path: "/zeus", label: "Zeus Core", icon: Server },
  { path: "/inca", label: "INCA Engine", icon: Brain },
  { path: "/dreamera", label: "Dream Era", icon: MonitorPlay },
  { path: "/extensions", label: "Extensions", icon: Zap },
  { path: "/import", label: "Import Center", icon: Upload },
];

function WouterLink({ href, className, onClick, children }: { href: string; className?: string; onClick?: () => void; children: ReactNode }) {
  return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
}

function HeaderContent() {
  return (
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
  );
}

function StatusIndicator() {
  return (
    <div className="p-4 mt-auto">
      <div className="bg-background/50 rounded-xl p-4 border border-border/50 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-mono text-muted-foreground">SYSTEM ONLINE</span>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <>
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/beacon-mesh.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen'
        }}
      />
      <LayoutShell
        currentPath={location}
        navItems={NAV_ITEMS}
        brandName="BEACON"
        brandSubtitle="Command Center"
        brandIcon={Shield}
        linkComponent={WouterLink}
        headerRight={<HeaderContent />}
        sidebar={<StatusIndicator />}
        onLogout={() => { window.location.href = `${import.meta.env.BASE_URL}login`; }}
        variant="sidebar"
      >
        {children}
      </LayoutShell>
    </>
  );
}
