import { useQuery } from "@tanstack/react-query";
import { Brain, AlertTriangle, Wrench, TrendingUp, Zap, FileText } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function AppliedIntelligence() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vessels-intelligence"],
    queryFn: async () => { const r = await fetch("/api/vessels/intelligence"); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); },
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">Failed to load intelligence data</p>
          <p className="text-gray-500 text-xs mt-1 mb-3">Please check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Predictive Analytics & Forecasting</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Applied Intelligence</h2>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-rose-400" /> Executive Briefing
        </h3>
        <div className="bg-white/[0.01] border border-white/5 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
              <span>Generated {new Date(data.executiveBriefing.generated).toLocaleString()}</span>
            </div>
            <div className="flex gap-2 ml-auto">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                data.executiveBriefing.marketOutlook === "Bullish" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
              }`}>
                {data.executiveBriefing.marketOutlook}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                data.executiveBriefing.riskLevel === "Low" ? "bg-emerald-500/15 text-emerald-400" :
                data.executiveBriefing.riskLevel === "Moderate" ? "bg-amber-500/15 text-amber-400" :
                "bg-red-500/15 text-red-400"
              }`}>
                Risk: {data.executiveBriefing.riskLevel}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{data.executiveBriefing.summary}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Key Actions</p>
          <ul className="space-y-1.5">
            {data.executiveBriefing.keyActions.map((action: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="w-5 h-5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Freight Rate Forecast
          </h3>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.freightForecast}>
                <defs>
                  <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confBand)" name="Upper bound" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" name="Lower bound" />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} name="Actual TCE" connectNulls={false} />
                <Line type="monotone" dataKey="forecast" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#06b6d4", r: 3 }} name="Forecast" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Emissions Trajectory vs CII Threshold
          </h3>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.emissionsTrajectory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }} />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} name="Actual" connectNulls={false} />
                <Line type="monotone" dataKey="projected" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#06b6d4", r: 3 }} name="Projected" connectNulls={false} />
                <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Target" />
                <Line type="monotone" dataKey="ciiThreshold" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="CII Threshold" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Anomaly Detection
          </h3>
          <div className="space-y-3">
            {data.anomalies.map((a: any) => (
              <div key={a.id} className={`p-3 rounded-lg border ${
                a.severity === "high" ? "border-amber-500/20 bg-amber-500/5" :
                a.severity === "medium" ? "border-blue-500/20 bg-blue-500/5" :
                "border-white/5 bg-white/[0.01]"
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      a.severity === "high" ? "bg-amber-500/20 text-amber-400" :
                      a.severity === "medium" ? "bg-blue-500/20 text-blue-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>{a.severity}</span>
                    <span className="text-xs text-gray-400">{a.vessel}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">{a.confidence}% confidence</span>
                </div>
                <p className="text-sm text-gray-300">{a.message}</p>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500 font-mono">
                  <span>Baseline: {a.baseline}</span>
                  <span>Actual: {a.actual}</span>
                  <span>Δ {((a.actual - a.baseline) / a.baseline * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-400" /> Predictive Maintenance
          </h3>
          <div className="space-y-3">
            {data.maintenancePredictions.map((m: any, i: number) => {
              const daysUntil = Math.ceil((new Date(m.predictedDate).getTime() - Date.now()) / 86400000);
              return (
                <div key={i} className="p-3 rounded-lg border border-white/5 bg-white/[0.01]">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">{m.vessel} — {m.system}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Predicted: {m.predictedDate}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        m.severity === "high" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                      }`}>{daysUntil > 0 ? `${daysUntil}d` : "DUE"}</span>
                      <p className="text-[10px] text-gray-500 mt-1 font-mono">{m.confidence}% conf.</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{m.recommendation}</p>
                  <p className="text-xs font-mono text-amber-400">Est. cost: ${m.estimatedCost.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
