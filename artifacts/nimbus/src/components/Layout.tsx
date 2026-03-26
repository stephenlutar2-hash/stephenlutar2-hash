import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BrainCircuit, Activity, Cpu, Upload, TrendingDown, Zap, Link2, BarChart3 } from "lucide-react";
import { LayoutShell, type NavItem } from "@szl-holdings/platform";

const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Predictions", icon: BrainCircuit },
  { path: "/alerts", label: "System Alerts", icon: Activity },
  { path: "/drift", label: "Prediction Drift", icon: TrendingDown },
  { path: "/anomalies", label: "Anomaly Timeline", icon: Zap },
  { path: "/correlation", label: "Alert Correlation", icon: Link2 },
  { path: "/confidence", label: "Confidence", icon: BarChart3 },
  { path: "/import", label: "Import Center", icon: Upload },
];

function WouterLink({ href, className, onClick, children }: { href: string; className?: string; onClick?: () => void; children: ReactNode }) {
  return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden text-foreground selection:bg-primary/30">
      <div 
        className="absolute inset-0 z-[-2] opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/neural-bg.png)` }}
      />
      <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-background/50 via-background to-background" />

      <LayoutShell
        currentPath={location}
        navItems={NAV_ITEMS}
        brandName="NIMBUS"
        brandSubtitle="Predictive Intelligence"
        brandIcon={Cpu}
        linkComponent={WouterLink}
        onLogout={() => { window.location.href = `${import.meta.env.BASE_URL}login`; }}
        variant="topbar"
      >
        {children}
      </LayoutShell>
    </div>
  );
}
