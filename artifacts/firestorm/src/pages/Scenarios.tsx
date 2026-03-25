import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Flame, Play, Square, Clock, Shield, AlertTriangle, ChevronRight,
  Target, Eye, FileText, LayoutDashboard, LogOut, Activity, Zap,
  FastForward, Pause, RotateCcw,
} from "lucide-react";
import { Badge } from "@workspace/ui";
import { fetchScenarios, startScenario, stopScenario } from "@/lib/api";

interface Scenario {
  id: string; name: string; category: string; severity: string; description: string;
  expectedDetections: string[]; status: string; estimatedDuration: string;
  timelineEvents: { time: string; event: string; type: "normal" | "anomalous" }[];
}

const severityColor: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const navItems = [
  { icon: LayoutDashboard, label: "Command Center", path: "/dashboard" },
  { icon: Target, label: "Scenario Catalog", path: "/scenarios" },
  { icon: Eye, label: "Detection Validation", path: "/detections" },
  { icon: Shield, label: "Response Trainer", path: "/response-trainer" },
  { icon: FileText, label: "Reports", path: "/reports" },
];

export default function Scenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selected, setSelected] = useState<Scenario | null>(null);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [replayRunning, setReplayRunning] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showNormal, setShowNormal] = useState(true);
  const [showAnomalous, setShowAnomalous] = useState(true);
  const [, setLocation] = useLocation();

  const loadData = useCallback(async () => {
    const s = await fetchScenarios();
    setScenarios(s);
    setSelected((prev) => {
      if (prev) {
        const updated = s.find((sc: Scenario) => sc.id === prev.id);
        return updated || s[0] || null;
      }
      return s[0] || null;
    });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!replayRunning || !selected) return;
    const interval = setInterval(() => {
      setReplayIndex((prev) => {
        if (prev >= selected.timelineEvents.length - 1) {
          setReplayRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000 / replaySpeed);
    return () => clearInterval(interval);
  }, [replayRunning, replaySpeed, selected]);

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

  const categories = ["all", ...Array.from(new Set(scenarios.map((s) => s.category)))];
  const filtered = filter === "all" ? scenarios : scenarios.filter((s) => s.category === filter);

  return (
    <div className="min-h-screen flex bg-[#0c0a08] text-white">
      <aside className="w-64 border-r border-orange-500/10 bg-[#0a0908] flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-orange-500/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-[0.2em]">FIRESTORM</span>
          </Link>
        </div>
        <div className="p-4 flex-1 space-y-1">
          <div className="px-2 mb-4 mt-2"><p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">Simulation Lab</p></div>
          {navItems.map((item) => (
            <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${item.path === "/scenarios" ? "bg-orange-500/10 text-orange-500" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}>
              <item.icon size={18} /><span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-orange-500/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} /><span className="text-sm font-medium">Disconnect</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 border-b border-orange-500/10 bg-[#0a0908]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-semibold tracking-wide">Scenario Catalog</h1>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">LAB MODE</Badge>
          </div>
        </header>

        <div className="p-6 space-y-6 flex-1">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition ${filter === cat ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10"}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-3">
              {filtered.map((s) => (
                <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { setSelected(s); setReplayIndex(0); setReplayRunning(false); }} className={`p-4 rounded-xl border cursor-pointer transition-all ${selected?.id === s.id ? "border-orange-500/50 bg-orange-500/5" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] tracking-widest uppercase text-gray-500">{s.category}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${severityColor[s.severity]}`}>{s.severity}</span>
                  </div>
                  <h3 className="font-display font-bold text-white mb-1">{s.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{s.estimatedDuration}</span>
                    <div className="flex items-center gap-2">
                      {s.status === "running" && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />RUNNING
                        </span>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); toggleScenario(s); }} className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 transition ${s.status === "running" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
                        {s.status === "running" ? <><Square className="w-3 h-3" />Stop</> : <><Play className="w-3 h-3" />Start</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {selected && (
              <div className="lg:col-span-8 space-y-6">
                <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-display font-bold text-white">{selected.name}</h2>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${severityColor[selected.severity]}`}>{selected.severity}</span>
                      </div>
                      <p className="text-xs tracking-widest uppercase text-gray-500">{selected.category} — {selected.estimatedDuration}</p>
                    </div>
                    <button onClick={() => toggleScenario(selected)} className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wider uppercase flex items-center gap-2 transition ${selected.status === "running" ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" : "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:opacity-90 border-0"}`}>
                      {selected.status === "running" ? <><Square className="w-4 h-4" />Stop Scenario</> : <><Play className="w-4 h-4" />Execute Scenario</>}
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{selected.description}</p>
                  <div>
                    <h4 className="text-xs tracking-widest uppercase text-gray-500 mb-3">Expected Detections</h4>
                    <div className="flex flex-wrap gap-2">
                      {selected.expectedDetections.map((d, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-white tracking-wide uppercase text-sm">Telemetry Replay</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Density</span>
                        <button onClick={() => setShowNormal(!showNormal)} className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider transition ${showNormal ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-gray-600 border border-white/5 line-through"}`}>Normal</button>
                        <button onClick={() => setShowAnomalous(!showAnomalous)} className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider transition ${showAnomalous ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/5 text-gray-600 border border-white/5 line-through"}`}>Anomalous</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Speed</span>
                        {[1, 2, 5].map((speed) => (
                          <button key={speed} onClick={() => setReplaySpeed(speed)} className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider transition ${replaySpeed === speed ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-white/5 text-gray-500 border border-white/5"}`}>
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => { setReplayRunning(!replayRunning); }} className={`p-2 rounded-lg transition ${replayRunning ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                      {replayRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setReplayIndex(0); setReplayRunning(false); }} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500" style={{ width: `${((replayIndex + 1) / selected.timelineEvents.length) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{replayIndex + 1}/{selected.timelineEvents.length}</span>
                  </div>
                  <div className="space-y-2">
                    {selected.timelineEvents
                      .filter((evt) => (evt.type === "normal" && showNormal) || (evt.type === "anomalous" && showAnomalous))
                      .map((evt, i) => {
                        const originalIndex = selected.timelineEvents.indexOf(evt);
                        return (
                          <motion.div key={originalIndex} initial={{ opacity: 0.3 }} animate={{ opacity: originalIndex <= replayIndex ? 1 : 0.3 }} className={`flex items-start gap-3 px-4 py-3 rounded-lg border transition-all ${originalIndex <= replayIndex ? (evt.type === "anomalous" ? "border-red-500/30 bg-red-500/5" : "border-emerald-500/30 bg-emerald-500/5") : "border-white/5 bg-white/[0.01]"}`}>
                            <span className="text-[10px] font-mono text-gray-500 shrink-0 w-12 mt-0.5">{evt.time}</span>
                            <div className="flex-1">
                              <p className={`text-sm ${originalIndex <= replayIndex ? "text-white" : "text-gray-600"}`}>{evt.event}</p>
                            </div>
                            {originalIndex <= replayIndex && (
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${evt.type === "anomalous" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}`}>
                                {evt.type}
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
