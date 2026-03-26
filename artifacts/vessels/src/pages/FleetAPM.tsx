import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, TrendingUp, DollarSign, Gauge, Ship, ArrowLeft } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function FleetAPM() {
  const { data, isLoading } = useQuery({
    queryKey: ["vessels-apm"],
    queryFn: () => fetch("/api/vessels/apm").then(r => r.json()),
  });
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  if (isLoading || !data) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />)}</div>;
  }

  const vessel = selectedVessel ? data.vessels.find((v: any) => v.id === selectedVessel) : null;

  if (vessel) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedVessel(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Fleet
        </button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Ship className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">{vessel.name}</h2>
            <p className="text-sm text-gray-500">{vessel.imo} • {vessel.route} • {vessel.status}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Current TCE", value: `$${(vessel.tce / 1000).toFixed(1)}k`, color: "text-emerald-400" },
            { label: "Utilization", value: `${vessel.utilization}%`, color: "text-cyan-400" },
            { label: "YTD Revenue", value: `$${(vessel.revenueYtd / 1000000).toFixed(1)}M`, color: "text-purple-400" },
            { label: "Voyages YTD", value: vessel.voyageCount, color: "text-amber-400" },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="font-display font-semibold text-sm text-white mb-4">TCE Trend (9 Months)</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vessel.tceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "TCE"]} />
                  <Line type="monotone" dataKey="tce" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="font-display font-semibold text-sm text-white mb-4">Speed vs Consumption</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="speed" name="Speed (kn)" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="consumption" name="Consumption (MT/d)" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }} />
                  <Scatter data={vessel.speedConsumption} fill="#06b6d4" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 lg:col-span-2">
            <h3 className="font-display font-semibold text-sm text-white mb-4">Voyage P&L Breakdown</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Revenue", value: vessel.voyagePnl.revenue, fill: "#10b981" },
                  { name: "Bunker", value: -vessel.voyagePnl.bunkerCost, fill: "#ef4444" },
                  { name: "Port", value: -vessel.voyagePnl.portCharges, fill: "#f59e0b" },
                  { name: "Canal", value: -vessel.voyagePnl.canalFees, fill: "#f97316" },
                  { name: "Insurance", value: -vessel.voyagePnl.insurance, fill: "#8b5cf6" },
                  { name: "OPEX", value: -vessel.voyagePnl.opex, fill: "#ec4899" },
                  { name: "Net Profit", value: vessel.voyagePnl.netProfit, fill: "#06b6d4" },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(Math.abs(v)/1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }} formatter={(v: number) => [`$${Math.abs(v).toLocaleString()}`, ""]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Laden Days</p>
            <p className="text-xl font-display font-bold text-emerald-400">{vessel.ladenDays}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Ballast Days</p>
            <p className="text-xl font-display font-bold text-amber-400">{vessel.ballastDays}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Port Days</p>
            <p className="text-xl font-display font-bold text-blue-400">{vessel.portDays}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Vessel Performance Monitoring</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Fleet APM</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Fleet Avg TCE", value: `$${(data.fleetMetrics.avgTce / 1000).toFixed(1)}k`, icon: DollarSign, color: "text-emerald-400" },
          { label: "Total Revenue YTD", value: `$${(data.fleetMetrics.totalRevenue / 1000000).toFixed(0)}M`, icon: TrendingUp, color: "text-purple-400" },
          { label: "Fleet Utilization", value: `${data.fleetMetrics.fleetUtilization}%`, icon: Gauge, color: "text-cyan-400" },
          { label: "Total Voyages", value: data.fleetMetrics.totalVoyages, icon: Activity, color: "text-amber-400" },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="font-display font-semibold text-sm text-white mb-4">Fleet TCE vs Market Average</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.fleetTceHistory}>
              <defs>
                <linearGradient id="fleetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px" }} />
              <Legend />
              <Area type="monotone" dataKey="fleetAvg" stroke="#10b981" strokeWidth={2} fill="url(#fleetGrad)" name="Fleet Avg" />
              <Line type="monotone" dataKey="marketAvg" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Market Avg" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <h3 className="font-display font-semibold text-sm text-white">Vessel Performance Ranking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                <th className="px-5 py-3 text-left font-medium">Vessel</th>
                <th className="px-5 py-3 text-left font-medium">Route</th>
                <th className="px-5 py-3 text-right font-medium">TCE</th>
                <th className="px-5 py-3 text-right font-medium">Utilization</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">YTD Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[...data.vessels].sort((a: any, b: any) => b.tce - a.tce).map((v: any) => (
                <tr key={v.id} onClick={() => setSelectedVessel(v.id)} className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Ship className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-medium text-white">{v.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{v.route}</td>
                  <td className="px-5 py-3 text-right font-mono">
                    <span className={v.tce >= data.fleetMetrics.avgTce ? "text-emerald-400" : "text-amber-400"}>
                      ${v.tce > 0 ? v.tce.toLocaleString() : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${v.utilization}%` }} />
                      </div>
                      <span className="text-gray-400 text-xs font-mono w-8 text-right">{v.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      v.status === "laden" ? "bg-emerald-500/15 text-emerald-400" :
                      v.status === "ballast" ? "bg-blue-500/15 text-blue-400" :
                      v.status === "at-port" ? "bg-amber-500/15 text-amber-400" :
                      "bg-red-500/15 text-red-400"
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-gray-400">
                    ${v.revenueYtd > 0 ? (v.revenueYtd / 1000000).toFixed(1) + "M" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
