import { useQuery } from "@tanstack/react-query";
import { Users, Ship, Clock, DollarSign, TrendingUp, CheckCircle, AlertTriangle, Shield, Zap } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

function slaBadge(status: string) {
  if (status === "on-track") return "bg-emerald-500/15 text-emerald-400";
  if (status === "minor-delay") return "bg-amber-500/15 text-amber-400";
  if (status === "pending-load") return "bg-blue-500/15 text-blue-400";
  return "bg-red-500/15 text-red-400";
}

function riskColor(score: number) {
  if (score >= 40) return { text: "text-red-400", bg: "bg-red-500", border: "border-red-500/30" };
  if (score >= 25) return { text: "text-amber-400", bg: "bg-amber-500", border: "border-amber-500/30" };
  if (score >= 10) return { text: "text-blue-400", bg: "bg-blue-500", border: "border-blue-500/30" };
  return { text: "text-emerald-400", bg: "bg-emerald-500", border: "border-emerald-500/30" };
}

function categoryIcon(category: string) {
  if (category === "weather") return "🌊";
  if (category === "port-congestion") return "🏗️";
  if (category === "geopolitical") return "⚠️";
  if (category === "security") return "🛡️";
  if (category === "commercial") return "💼";
  if (category === "financial") return "💰";
  return "📋";
}

function severityDot(severity: string) {
  if (severity === "critical") return "bg-red-500";
  if (severity === "high") return "bg-amber-500";
  if (severity === "medium") return "bg-blue-500";
  return "bg-emerald-500";
}

export default function DigitalExperience() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vessels-experience"],
    queryFn: async () => { const r = await fetch("/api/vessels/experience"); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); },
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">Failed to load experience data</p>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Cargo & Customer Visibility</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Digital Experience</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "SLA Adherence", value: `${data.metrics.overallSlaAdherence}%`, color: "text-emerald-400", icon: CheckCircle },
          { label: "Active Shipments", value: data.metrics.activeShipments, color: "text-cyan-400", icon: Ship },
          { label: "On-Time Delivery", value: `${data.metrics.onTimeDelivery}%`, color: "text-blue-400", icon: Clock },
          { label: "Demurrage Exposure", value: `$${(data.metrics.totalDemurrageExposure / 1000).toFixed(0)}k`, color: data.metrics.totalDemurrageExposure > 50000 ? "text-amber-400" : "text-emerald-400", icon: DollarSign },
          { label: "Customer Score", value: `${data.metrics.customerSatisfaction}/5`, color: "text-purple-400", icon: Users },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="font-display font-semibold text-sm text-white mb-4">Charter Party SLA Performance</h3>
        <div className="w-full h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.charterPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} domain={[80, 100]} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }} />
              <Legend />
              <Bar dataKey="adherence" fill="#06b6d4" name="Actual" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="rgba(255,255,255,0.1)" name="Target" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <h3 className="font-display font-semibold text-sm text-white">Active Cargo Shipments</h3>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {data.shipments.map((s: any) => {
            const risk = riskColor(s.riskScore || 0);
            return (
              <div key={s.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Ship className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-medium text-white text-sm">{s.vessel}</span>
                      <span className="text-gray-500 text-xs ml-2">{s.voyage}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.riskScore > 0 && (
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${risk.text} bg-white/[0.05] border ${risk.border}`}>
                        Risk {s.riskScore}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${slaBadge(s.slaStatus)}`}>
                      {s.slaStatus.replace("-", " ")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-400 shrink-0 w-20 truncate">{s.origin}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all" style={{ width: `${s.progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 w-20 truncate text-right">{s.destination}</span>
                  <span className="text-xs font-mono text-cyan-400 shrink-0 w-10 text-right">{s.progress}%</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-600">Cargo</span>
                    <p className="text-gray-300">{s.cargo} — {s.volume}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Customer</span>
                    <p className="text-gray-300">{s.customer}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">ETA</span>
                    <p className="text-gray-300">{s.eta}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Laytime</span>
                    <p className="text-gray-300">{s.laytimeDays}/{s.laytimeAllowed} days</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Demurrage Risk</span>
                    <p className={s.demurrageRisk > 0 ? "text-amber-400 font-mono" : "text-gray-300"}>
                      {s.demurrageRisk > 0 ? `$${s.demurrageRisk.toLocaleString()}` : "None"}
                    </p>
                  </div>
                </div>

                {s.riskFactors && s.riskFactors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Shield className="w-3 h-3" /> Risk Factors
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {s.riskFactors.map((rf: any, idx: number) => (
                        <div key={idx} className={`flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-[11px] max-w-xs`}>
                          <span className="text-sm shrink-0 mt-0.5">{categoryIcon(rf.category)}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${severityDot(rf.severity)}`} />
                              <span className="text-white font-medium truncate">{rf.factor}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                              <span className={`uppercase font-bold ${
                                rf.severity === "critical" ? "text-red-400" :
                                rf.severity === "high" ? "text-amber-400" :
                                rf.severity === "medium" ? "text-blue-400" : "text-gray-400"
                              }`}>{rf.severity}</span>
                              <span>·</span>
                              <span className="font-mono">{rf.confidence}% conf.</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
