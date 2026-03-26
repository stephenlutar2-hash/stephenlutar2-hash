import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Link2, TrendingUp, Clock, Zap, Brain, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const correlationData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  cpu: 45 + Math.sin(i * 0.5) * 15 + (i >= 14 && i <= 18 ? 25 : 0),
  memory: 62 + Math.cos(i * 0.3) * 8 + (i >= 15 && i <= 19 ? 18 : 0),
  latency: 120 + Math.sin(i * 0.4) * 30 + (i >= 14 && i <= 18 ? 180 : 0),
  errorRate: 0.2 + (i >= 16 && i <= 18 ? 4.5 : 0),
}));

const correlatedAnomalies = [
  {
    id: 1, severity: "critical", title: "Cascading Performance Degradation — Zeus → Beacon → INCA",
    detected: "2026-03-25T14:32:00Z", duration: "4h 12m", confidence: 96,
    rootCause: "Zeus infrastructure CPU saturation triggered cascading latency increase across dependent services. Memory pressure on Beacon API gateway caused request queuing, which propagated to INCA experiment processing pipeline.",
    correlatedSignals: ["Zeus CPU: 92% (threshold: 80%)", "Beacon p99 latency: 2.8s (baseline: 340ms)", "INCA experiment queue depth: 847 (baseline: 12)", "Error rate: 4.7% (baseline: 0.2%)"],
    impactedServices: ["zeus-core", "beacon-api-gateway", "inca-experiment-runner", "alloyscape-orchestrator"],
    suggestedActions: ["Scale Zeus compute tier from m5.2xl to m5.4xl", "Enable Beacon circuit breaker for INCA dependency", "Configure INCA queue overflow to dead-letter queue"],
  },
  {
    id: 2, severity: "warning", title: "Memory Leak Pattern — Rosie Behavioral Engine (72h Trend)",
    detected: "2026-03-24T08:15:00Z", duration: "72h (ongoing)", confidence: 88,
    rootCause: "Gradual memory increase of ~2.1% per hour in Rosie behavioral analysis engine. Pattern consistent with event listener accumulation in WebSocket connection handler. Projected to reach OOM threshold in approximately 18 hours at current rate.",
    correlatedSignals: ["Memory usage: 78% → 84% over 72h", "GC pause time: 45ms → 120ms", "Connection pool: 342 active (capacity: 500)", "No corresponding traffic increase"],
    impactedServices: ["rosie-behavioral-engine", "rosie-websocket-handler"],
    suggestedActions: ["Schedule rolling restart of behavioral engine pods", "Deploy memory leak hotfix from PR #4281", "Enable memory pressure alerting at 85% threshold"],
  },
  {
    id: 3, severity: "info", title: "Seasonal Traffic Pattern Shift — Vessels Fleet Dashboard",
    detected: "2026-03-23T06:00:00Z", duration: "Ongoing", confidence: 82,
    rootCause: "Traffic to Vessels fleet dashboard has increased 34% over the past 2 weeks, correlating with Q1 maritime reporting season. Pattern matches historical data from Q1 2025. Current infrastructure headroom is sufficient but recommend proactive scaling.",
    correlatedSignals: ["Daily active users: 1,247 → 1,671", "API requests: +34% week-over-week", "Database query volume: +28%", "CDN cache hit ratio stable at 94%"],
    impactedServices: ["vessels-dashboard", "vessels-api", "shared-postgres"],
    suggestedActions: ["Pre-scale database read replicas for Q1 reporting peak", "Enable CDN edge caching for fleet telemetry endpoints", "Review auto-scaling thresholds for Vessels API"],
  },
];

const sevColor = (s: string) => s === "critical" ? "border-red-500/30 bg-red-500/5 text-red-400" : s === "warning" ? "border-amber-500/30 bg-amber-500/5 text-amber-400" : "border-blue-500/30 bg-blue-500/5 text-blue-400";

export default function AnomalyCorrelation() {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Cross-Platform Signal Correlation</p>
          <h1 className="text-3xl font-bold tracking-tight">Anomaly Correlation Engine</h1>
          <p className="text-gray-400 text-sm mt-1">AI-powered root cause analysis across the SZL ecosystem</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-cyan-400" /> CPU & Memory (24h)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} interval={3} />
                  <YAxis stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: 11 }} />
                  <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="cpu" stroke="#06b6d4" strokeWidth={2} dot={false} name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#a78bfa" strokeWidth={2} dot={false} name="Memory %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-amber-400" /> Latency & Error Rate (24h)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} interval={3} />
                  <YAxis yAxisId="latency" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="errors" orientation="right" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: 11 }} />
                  <Line yAxisId="latency" type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} dot={false} name="Latency (ms)" />
                  <Line yAxisId="errors" type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} dot={false} name="Error Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Link2 className="w-4 h-4 text-cyan-400" /> Correlated Anomaly Chains</h3>
          {correlatedAnomalies.map(a => {
            const isExpanded = expandedId === a.id;
            return (
              <motion.div key={a.id} layout className={`rounded-xl border overflow-hidden ${sevColor(a.severity)}`}>
                <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-white">{a.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{new Date(a.detected).toLocaleString()} · Duration: {a.duration} · {a.confidence}% confidence</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>
                {isExpanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                    <div>
                      <h5 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Brain className="w-3 h-3" /> Root Cause Analysis</h5>
                      <p className="text-sm text-gray-300 leading-relaxed">{a.rootCause}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Correlated Signals</h5>
                        <ul className="space-y-1">{a.correlatedSignals.map((s, i) => <li key={i} className="text-xs text-gray-400 font-mono bg-white/[0.02] px-2 py-1 rounded">{s}</li>)}</ul>
                      </div>
                      <div>
                        <h5 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Suggested Actions</h5>
                        <ul className="space-y-1.5">{a.suggestedActions.map((s, i) => <li key={i} className="flex items-start gap-2 text-xs text-gray-300"><span className="w-4 h-4 rounded bg-cyan-500/10 text-cyan-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>{s}</li>)}</ul>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Impacted Services</h5>
                      <div className="flex flex-wrap gap-1.5">{a.impactedServices.map(s => <span key={s} className="text-[10px] font-mono bg-white/[0.03] text-gray-400 px-2 py-0.5 rounded">{s}</span>)}</div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
