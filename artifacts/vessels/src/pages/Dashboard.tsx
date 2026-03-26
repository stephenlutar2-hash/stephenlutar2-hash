import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Anchor,
  LayoutDashboard,
  Activity,
  Server,
  ScrollText,
  Users,
  ShieldCheck,
  Brain,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import CommandCenter from "./CommandCenter";
import FleetAPM from "./FleetAPM";
import Infrastructure from "./Infrastructure";
import Logs from "./Logs";
import DigitalExperience from "./DigitalExperience";
import Synthetics from "./Synthetics";
import AppliedIntelligence from "./AppliedIntelligence";

type Section = "command-center" | "apm" | "infrastructure" | "logs" | "experience" | "synthetics" | "intelligence";

const SECTIONS: { id: Section; label: string; icon: any; color: string }[] = [
  { id: "command-center", label: "Command Center", icon: LayoutDashboard, color: "text-cyan-400" },
  { id: "apm", label: "Fleet APM", icon: Activity, color: "text-emerald-400" },
  { id: "infrastructure", label: "Infrastructure", icon: Server, color: "text-orange-400" },
  { id: "logs", label: "Logs", icon: ScrollText, color: "text-blue-400" },
  { id: "experience", label: "Digital Experience", icon: Users, color: "text-purple-400" },
  { id: "synthetics", label: "Synthetics", icon: ShieldCheck, color: "text-amber-400" },
  { id: "intelligence", label: "Applied Intelligence", icon: Brain, color: "text-rose-400" },
];

const SECTION_MAP: Record<Section, React.ComponentType> = {
  "command-center": CommandCenter,
  apm: FleetAPM,
  infrastructure: Infrastructure,
  logs: Logs,
  experience: DigitalExperience,
  synthetics: Synthetics,
  intelligence: AppliedIntelligence,
};

function statusDotColor(status: string) {
  if (status === "healthy") return "bg-emerald-400";
  if (status === "warning") return "bg-amber-400";
  return "bg-red-400";
}

export default function Dashboard() {
  const [, params] = useRoute("/dashboard/:section");
  const [, setLocation] = useLocation();
  const currentSection = (params?.section as Section) || "command-center";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: healthData } = useQuery({
    queryKey: ["vessels-pillar-health"],
    queryFn: () => fetch("/api/vessels/command-center").then(r => r.json()),
    staleTime: 30000,
  });

  const pillarHealth: Record<string, { status: string; score: number; alerts: number }> = {};
  if (healthData?.pillars) {
    for (const p of healthData.pillars) {
      pillarHealth[p.id] = { status: p.status, score: p.score, alerts: p.alerts };
    }
  }

  const ActivePage = SECTION_MAP[currentSection] || CommandCenter;
  const activeInfo = SECTIONS.find(s => s.id === currentSection) || SECTIONS[0];
  const username = localStorage.getItem("szl_user") || "Operator";

  function handleLogout() {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  function navTo(id: Section) {
    setLocation(`/dashboard/${id}`);
    setMobileOpen(false);
  }

  function renderNavItem(item: typeof SECTIONS[0], isCollapsed: boolean) {
    const health = pillarHealth[item.id];
    return (
      <button
        key={item.id}
        onClick={() => navTo(item.id)}
        title={isCollapsed ? item.label : undefined}
        className={`w-full flex items-center gap-3 ${isCollapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"} rounded-lg transition-all duration-200 ${
          currentSection === item.id
            ? "bg-white/[0.08] border border-white/10"
            : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-300 border border-transparent"
        }`}
      >
        <div className="relative shrink-0">
          <item.icon size={18} className={currentSection === item.id ? item.color : ""} />
          {health && (
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${statusDotColor(health.status)} ${health.status !== "healthy" ? "animate-pulse" : ""}`} />
          )}
        </div>
        {!isCollapsed && (
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className={`text-sm font-medium truncate ${currentSection === item.id ? "text-white" : ""}`}>{item.label}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {health && health.alerts > 0 && (
                <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded min-w-[16px] text-center">
                  {health.alerts}
                </span>
              )}
              {health && (
                <span className={`text-[9px] font-mono ${health.score >= 90 ? "text-emerald-500" : health.score >= 70 ? "text-amber-500" : "text-red-500"}`}>
                  {health.score}
                </span>
              )}
            </div>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#080b12] text-white overflow-hidden">
      <aside className={`${collapsed ? "w-[72px]" : "w-64"} border-r border-cyan-500/10 bg-[#0a0e17] flex-col hidden md:flex transition-all duration-300`}>
        <div className={`h-16 flex items-center ${collapsed ? "justify-center" : "px-5"} border-b border-cyan-500/10`}>
          {collapsed ? (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
              <Anchor className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Anchor className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-lg tracking-[0.15em] text-white">VESSELS</span>
                <p className="text-[10px] text-cyan-500/60 tracking-widest uppercase -mt-0.5">Six Pillars</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-2 flex-1 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 mb-3 mt-2">
              <p className="text-[10px] tracking-[0.2em] text-gray-600 uppercase">Observability</p>
            </div>
          )}

          {SECTIONS.map(item => renderNavItem(item, collapsed))}
        </div>

        <div className="p-2 border-t border-cyan-500/10 space-y-0.5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-white/[0.04] hover:text-gray-400 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span className="text-sm">Collapse</span></>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 ${collapsed ? "justify-center px-0" : "px-3"} py-2.5 rounded-lg text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-colors`}
          >
            <LogOut size={18} />
            {!collapsed && <span className="text-sm font-medium">Disconnect</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0a0e17] border-r border-cyan-500/10 flex flex-col z-10">
            <div className="h-16 flex items-center justify-between px-5 border-b border-cyan-500/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                  <Anchor className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg tracking-[0.15em]">VESSELS</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-2 flex-1 space-y-0.5">
              {SECTIONS.map(item => renderNavItem(item, false))}
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-14 border-b border-cyan-500/10 bg-[#0a0e17]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-400 hover:text-white">
              <Menu size={20} />
            </button>
            <h1 className="text-base font-display font-semibold text-white tracking-wide">
              {activeInfo.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center text-[11px] font-mono text-gray-500 bg-white/[0.03] px-3 py-1.5 rounded border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
              LIVE
            </div>
            <button className="text-gray-500 hover:text-white transition-colors relative">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
              <span className="font-display font-bold text-xs text-white">
                {username[0]?.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <div className="border-b border-cyan-500/10 bg-cyan-500/[0.02] px-4 md:px-6 py-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 uppercase tracking-wider">SZL Portfolio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400">Operational</span>
              <span className="text-gray-600">·</span>
              <span className="text-cyan-400">Readiness 85%</span>
              <span className="text-gray-600">·</span>
              <span className="text-amber-400">2 Alerts</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-gray-500">
              <span>Uptime 99.90%</span>
              <span>·</span>
              <span>Last sync 3 min ago</span>
              <span>·</span>
              <span className="text-emerald-400">Live</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <ActivePage />
        </div>
      </main>
    </div>
  );
}
