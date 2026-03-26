import { motion } from "framer-motion";
import { Trophy, Zap, Clock, CheckCircle2, Activity, Brain, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const agents = [
  { rank: 1, name: "DataPipeline-Agent", type: "ETL Orchestrator", tasks: 1247, success: 99.4, avgTime: "1.2s", streak: 342, specialty: "Data transformation and pipeline orchestration", trend: "+2.1%" },
  { rank: 2, name: "SecurityScan-Agent", type: "Vulnerability Scanner", tasks: 892, success: 98.7, avgTime: "3.4s", streak: 127, specialty: "CVE detection and compliance checking", trend: "+1.8%" },
  { rank: 3, name: "DeployBot-Agent", type: "CI/CD Orchestrator", tasks: 634, success: 97.9, avgTime: "45s", streak: 89, specialty: "Multi-environment deployment orchestration", trend: "+0.5%" },
  { rank: 4, name: "QueryOptimizer-Agent", type: "Database Analyst", tasks: 1823, success: 96.2, avgTime: "0.8s", streak: 201, specialty: "SQL optimization and index recommendations", trend: "+3.4%" },
  { rank: 5, name: "AlertRouter-Agent", type: "Incident Manager", tasks: 2104, success: 95.8, avgTime: "0.3s", streak: 67, specialty: "Alert deduplication and intelligent routing", trend: "-0.2%" },
  { rank: 6, name: "DocGenerator-Agent", type: "Content Creator", tasks: 421, success: 94.5, avgTime: "8.2s", streak: 34, specialty: "API documentation and changelog generation", trend: "+1.2%" },
  { rank: 7, name: "CostAnalyzer-Agent", type: "FinOps Analyst", tasks: 312, success: 93.8, avgTime: "2.1s", streak: 48, specialty: "Cloud cost attribution and optimization", trend: "+4.1%" },
  { rank: 8, name: "TestRunner-Agent", type: "QA Orchestrator", tasks: 756, success: 92.1, avgTime: "12s", streak: 22, specialty: "E2E test generation and regression detection", trend: "-1.3%" },
];

const performanceData = agents.map(a => ({ name: a.name.replace("-Agent", ""), success: a.success, tasks: Math.round(a.tasks / 10) }));

const totalTasks = agents.reduce((sum, a) => sum + a.tasks, 0);
const avgSuccess = (agents.reduce((sum, a) => sum + a.success, 0) / agents.length).toFixed(1);

export default function AgentLeaderboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Multi-Agent Performance Analytics</p>
          <h1 className="text-3xl font-bold tracking-tight">Agent Leaderboard</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time performance rankings and task execution analytics for all orchestrated agents</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Tasks (7d)", value: totalTasks.toLocaleString(), icon: Activity, color: "text-cyan-400" },
            { label: "Avg Success Rate", value: `${avgSuccess}%`, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Active Agents", value: `${agents.length}`, icon: Brain, color: "text-purple-400" },
            { label: "Top Streak", value: `${agents[0].streak}`, icon: Trophy, color: "text-amber-400" },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-gray-500 uppercase">{m.label}</p>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /> Success Rate by Agent</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" domain={[88, 100]} stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} width={110} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: 11 }} />
                <Bar dataKey="success" fill="#10b981" radius={[0, 4, 4, 0]} name="Success %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">#</th><th className="px-5 py-3">Agent</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Tasks</th><th className="px-5 py-3">Success</th><th className="px-5 py-3">Avg Time</th><th className="px-5 py-3">Streak</th><th className="px-5 py-3">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {agents.map((a, idx) => (
                <motion.tr key={a.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${a.rank <= 3 ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-gray-500"}`}>{a.rank}</span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold">{a.name}</p>
                    <p className="text-[10px] text-gray-500">{a.specialty}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">{a.type}</td>
                  <td className="px-5 py-3 text-sm font-mono">{a.tasks.toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm font-mono text-emerald-400">{a.success}%</td>
                  <td className="px-5 py-3 text-sm font-mono text-cyan-400">{a.avgTime}</td>
                  <td className="px-5 py-3 text-sm font-mono">{a.streak}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-mono ${a.trend.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{a.trend}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
