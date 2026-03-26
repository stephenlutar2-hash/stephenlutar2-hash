import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Shield, Activity, BarChart3, Play, Square, Eye,
  FileText, Zap, Clock, Server, Network, LogOut, Bell,
  AlertTriangle, ChevronRight, Settings, LayoutDashboard,
  Target, Users, Cpu, Upload,
} from "lucide-react";
import { Badge } from "@szl-holdings/ui";
import { fetchScenarios, startScenario, stopScenario, fetchLiveEvents, fetchDetectionCoverage, downloadExport } from "@/lib/api";
import SimulationTimeline from "@/components/SimulationTimeline";
import DetectionMatrix from "@/components/DetectionMatrix";
import ScenarioComparison from "@/components/ScenarioComparison";
import ResponseScoring from "@/components/ResponseScoring";
import CrossAppSummary from "@/components/CrossAppSummary";

interface Scenario {
  id: string; name: string; category: string; severity: string; description: string;
  expectedDetections: string[]; status: string; estimatedDuration: string;
}

interface LiveEvent {
  id: string; timestamp: string; scenarioName: string; type: string;
  severity: string; source: string; destination: string; detail: string; detected: boolean;
}

interface DetectionData {
  totalEvents: number; detectedEvents: number; detectionRate: number;
  falsePositives: number; falseNegatives: number; confidenceScore: number;
}

const severityColor: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const navItems = [
  { icon: LayoutDashboard, label: "Command Center", path: "/dashboard" },
  { icon: Target, label: "Scenario Catalog", path: "/scenarios" },
  { icon: Eye, label: "Detection Validation", path: "/detections" },
  { icon: Shield, label: "Response Trainer", path: "/response-trainer" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Upload, label: "Import Center", path: "/import" },
];

type DashView = "command" | "timeline" | "matrix" | "compare" | "trainer";

export default function Dashboard() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [detections, setDetections] = useState<DetectionData | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [, setLocation] = useLocation();
  const [dashView, setDashView] = useState<DashView>("command");

  const loadData = useCallback(async () => {
    try {
      const [s, e, d] = await Promise.all([fetchScenarios(), fetchLiveEvents(), fetchDetectionCoverage()]);
      setScenarios(s); setEvents(e); setDetections(d);
    } catch {} finally { setInitialLoaded(true); }
  }, []);

  useEffect(() => { loadData(); const interval = setInterval(loadData, 5000); return () => clearInterval(interval); }, [loadData]);
  useEffect(() => { const timer = setInterval(() => { setCurrentTime(new Date().toLocaleTimeString("en-US", { hour12: false }) + " UTC"); }, 1000); return () => clearInterval(timer); }, []);

  async function toggleScenario(s: Scenario) {
    if (s.status === "running") await stopScenario(s.id);
    else await startScenario(s.id);
    loadData();
  }

  function handleLogout() {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  const username = localStorage.getItem("szl_user") || "Operator";
  const runningCount = scenarios.filter((s) => s.status === "running").length;

  return (
    <div className="min-h-screen flex bg-[#0c0a08] text-white overflow-hidden">
      <aside className="w-64 border-r border-orange-500/10 bg-[#0a0908] flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-orange-500/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.3)]">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-[0.2em] text-white">FIRESTORM</span>
          </Link>
        </div>
        <div className="p-4 flex-1 space-y-1">
          <div className="px-2 mb-4 mt-2">
            <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">Simulation Lab</p>
          </div>
          {navItems.map((item) => (
            <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${item.path === "/dashboard" ? "bg-orange-500/10 text-orange-500 shadow-[inset_0_0_20px_rgba(249,115,22,0.05)]" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}>
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-orange-500/10 space-y-2">
          <CrossAppSummary />
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium">Disconnect</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 border-b border-orange-500/10 bg-[#0a0908]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-semibold text-white tracking-wide">Simulation Command Center</h1>
            <Badge className="hidden sm:inline-flex bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">LAB MODE</Badge>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center text-xs font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded border border-white/10">
              <Activity className="w-3 h-3 text-orange-500 mr-2" />
              {currentTime || "00:00:00 UTC"}
            </div>
            <button className="text-gray-500 hover:text-white transition-colors relative">
              <Bell size={20} />
              {runningCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />}
            </button>
            <div className="w-9 h-9 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">{username[0]?.toUpperCase()}</span>
            </div>
          </div>
        </header>

        <div className="border-b border-orange-500/10 bg-orange-500/[0.02] px-6 py-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 uppercase tracking-wider">SZL Portfolio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400">Operational</span>
              <span className="text-gray-600">·</span>
              <span className="text-orange-400">Readiness 78%</span>
              <span className="text-gray-600">·</span>
              <span className="text-amber-400">3 Alerts</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-gray-500">
              <span>Uptime 99.82%</span><span>·</span><span>Last sync 5 min ago</span><span>·</span><span className="text-amber-400">Staging</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-6 pt-4 pb-2 overflow-x-auto">
          {([
            { id: "command" as DashView, label: "Command Center", icon: LayoutDashboard },
            { id: "timeline" as DashView, label: "Attack Timeline", icon: Activity },
            { id: "matrix" as DashView, label: "Detection Matrix", icon: Target },
            { id: "compare" as DashView, label: "Compare Runs", icon: BarChart3 },
            { id: "trainer" as DashView, label: "Response Trainer", icon: Shield },
          ]).map(v => (
            <button
              key={v.id}
              onClick={() => setDashView(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                dashView === v.id ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10"
              }`}
            >
              <v.icon className="w-3.5 h-3.5" /> {v.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6 flex-1">
          {!initialLoaded ? (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                    <div className="h-3 w-20 bg-white/5 rounded mb-4" />
                    <div className="h-8 w-16 bg-white/10 rounded mb-2" />
                    <div className="h-2 w-24 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : (<>
            {dashView === "command" && (<>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Active Scenarios", value: String(runningCount), sub: `${scenarios.length} total available`, icon: Target, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                  { label: "Detection Coverage", value: detections ? `${detections.detectionRate}%` : "—", sub: `${detections?.detectedEvents || 0} of ${detections?.totalEvents || 0} detected`, icon: Eye, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
                  { label: "Mean Response Time", value: "4.2 min", sub: "Across all drills", icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                  { label: "Synthetic Events", value: String(events.length), sub: "Processed this session", icon: Zap, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className={`p-5 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm hover:scale-[1.02] transition-transform cursor-pointer shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-xs tracking-wider text-gray-500 uppercase">{stat.label}</p>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <h3 className={`text-3xl font-display font-bold mb-1 ${stat.color}`}>{stat.value}</h3>
                    <p className="text-xs text-gray-500">{stat.sub}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-white tracking-wide uppercase text-sm">Scenario Catalog</h3>
                    <Link href="/scenarios" className="text-xs text-orange-500 hover:underline">View All</Link>
                  </div>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {scenarios.map((s) => (
                      <motion.div key={s.id} whileHover={{ scale: 1.01 }}
                        className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs tracking-widest uppercase text-gray-500">{s.category}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${severityColor[s.severity]}`}>{s.severity}</span>
                        </div>
                        <p className="text-sm font-medium text-white mb-2">{s.name}</p>
                        {s.status === "running" && (
                          <div className="mb-2">
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 30, ease: "linear", repeat: Infinity }} />
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" /></span>
                              <span className="text-[9px] text-emerald-400 font-mono">EXECUTING</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500">{s.estimatedDuration}</span>
                          <button onClick={() => toggleScenario(s)} className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 transition ${s.status === "running" ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"}`}>
                            {s.status === "running" ? <><Square className="w-3 h-3" /> Stop</> : <><Play className="w-3 h-3" /> Start</>}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-white tracking-wide uppercase text-sm">Live Synthetic Event Feed</h3>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" /></span>
                      <span className="text-xs text-orange-500 font-mono">LIVE</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden max-h-[500px] overflow-y-auto">
                    <AnimatePresence initial={false}>
                      {events.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                          <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No active events. Start a scenario to generate synthetic telemetry.</p>
                        </div>
                      ) : (
                        events.slice(0, 20).map((evt) => (
                          <motion.div key={evt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${severityColor[evt.severity]}`}>{evt.severity}</span>
                                  <span className="text-[10px] text-gray-500 font-mono">{new Date(evt.timestamp).toLocaleTimeString("en-US", { hour12: false })}</span>
                                  <span className="text-[10px] text-gray-600 uppercase">{evt.type}</span>
                                </div>
                                <p className="text-sm text-gray-300 truncate">{evt.detail}</p>
                                <p className="text-[10px] text-gray-600 mt-0.5">{evt.source} → {evt.destination}</p>
                              </div>
                              <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${evt.detected ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                                {evt.detected ? "DETECTED" : "MISSED"}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                  <h3 className="font-display font-bold text-white tracking-wide uppercase text-sm">Detection Summary</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Detection Rate", value: detections ? `${detections.detectionRate}%` : "—", color: "text-emerald-400" },
                      { label: "False Positives", value: String(detections?.falsePositives ?? 0), color: "text-amber-400" },
                      { label: "False Negatives", value: String(detections?.falseNegatives ?? 0), color: "text-red-400" },
                      { label: "Confidence Score", value: String(detections?.confidenceScore ?? "—"), color: "text-cyan-400" },
                    ].map((m, i) => (
                      <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-white/10 transition-all">
                        <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-1">{m.label}</p>
                        <p className={`text-2xl font-display font-bold ${m.color}`}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <Link href="/detections" className="block text-center text-xs text-orange-500 hover:underline mt-2">Full Detection Report →</Link>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                <h3 className="font-display font-bold text-white tracking-wide uppercase text-sm mb-4">Reporting Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Link href="/reports" className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition flex items-center gap-2">
                    <FileText className="w-4 h-4" /> View Reports
                  </Link>
                  <button onClick={() => downloadExport("json")} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/10 transition flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Export JSON
                  </button>
                  <button onClick={() => downloadExport("csv")} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/10 transition flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              </div>
            </>)}

            {dashView === "timeline" && <SimulationTimeline />}
            {dashView === "matrix" && <DetectionMatrix />}
            {dashView === "compare" && <ScenarioComparison />}
            {dashView === "trainer" && <ResponseScoring />}
          </>)}
        </div>
      </main>
    </div>
  );
}
