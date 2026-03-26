import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Ship } from "lucide-react";

const VOYAGES = [
  { id: "V-2401", vessel: "MV Atlantic Pioneer", route: "Singapore → Rotterdam", revenue: 285000, costs: 198000, fuel: 85000, port: 32000, crew: 45000, insurance: 18000, other: 18000, days: 28, status: "completed" },
  { id: "V-2402", vessel: "MV Pacific Star", route: "Shanghai → Los Angeles", revenue: 342000, costs: 245000, fuel: 105000, port: 45000, crew: 52000, insurance: 22000, other: 21000, days: 18, status: "completed" },
  { id: "V-2403", vessel: "MV Nordic Spirit", route: "Houston → Hamburg", revenue: 195000, costs: 165000, fuel: 72000, port: 28000, crew: 38000, insurance: 15000, other: 12000, days: 22, status: "completed" },
  { id: "V-2404", vessel: "MV Southern Cross", route: "Durban → Mumbai", revenue: 178000, costs: 142000, fuel: 62000, port: 24000, crew: 32000, insurance: 14000, other: 10000, days: 16, status: "in-progress" },
  { id: "V-2405", vessel: "MV Eastern Wind", route: "Tokyo → Sydney", revenue: 225000, costs: 182000, fuel: 78000, port: 35000, crew: 40000, insurance: 16000, other: 13000, days: 14, status: "completed" },
  { id: "V-2406", vessel: "MV Gulf Trader", route: "Jeddah → Fujairah", revenue: 156000, costs: 128000, fuel: 55000, port: 22000, crew: 30000, insurance: 12000, other: 9000, days: 8, status: "completed" },
];

export default function VoyagePnL() {
  const chartData = VOYAGES.map(v => ({
    name: v.id,
    revenue: v.revenue / 1000,
    costs: v.costs / 1000,
    profit: (v.revenue - v.costs) / 1000,
  }));

  const profitTrend = VOYAGES.map((v, i) => ({
    voyage: v.id,
    margin: parseFloat(((v.revenue - v.costs) / v.revenue * 100).toFixed(1)),
    dailyRate: Math.round(v.revenue / v.days),
  }));

  const totalRevenue = VOYAGES.reduce((s, v) => s + v.revenue, 0);
  const totalCosts = VOYAGES.reduce((s, v) => s + v.costs, 0);
  const totalProfit = totalRevenue - totalCosts;
  const avgMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          Voyage P&L Dashboard
        </h2>
        <p className="text-sm text-gray-500 mt-1">Revenue vs costs per voyage with profitability analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${(totalRevenue / 1000).toFixed(0)}K`, color: "text-emerald-400", trend: "+12.3%" },
          { label: "Total Costs", value: `$${(totalCosts / 1000).toFixed(0)}K`, color: "text-red-400", trend: "+5.1%" },
          { label: "Net Profit", value: `$${(totalProfit / 1000).toFixed(0)}K`, color: "text-cyan-400", trend: "+18.7%" },
          { label: "Avg Margin", value: `${avgMargin}%`, color: "text-amber-400", trend: "+2.4pp" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-xl border border-white/[0.06] backdrop-blur-md"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
          >
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-emerald-400 mt-1 font-mono">{s.trend}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6 border border-white/[0.06] backdrop-blur-md"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <h3 className="font-display font-bold text-white mb-4">Revenue vs Costs (K$)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ background: "rgba(10,14,23,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costs" fill="#ef4444" name="Costs" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-6 border border-white/[0.06] backdrop-blur-md"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <h3 className="font-display font-bold text-white mb-4">Profit Margin Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="voyage" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 40]} />
                <Tooltip contentStyle={{ background: "rgba(10,14,23,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="margin" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4", r: 4 }} name="Margin %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl overflow-hidden border border-white/[0.06] backdrop-blur-md"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
      >
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Ship className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display font-bold text-white">Voyage Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Voyage</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Route</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Costs</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Profit</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Margin</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {VOYAGES.map((v, i) => {
                const profit = v.revenue - v.costs;
                const margin = ((profit / v.revenue) * 100).toFixed(1);
                return (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-mono text-cyan-400">{v.id}</td>
                    <td className="px-4 py-3 text-white">{v.route}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">${(v.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-right font-mono text-red-400">${(v.costs / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-right font-mono text-white">${(profit / 1000).toFixed(0)}K</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono ${Number(margin) >= 20 ? "text-emerald-400" : Number(margin) >= 10 ? "text-amber-400" : "text-red-400"}`}>{margin}%</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-400">{v.days}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
