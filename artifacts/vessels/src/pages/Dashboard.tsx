import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Anchor, BarChart3, Navigation, Box, Bell, Brain, Map, LogOut, ChevronRight } from "lucide-react";
import OperationsView from "@/components/OperationsView";
import RoutesView from "@/components/RoutesView";
import AssetsView from "@/components/AssetsView";
import AlertsView from "@/components/AlertsView";
import IntelligenceView from "@/components/IntelligenceView";
import MapView from "@/components/MapView";

const navItems = [
  { key: "operations", label: "Operations", icon: BarChart3 },
  { key: "routes", label: "Routes", icon: Navigation },
  { key: "assets", label: "Assets", icon: Box },
  { key: "map", label: "Map", icon: Map },
  { key: "alerts", label: "Alerts", icon: Bell },
  { key: "intelligence", label: "Intelligence", icon: Brain },
];

export default function Dashboard() {
  const [, params] = useRoute("/dashboard/:view?");
  const [, setLocation] = useLocation();
  const activeView = params?.view || "operations";
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function handleLogout() {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/");
  }

  const views: Record<string, React.ReactNode> = {
    operations: <OperationsView />,
    routes: <RoutesView />,
    assets: <AssetsView />,
    map: <MapView />,
    alerts: <AlertsView />,
    intelligence: <IntelligenceView />,
  };

  return (
    <div className="min-h-screen flex">
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} shrink-0 glass-panel border-r border-white/5 flex flex-col transition-all duration-200`}>
        <div className="h-16 flex items-center gap-3 px-4 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shrink-0">
            <Anchor className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && <span className="font-display font-bold text-sm tracking-wider">VESSELS</span>}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1">
          {navItems.map(item => {
            const active = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setLocation(`/dashboard/${item.key}`)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-white/5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
          >
            <ChevronRight className={`w-4 h-4 shrink-0 transition ${sidebarOpen ? "rotate-180" : ""}`} />
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-[1440px] mx-auto">
          {views[activeView] || views.operations}
        </div>
      </main>
    </div>
  );
}
