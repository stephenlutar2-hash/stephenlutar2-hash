import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  Flame, Eye, Shield, FileText, LayoutDashboard, Target, LogOut,
  CheckCircle2, XCircle, AlertTriangle, TrendingUp, Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

export default function Detections() {
  const [data, setData] = useState<DetectionData | null>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [, setLocation] = useLocation();

  const loadData = useCallback(async () => {
    const [d, e] = await Promise.all([fetchDetectionCoverage(), fetchLiveEvents()]);
    setData(d);
    setEvents(e);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Detection Rate", value: data ? `${data.detectionRate}%` : "—", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
              { label: "False Positives", value: String(data?.falsePositives ?? 0), icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              { label: "False Negatives", value: String(data?.falseNegatives ?? 0), icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
              { label: "Confidence Score", value: String(data?.confidenceScore ?? "—"), icon: Eye, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
            ].map((stat, i) => (
              <div key={i} className={`p-5 rounded-xl border ${stat.border} ${stat.bg}`}>
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs tracking-wider text-gray-500 uppercase">{stat.label}</p>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <h3 className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</h3>
              </div>
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
              <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <h3 className="font-display font-bold text-emerald-400 tracking-wide uppercase text-sm mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Successfully Detected ({detectedEvents.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detectedEvents.length === 0 ? (
                    <p className="text-xs text-gray-500">No detected events yet</p>
                  ) : (
                    detectedEvents.slice(0, 10).map((evt) => (
                      <div key={evt.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <div>
                          <p className="text-xs text-white truncate max-w-[250px]">{evt.detail}</p>
                          <p className="text-[10px] text-gray-500">{evt.source} → {evt.destination}</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5">
                <h3 className="font-display font-bold text-red-400 tracking-wide uppercase text-sm mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Missed Detections ({missedEvents.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {missedEvents.length === 0 ? (
                    <p className="text-xs text-gray-500">No missed events — excellent coverage</p>
                  ) : (
                    missedEvents.slice(0, 10).map((evt) => (
                      <div key={evt.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                        <div>
                          <p className="text-xs text-white truncate max-w-[250px]">{evt.detail}</p>
                          <p className="text-[10px] text-gray-500">{evt.source} → {evt.destination}</p>
                        </div>
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
