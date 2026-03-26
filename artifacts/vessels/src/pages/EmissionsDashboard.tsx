import { useQuery } from "@tanstack/react-query";
import { Flame, Leaf, TrendingDown, BarChart3, Ship, CheckCircle, XCircle } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

function ciiColor(rating: string) {
  if (rating === "A") return "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
  if (rating === "B") return "text-cyan-400 bg-cyan-500/15 border-cyan-500/30";
  if (rating === "C") return "text-amber-400 bg-amber-500/15 border-amber-500/30";
  if (rating === "D") return "text-orange-400 bg-orange-500/15 border-orange-500/30";
  return "text-red-400 bg-red-500/15 border-red-500/30";
}

function ciiBarColor(rating: string) {
  if (rating === "A") return "#10b981";
  if (rating === "B") return "#06b6d4";
  if (rating === "C") return "#f59e0b";
  if (rating === "D") return "#f97316";
  return "#ef4444";
}

export default function EmissionsDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vessels-emissions"],
    queryFn: async () => { const r = await fetch("/api/vessels/emissions"); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); },
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">Failed to load emissions data</p>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Environmental Compliance</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-wide">CO₂ & Emissions</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <Leaf className="w-3.5 h-3.5" />
          IMO 2030 Pathway Active
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total CO₂</p>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-xl font-display font-bold text-orange-400">{data.fleetSummary.totalCo2.toLocaleString()} MT</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Fuel</p>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-display font-bold text-amber-400">{data.fleetSummary.totalFuel.toLocaleString()} MT</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Fleet CII Avg</p>
            <TrendingDown className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-display font-bold text-cyan-400">{data.fleetSummary.avgCiiRating}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">EEXI Compliant</p>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-display font-bold text-emerald-400">{data.fleetSummary.eexiCompliance.compliant}/{data.fleetSummary.eexiCompliance.compliant + data.fleetSummary.eexiCompliance.nonCompliant}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">CII A/B Ratio</p>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-display font-bold text-emerald-400">
            {Math.round((data.fleetSummary.ciiDistribution.A + data.fleetSummary.ciiDistribution.B) / data.vesselEmissions.length * 100)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" /> Fleet CO₂ Emissions Trend
          </h3>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.fleetTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="co2Tons" fill="#f97316" name="CO₂ (MT)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="rgba(16,185,129,0.3)" name="Target" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" /> CII Rating Distribution
          </h3>
          <div className="flex items-end gap-3 h-56 px-4">
            {Object.entries(data.fleetSummary.ciiDistribution).map(([rating, cnt]) => {
              const maxCount = Math.max(...Object.values(data.fleetSummary.ciiDistribution) as number[]);
              const heightPct = maxCount > 0 ? ((cnt as number) / maxCount * 100) : 0;
              return (
                <div key={rating} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">{cnt as number}</span>
                  <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max(heightPct, 5)}%`, backgroundColor: ciiBarColor(rating) }} />
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-display font-bold ${ciiColor(rating)}`}>
                    {rating}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
          <Ship className="w-4 h-4 text-cyan-400" /> Per-Vessel Emissions & CII
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.vesselEmissions.map((v: any) => (
            <div key={v.vesselCode} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-display font-semibold text-white text-sm">{v.name}</h4>
                  <p className="text-[10px] text-gray-500 font-mono">{v.vesselCode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-display font-bold ${ciiColor(v.ciiRating)}`}>
                    {v.ciiRating}
                  </div>
                  {v.eexiStatus === "compliant" ? (
                    <span className="text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">EEXI OK</span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded">EEXI FAIL</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] mb-3">
                <div className="bg-white/[0.02] rounded-lg p-2">
                  <p className="text-gray-500 mb-0.5">CO₂ Total</p>
                  <p className="font-mono text-orange-400">{v.totalCo2.toLocaleString()} MT</p>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-2">
                  <p className="text-gray-500 mb-0.5">Fuel Total</p>
                  <p className="font-mono text-amber-400">{v.totalFuel.toLocaleString()} MT</p>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-2">
                  <p className="text-gray-500 mb-0.5">Avg CII</p>
                  <p className="font-mono text-cyan-400">{v.avgCiiValue}</p>
                </div>
              </div>

              {v.trend && v.trend.length > 0 && (
                <div className="w-full h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={v.trend}>
                      <Line type="monotone" dataKey="co2Tons" stroke="#f97316" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="font-display font-semibold text-sm text-white mb-4">EEXI Compliance Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                <th className="px-4 py-2 text-left font-medium">Vessel</th>
                <th className="px-4 py-2 text-center font-medium">CII Rating</th>
                <th className="px-4 py-2 text-center font-medium">CII Value</th>
                <th className="px-4 py-2 text-center font-medium">EEXI</th>
                <th className="px-4 py-2 text-right font-medium">CO₂ (9mo)</th>
                <th className="px-4 py-2 text-right font-medium">Fuel (9mo)</th>
              </tr>
            </thead>
            <tbody>
              {data.vesselEmissions.map((v: any) => (
                <tr key={v.vesselCode} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 font-medium text-white">{v.name}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border text-xs font-display font-bold ${ciiColor(v.ciiRating)}`}>
                      {v.ciiRating}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-gray-300">{v.avgCiiValue}</td>
                  <td className="px-4 py-2.5 text-center">
                    {v.eexiStatus === "compliant" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-300">{v.totalCo2.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-300">{v.totalFuel.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
