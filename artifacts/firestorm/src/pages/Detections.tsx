import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Flame, Eye, Shield, FileText, LayoutDashboard, Target, LogOut,
  CheckCircle2, XCircle, AlertTriangle, TrendingUp, Activity, ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge } from "@workspace/ui";
import { fetchDetectionCoverage, fetchLiveEvents } from "@/lib/api";

interface DetectionData {
  totalEvents: number; detectedEvents: number; detectionRate: number;
  falsePositives: number; falseNegatives: number; confidenceScore: number;
  rulesCoverage: Record<string, number>;
}

interface LiveEvent {
  id: string; timestamp: string; scenarioName: string; type: string;
  severity: string; source: string; destination: string; detail: string; detected: boolean;
}

const navItems = [
  { icon: LayoutDashboard, label: "Command Center", path: "/dashboard" },
  { icon: Target, label: "Scenario Catalog", path: "/scenarios" },
  { icon: Eye, label: "Detection Validation", path: "/detections" },
  { icon: Shield, label: "Response Trainer", path: "/response-trainer" },
  { icon: FileText, label: "Reports", path: "/reports" },
];

function DetectionPanel({ title, count, events, variant }: { title: string; count: number; events: LiveEvent[]; variant: "success" | "danger" }) {
  const [expanded, setExpanded] = useState(false);
  const isSuccess = variant === "success";
  const borderColor = isSuccess ? "border-emerald-500/20" : "border-red-500/20";
  const bgColor = isSuccess ? "bg-emerald-500/5" : "bg-red-500/5";
  const textColor = isSuccess ? "text-emerald-400" : "text-red-400";
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div className={`p-6 rounded-xl border ${borderColor} ${bgColor}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between mb-3">
        <h3 className={`font-display font-bold ${textColor} tracking-wide uppercase text-sm flex items-center gap-2`}>
          <Icon className="w-4 h-4" /> {title} ({count})
        </h3>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      <div className={`space-y-2 overflow-y-auto transition-all ${expanded ? "max-h-96" : "max-h-48"}`}>
        {events.length === 0 ? (
          <p className="text-xs text-gray-500">{isSuccess ? "No detected events yet" : "No missed events — excellent coverage"}</p>
        ) : (
          events.slice(0, expanded ? 20 : 10).map((evt) => (
            <motion.div key={evt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono text-gray-500">{new Date(evt.timestamp).toLocaleTimeString("en-US", { hour12: false })}</span>
                    <span className="text-[9px] text-gray-600 uppercase">{evt.type}</span>
                  </div>
                  <p className="text-xs text-white truncate">{evt.detail}</p>
                  <p className="text-[10px] text-gray-500">{evt.source} → {evt.destination}</p>
                </div>
                <Icon className={`w-4 h-4 ${textColor} shrink-0`} />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Detections() {
  const [data, setData] = useState<DetectionData | null>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [, setLocation] = useLocation();

  const loadData = useCallback(async () => {
    try {
      const [d, e] = await Promise.all([fetchDetectionCoverage(), fetchLiveEvents()]);
      setData(d);
      setEvents(e);
    } catch {} finally {
      setInitialLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  function handleLogout() {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  const detectedEvents = events.filter((e) => e.detected);
  const missedEvents = events.filter((e) => !e.detected);

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
            <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${item.path === "/detections" ? "bg-orange-500/10 text-orange-500" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}>
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
            <h1 className="text-xl font-display font-semibold tracking-wide">Detection Validation</h1>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">LAB MODE</Badge>
          </div>
        </header>

        <div className="p-6 space-y-6 flex-1">
          {!initialLoaded ? (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-5 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="h-3 w-20 bg-white/5 rounded mb-4" />
                    <div className="h-8 w-16 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] h-60" />
                <div className="space-y-6">
                  <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] h-40" />
                  <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] h-40" />
                </div>
              </div>
            </div>
          ) : (<>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Detection Rate", value: data ? `${data.detectionRate}%` : "—", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
              { label: "False Positives", value: String(data?.falsePositives ?? 0), icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              { label: "False Negatives", value: String(data?.falseNegatives ?? 0), icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
              { label: "Confidence Score", value: String(data?.confidenceScore ?? "—"), icon: Eye, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`p-5 rounded-xl border ${stat.border} ${stat.bg}`}>
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs tracking-wider text-gray-500 uppercase">{stat.label}</p>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <h3 className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
              <h3 className="font-display font-bold text-white tracking-wide uppercase text-sm mb-4">Rule Coverage Scores</h3>
              {data?.rulesCoverage && Object.entries(data.rulesCoverage).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(data.rulesCoverage).map(([rule, score]) => (
                    <div key={rule}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">{rule}</span>
                        <span className={`text-xs font-bold ${score >= 90 ? "text-emerald-400" : score >= 70 ? "text-amber-400" : "text-red-400"}`}>{score}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${score >= 90 ? "bg-emerald-500" : score >= 70 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Run scenarios to generate coverage data</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <DetectionPanel title="Successfully Detected" count={detectedEvents.length} events={detectedEvents} variant="success" />
              <DetectionPanel title="Missed Detections" count={missedEvents.length} events={missedEvents} variant="danger" />
            </div>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
            <h3 className="font-display font-bold text-white tracking-wide uppercase text-sm mb-4">Event Timeline</h3>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/30 via-amber-500/30 to-red-500/30" />
              {events.slice(0, 12).map((evt, i) => (
                <motion.div key={evt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative mb-3 last:mb-0">
                  <div className={`absolute -left-[18px] top-2 w-2.5 h-2.5 rounded-full border-2 ${evt.detected ? "bg-emerald-500 border-emerald-400" : "bg-red-500 border-red-400"}`} />
                  <div className="flex items-start justify-between gap-3 px-4 py-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono text-gray-500">{new Date(evt.timestamp).toLocaleTimeString("en-US", { hour12: false })}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase border ${evt.detected ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>{evt.detected ? "DETECTED" : "MISSED"}</span>
                        <span className="text-[9px] text-gray-600 uppercase">{evt.type}</span>
                      </div>
                      <p className="text-xs text-gray-300 truncate">{evt.detail}</p>
                      <p className="text-[10px] text-gray-600">{evt.source} → {evt.destination}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          </>)}
        </div>
      </main>
    </div>
  );
}
