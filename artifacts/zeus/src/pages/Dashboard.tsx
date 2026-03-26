import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Cpu, Database, Shield, Network, Settings, GitBranch, LogOut,
  Activity, CheckCircle2, AlertTriangle, Clock, Server, HardDrive,
  Menu, X, RefreshCw, ToggleLeft, ToggleRight, Upload
} from "lucide-react";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";

interface Module {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "online" | "degraded" | "maintenance";
  uptime: string;
  load: number;
  version: string;
  enabled: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu, Database, Shield, Network, Settings, GitBranch, Activity, HardDrive, Server,
};

const initialModules: Module[] = [
  { id: 1, name: "Core Engine", description: "Primary processing and orchestration layer", icon: Cpu, status: "online", uptime: "99.99%", load: 42, version: "4.2.1", enabled: true },
  { id: 2, name: "Data Nexus", description: "Distributed data synchronization service", icon: Database, status: "online", uptime: "99.97%", load: 58, version: "3.8.0", enabled: true },
  { id: 3, name: "Shield Protocol", description: "Zero-trust security and encryption framework", icon: Shield, status: "online", uptime: "100%", load: 23, version: "5.1.3", enabled: true },
  { id: 4, name: "Neural Mesh", description: "Adaptive routing and load balancing network", icon: Network, status: "degraded", uptime: "98.5%", load: 87, version: "2.9.7", enabled: true },
  { id: 5, name: "Config Matrix", description: "Dynamic configuration with hot-reload", icon: Settings, status: "online", uptime: "99.95%", load: 12, version: "3.4.2", enabled: true },
  { id: 6, name: "Versioning Layer", description: "Atomic state management with rollback", icon: GitBranch, status: "maintenance", uptime: "—", load: 0, version: "1.7.0", enabled: false },
  { id: 7, name: "Event Bus", description: "Real-time event streaming and processing", icon: Activity, status: "online", uptime: "99.98%", load: 35, version: "2.3.1", enabled: true },
  { id: 8, name: "Storage Engine", description: "Object storage and CDN distribution", icon: HardDrive, status: "online", uptime: "99.99%", load: 51, version: "4.0.5", enabled: true },
];

const statusConfig = {
  online: { label: "Online", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  degraded: { label: "Degraded", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  maintenance: { label: "Maintenance", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20", dot: "bg-gray-400" },
};

export default function Dashboard() {
  const API_BASE = import.meta.env.VITE_API_URL || "/api";
  const loading = useSimulatedLoading();
  const [, setLocation] = useLocation();
  const [modules, setModules] = useState(initialModules);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"modules" | "config">("modules");

  useEffect(() => {
    fetch(`${API_BASE}/zeus/topology`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.services) return;
        const statusMap: Record<string, Module["status"]> = {
          healthy: "online", degraded: "degraded", maintenance: "maintenance", warning: "degraded",
        };
        const typeIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
          Infrastructure: Cpu, Observability: Activity, Security: Shield,
          Compliance: Shield, Intelligence: Network, Platform: Server,
          Operations: HardDrive, "AI/ML": Network, Analytics: Activity,
        };
        const mapped: Module[] = data.services.map((s: any, i: number) => ({
          id: i + 1,
          name: s.name,
          description: `${s.type} service — ${s.instances || 1} instance(s)`,
          icon: typeIconMap[s.type] || Cpu,
          status: statusMap[s.status] || "online",
          uptime: s.uptime || "—",
          load: typeof s.load === "number" ? s.load : 0,
          version: `${s.instances || 1} inst`,
          enabled: s.status !== "maintenance",
        }));
        if (mapped.length > 0) setModules(mapped);
      })
      .catch((err) => console.error("[Zeus Dashboard] Failed to fetch topology:", err));
  }, [API_BASE]);

  function logout() {
    const token = localStorage.getItem("szl_token");
    if (token) fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  function toggleModule(id: number) {
    setModules(prev => prev.map(m => m.id === id ? {
      ...m,
      enabled: !m.enabled,
      status: !m.enabled ? "online" : "maintenance",
      load: !m.enabled ? Math.floor(Math.random() * 60) + 10 : 0,
      uptime: !m.enabled ? "99.9%" : "—",
    } : m));
  }

  if (loading) return <PageLoadingSkeleton />;

  const onlineCount = modules.filter(m => m.status === "online").length;
  const degradedCount = modules.filter(m => m.status === "degraded").length;
  const avgLoad = Math.round(modules.filter(m => m.enabled).reduce((sum, m) => sum + m.load, 0) / (modules.filter(m => m.enabled).length || 1));

  const stats = [
    { label: "Total Modules", value: modules.length, icon: Server, color: "from-yellow-500 to-amber-500" },
    { label: "Online", value: onlineCount, icon: CheckCircle2, color: "from-emerald-500 to-green-500" },
    { label: "Degraded", value: degradedCount, icon: AlertTriangle, color: "from-amber-500 to-orange-500" },
    { label: "Avg Load", value: `${avgLoad}%`, icon: Activity, color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-wider">ZEUS</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Architecture Console</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setSelectedTab("modules")} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${selectedTab === "modules" ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400" : "text-gray-400 hover:bg-white/5"}`}>
              Modules
            </button>
            <button onClick={() => setSelectedTab("config")} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${selectedTab === "config" ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400" : "text-gray-400 hover:bg-white/5"}`}>
              Configuration
            </button>
            <Link href="/logs" className="px-4 py-2 rounded-xl text-sm font-bold transition text-gray-400 hover:bg-white/5 flex items-center gap-2">
              Log Explorer
            </Link>
            <Link href="/dependencies" className="px-4 py-2 rounded-xl text-sm font-bold transition text-gray-400 hover:bg-white/5 flex items-center gap-2">
              Dependencies
            </Link>
            <Link href="/import" className="px-4 py-2 rounded-xl text-sm font-bold transition text-gray-400 hover:bg-white/5 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Import
            </Link>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition">
              <LogOut className="w-4 h-4" /> Disconnect
            </button>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-white/5 overflow-hidden">
              <div className="px-4 py-3 space-y-2">
                <button onClick={() => { setSelectedTab("modules"); setMobileMenu(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5">Modules</button>
                <button onClick={() => { setSelectedTab("config"); setMobileMenu(false); }} className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5">Configuration</button>
                <Link href="/logs" className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5">Log Explorer</Link>
                <Link href="/dependencies" className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5">Dependencies</Link>
                <Link href="/import" className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5"><Upload className="w-4 h-4" /> Import Center</Link>
                <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm">
                  <LogOut className="w-4 h-4" /> Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="border-b border-yellow-500/10 bg-yellow-500/[0.02] px-4 sm:px-6 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 uppercase tracking-wider">SZL Portfolio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400">Operational</span>
            <span className="text-gray-600">·</span>
            <span className="text-yellow-400">Readiness 94%</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500">0 Alerts</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-gray-500">
            <span>Uptime 99.99%</span>
            <span>·</span>
            <span>Last sync 4 min ago</span>
            <span>·</span>
            <span className="text-amber-400">Demo Mode</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
            {selectedTab === "modules" ? "SYSTEM MODULES" : "CONFIGURATION PANEL"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedTab === "modules" ? "Monitor and manage all Zeus architecture modules" : "Fine-tune system parameters and module settings"}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-yellow-500/20 transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl bg-yellow-500/[0.03] border border-yellow-500/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">System Health Overview</h3>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Nominal
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "CPU Usage", value: `${avgLoad}%`, bar: avgLoad, color: avgLoad > 70 ? "bg-amber-500" : "bg-emerald-500" },
              { label: "Memory", value: "4.2 GB", bar: 52, color: "bg-blue-500" },
              { label: "Network I/O", value: "1.8 Gbps", bar: 36, color: "bg-cyan-500" },
              { label: "Disk", value: "128 GB", bar: 22, color: "bg-violet-500" },
            ].map(h => (
              <div key={h.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{h.label}</p>
                  <p className="text-xs font-mono font-bold text-white">{h.value}</p>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${h.bar}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className={`h-full rounded-full ${h.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {selectedTab === "modules" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod, i) => {
              const sc = statusConfig[mod.status];
              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-yellow-500/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                        <mod.icon className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-white text-sm">{mod.name}</h3>
                        <p className="text-xs text-gray-500">{mod.description}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${sc.bg} ${sc.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${mod.status === "online" ? "animate-pulse" : ""}`} />
                      {sc.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-sm font-bold text-white">{mod.uptime}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                      <p className="text-xs text-gray-500">Load</p>
                      <p className={`text-sm font-bold ${mod.load > 80 ? "text-amber-400" : "text-white"}`}>{mod.load}%</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/[0.02]">
                      <p className="text-xs text-gray-500">Version</p>
                      <p className="text-sm font-bold text-white font-mono">{mod.version}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <h3 className="font-display font-bold text-white mb-4">Module Controls</h3>
              <div className="space-y-3">
                {modules.map(mod => (
                  <div key={mod.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <mod.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white">{mod.name}</span>
                      <span className="text-xs text-gray-500 font-mono">v{mod.version}</span>
                    </div>
                    <button onClick={() => toggleModule(mod.id)} className="text-gray-400 hover:text-white transition">
                      {mod.enabled ? <ToggleRight className="w-6 h-6 text-yellow-400" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <h3 className="font-display font-bold text-white mb-4">System Parameters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Max Concurrent Connections", value: "10,000" },
                  { label: "Request Timeout (ms)", value: "30,000" },
                  { label: "Cache TTL (seconds)", value: "3,600" },
                  { label: "Log Retention (days)", value: "90" },
                  { label: "Auto-Scale Threshold", value: "75%" },
                  { label: "Health Check Interval (s)", value: "15" },
                ].map(p => (
                  <div key={p.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">{p.label}</p>
                    <p className="text-sm font-bold text-white font-mono">{p.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-yellow-500/10 safe-bottom">
        <div className="flex items-center justify-around px-2 h-16">
          <button
            onClick={() => setSelectedTab("modules")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 rounded-lg transition-colors touch-target ${selectedTab === "modules" ? "text-yellow-400" : "text-gray-500"}`}
          >
            <Server className="w-5 h-5" />
            <span className="text-[10px] font-medium">Modules</span>
          </button>
          <button
            onClick={() => setSelectedTab("config")}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 rounded-lg transition-colors touch-target ${selectedTab === "config" ? "text-yellow-400" : "text-gray-500"}`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Config</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
