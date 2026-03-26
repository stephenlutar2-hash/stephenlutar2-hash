import { motion } from "framer-motion";
import { TrendingUp, Brain, AlertTriangle, Clock, BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const forecastData = Array.from({ length: 30 }, (_, i) => {
  const isProjected = i >= 20;
  return {
    day: `Day ${i + 1}`,
    actual: isProjected ? null : 2400 + Math.sin(i * 0.3) * 400 + i * 35,
    predicted: 2400 + Math.sin(i * 0.3) * 400 + i * 35 + (isProjected ? Math.random() * 80 : 0),
    upper: 2400 + Math.sin(i * 0.3) * 400 + i * 35 + 300 + (isProjected ? i * 15 : 0),
    lower: 2400 + Math.sin(i * 0.3) * 400 + i * 35 - 300 - (isProjected ? i * 15 : 0),
  };
});

const forecasts = [
  {
    id: 1, metric: "API Request Volume", current: "2.4M/day", forecast7d: "2.8M/day", forecast30d: "3.4M/day",
    trend: "increasing" as const, confidence: 92, impact: "Medium",
    insight: "Request volume trending upward 16% month-over-month. Pattern consistent with organic user growth. Current infrastructure can handle up to 4.2M/day — no immediate scaling needed. Recommend preemptive scaling review if growth rate sustains through Q2.",
    recommendation: "Monitor — no action needed. Set scaling alert at 3.8M/day threshold.",
  },
  {
    id: 2, metric: "Database Connection Pool Usage", current: "68%", forecast7d: "74%", forecast30d: "86%",
    trend: "increasing" as const, confidence: 87, impact: "High",
    insight: "Connection pool usage growing at 2.6% per week. At current trajectory, will reach 85% capacity threshold within 25 days. Historical data shows performance degradation begins at 82%. Root cause: Vessels fleet dashboard query volume increasing during Q1 reporting season.",
    recommendation: "Increase connection pool max from 200 to 300 by March 31. Review Vessels query optimization opportunities.",
  },
  {
    id: 3, metric: "Average Response Time (p95)", current: "340ms", forecast7d: "355ms", forecast30d: "310ms",
    trend: "stable" as const, confidence: 78, impact: "Low",
    insight: "Response time showing slight uptick correlated with traffic increase, but expected to improve after planned cache optimization deployment next week. Seasonal pattern from 2025 data shows similar temporary increase during Q1.",
    recommendation: "No action needed. Cache optimization deployment scheduled for April 1 should reduce p95 by ~15%.",
  },
  {
    id: 4, metric: "Error Rate (5xx)", current: "0.12%", forecast7d: "0.14%", forecast30d: "0.09%",
    trend: "stable" as const, confidence: 84, impact: "Low",
    insight: "Error rate within normal bounds. Slight increase in 503 errors traced to AlloyScape orchestrator timeout during peak hours. Expected to resolve with async processing refactor in sprint 47.",
    recommendation: "Monitor. AlloyScape async refactor in sprint 47 should reduce 503 errors by 60%.",
  },
];

const trendIcon = (t: string) => t === "increasing" ? <ArrowUp className="w-3 h-3" /> : t === "decreasing" ? <ArrowDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />;
const trendColor = (t: string, impact: string) => {
  if (impact === "High") return "text-amber-400";
  if (t === "increasing") return "text-cyan-400";
  return "text-emerald-400";
};

export default function TrendForecasting() {
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Predictive Infrastructure Analytics</p>
          <h1 className="text-3xl font-bold tracking-tight">Trend Forecasting</h1>
          <p className="text-gray-400 text-sm mt-1">ML-driven capacity planning and performance prediction across all SZL platforms</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /> Request Volume — Actual vs Predicted (30 Day)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} interval={4} />
                <YAxis stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: 11 }} />
                <ReferenceLine x="Day 21" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" label={{ value: "Today", fontSize: 9, fill: "#999" }} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(6,182,212,0.08)" name="Upper Bound" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="rgba(6,182,212,0.0)" name="Lower Bound" />
                <Area type="monotone" dataKey="actual" stroke="#10b981" fill="none" strokeWidth={2} dot={false} name="Actual" />
                <Area type="monotone" dataKey="predicted" stroke="#06b6d4" fill="none" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Predicted" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forecasts.map((f, idx) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">{f.metric}</h4>
                <span className={`flex items-center gap-1 text-xs font-mono ${trendColor(f.trend, f.impact)}`}>
                  {trendIcon(f.trend)} {f.trend}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 rounded bg-white/[0.02] text-center">
                  <p className="text-lg font-bold text-white">{f.current}</p>
                  <p className="text-[9px] text-gray-500 uppercase">Current</p>
                </div>
                <div className="p-2 rounded bg-white/[0.02] text-center">
                  <p className="text-lg font-bold text-cyan-400">{f.forecast7d}</p>
                  <p className="text-[9px] text-gray-500 uppercase">7-Day</p>
                </div>
                <div className="p-2 rounded bg-white/[0.02] text-center">
                  <p className="text-lg font-bold text-violet-400">{f.forecast30d}</p>
                  <p className="text-[9px] text-gray-500 uppercase">30-Day</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                <span className="font-mono">{f.confidence}% confidence</span>
                <span className={`uppercase font-bold px-1.5 py-0.5 rounded text-[10px] ${f.impact === "High" ? "bg-amber-500/10 text-amber-400" : f.impact === "Medium" ? "bg-cyan-500/10 text-cyan-400" : "bg-emerald-500/10 text-emerald-400"}`}>{f.impact} impact</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">{f.insight}</p>
              <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                <p className="text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1"><Brain className="w-3 h-3 text-cyan-400" /> Recommendation</p>
                <p className="text-xs text-gray-300">{f.recommendation}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
