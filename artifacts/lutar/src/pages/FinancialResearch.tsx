import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, BarChart3, ArrowUp, ArrowDown, Globe, Brain, Shield, Clock, Filter } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  revenue: 800 + i * 120 + Math.sin(i) * 100,
  expenses: 600 + i * 80 + Math.cos(i) * 60,
  profit: 200 + i * 40 + Math.sin(i) * 40,
}));

const holdingsAnalysis = [
  { entity: "Vessels Maritime", revenue: "$4.8M", margin: "78%", growth: "+42%", risk: "Low", valuation: "$48M", status: "Star" },
  { entity: "Beacon Analytics", revenue: "$2.9M", margin: "84%", growth: "+28%", risk: "Low", valuation: "$32M", status: "Cash Cow" },
  { entity: "INCA Intelligence", revenue: "$2.1M", margin: "72%", growth: "+56%", risk: "Medium", valuation: "$28M", status: "Rising Star" },
  { entity: "Rosie Security", revenue: "$1.8M", margin: "81%", growth: "+31%", risk: "Low", valuation: "$22M", status: "Performer" },
  { entity: "AlloyScape AI", revenue: "$1.4M", margin: "68%", growth: "+67%", risk: "Medium", valuation: "$24M", status: "Rising Star" },
  { entity: "Nimbus Weather", revenue: "$1.2M", margin: "76%", growth: "+23%", risk: "Low", valuation: "$14M", status: "Maturing" },
];

const insights = [
  { type: "opportunity", title: "Maritime SaaS consolidation wave accelerating", detail: "Three maritime tech companies acquired in Q1 2026 at 12-18x ARR multiples. Vessels positioning aligns with acquirer criteria — recommend exploring strategic partnership discussions." },
  { type: "risk", title: "GPU compute costs rising 22% YoY", detail: "Cloud GPU pricing pressures impacting INCA and Nimbus ML pipeline margins. Recommend evaluating reserved capacity commitments for 12-month term to lock current rates." },
  { type: "opportunity", title: "Cross-sell revenue acceleration", detail: "Clients using 3+ SZL platforms show 4.2x higher lifetime value than single-platform users. Recommend bundled pricing strategy for Q2 go-to-market." },
];

export default function FinancialResearch() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Empire Financial Analytics</p>
          <h1 className="text-3xl font-bold tracking-tight">Financial Research Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Cross-entity revenue analysis with AI-generated investment thesis and risk assessment</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total ARR", value: "$14.2M", change: "+34%", up: true },
            { label: "Blended Margin", value: "79.8%", change: "+2.4pp", up: true },
            { label: "Portfolio Valuation", value: "$168M", change: "+28%", up: true },
            { label: "Burn Multiple", value: "0.8x", change: "-0.3x", up: true },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-white">{m.value}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-mono ${m.up ? "text-emerald-400" : "text-red-400"}`}>
                {m.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />} {m.change}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /> Revenue, Expenses & Profit (Trailing 12M, $K)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} unit="K" />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: 11 }} />
                <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fill="rgba(6,182,212,0.1)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#a78bfa" fill="rgba(167,139,250,0.1)" strokeWidth={2} name="Expenses" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fill="rgba(16,185,129,0.1)" strokeWidth={2} name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-400" /> Holdings Analysis Matrix</h3>
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Entity</th><th className="px-5 py-3">Revenue</th><th className="px-5 py-3">Margin</th>
                  <th className="px-5 py-3">Growth</th><th className="px-5 py-3">Risk</th><th className="px-5 py-3">Valuation</th><th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {holdingsAnalysis.map(h => (
                  <tr key={h.entity} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold">{h.entity}</td>
                    <td className="px-5 py-3 text-sm font-mono text-emerald-400">{h.revenue}</td>
                    <td className="px-5 py-3 text-sm font-mono">{h.margin}</td>
                    <td className="px-5 py-3 text-sm font-mono text-cyan-400">{h.growth}</td>
                    <td className="px-5 py-3"><span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${h.risk === "Low" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{h.risk}</span></td>
                    <td className="px-5 py-3 text-sm font-mono">{h.valuation}</td>
                    <td className="px-5 py-3"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${h.status === "Star" || h.status === "Rising Star" ? "bg-cyan-500/10 text-cyan-400" : h.status === "Cash Cow" ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"}`}>{h.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-amber-400" /> AI-Generated Insights</h3>
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }} className={`p-4 rounded-xl border ${ins.type === "opportunity" ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${ins.type === "opportunity" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{ins.type}</span>
                  <h4 className="text-sm font-semibold text-white">{ins.title}</h4>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{ins.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
