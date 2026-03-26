import { motion } from "framer-motion";
import { DollarSign, TrendingDown, TrendingUp, AlertTriangle, Brain, Zap, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const costByService = [
  { service: "Zeus Infrastructure", cost: 4200, previous: 4800, trend: "down" },
  { service: "Beacon Observability", cost: 3100, previous: 2900, trend: "up" },
  { service: "Vessels Fleet API", cost: 2800, previous: 2600, trend: "up" },
  { service: "INCA ML Pipeline", cost: 2400, previous: 2200, trend: "up" },
  { service: "Rosie Security Engine", cost: 1900, previous: 1850, trend: "up" },
  { service: "AlloyScape Orchestrator", cost: 1600, previous: 1400, trend: "up" },
  { service: "Nimbus Predictions", cost: 1200, previous: 1300, trend: "down" },
  { service: "Shared Database", cost: 2100, previous: 2000, trend: "up" },
];

const costByCategory = [
  { name: "Compute", value: 8200, color: "#06b6d4" },
  { name: "Storage", value: 3400, color: "#a78bfa" },
  { name: "Network", value: 2800, color: "#10b981" },
  { name: "Database", value: 3100, color: "#f59e0b" },
  { name: "ML/GPU", value: 1800, color: "#ef4444" },
];

const optimizations = [
  { id: 1, title: "Right-size Zeus compute instances", savings: "$1,240/mo", effort: "Low", confidence: 94, detail: "Zeus m5.2xlarge instances running at 34% average CPU utilization. Recommend downsizing to m5.xlarge during off-peak hours (10PM-6AM UTC) using scheduled scaling. Projected savings: $1,240/month with no performance impact." },
  { id: 2, title: "Enable S3 Intelligent-Tiering for INCA datasets", savings: "$680/mo", effort: "Low", confidence: 91, detail: "78% of INCA experiment datasets haven't been accessed in 30+ days. S3 Intelligent-Tiering would automatically move infrequent data to cheaper storage tiers. No access latency impact for active datasets." },
  { id: 3, title: "Consolidate Beacon + Vessels database read replicas", savings: "$920/mo", effort: "Medium", confidence: 87, detail: "Beacon and Vessels share similar query patterns and could use a consolidated read replica pool. Current setup runs 4 independent replicas — consolidation to 2 shared replicas would maintain query performance while reducing costs." },
  { id: 4, title: "Switch Nimbus GPU inference to spot instances", savings: "$540/mo", effort: "Medium", confidence: 82, detail: "Nimbus prediction workloads are batch-oriented and fault-tolerant. Switching from on-demand to spot GPU instances (with fallback to on-demand) would reduce GPU costs by 60%. Requires implementing checkpoint/resume in prediction pipeline." },
];

const totalCost = costByService.reduce((sum, s) => sum + s.cost, 0);
const previousTotal = costByService.reduce((sum, s) => sum + s.previous, 0);
const totalSavings = optimizations.reduce((sum, o) => sum + parseInt(o.savings.replace(/[^0-9]/g, "")), 0);

export default function CostIntelligence() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Infrastructure Cost Analytics</p>
          <h1 className="text-3xl font-bold tracking-tight">Cost Intelligence</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time cost attribution with AI-powered optimization recommendations</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Monthly Spend", value: `$${(totalCost).toLocaleString()}`, icon: DollarSign, color: "text-cyan-400", sub: `vs $${previousTotal.toLocaleString()} prev` },
            { label: "Month-over-Month", value: `${((totalCost - previousTotal) / previousTotal * 100).toFixed(1)}%`, icon: totalCost > previousTotal ? TrendingUp : TrendingDown, color: totalCost > previousTotal ? "text-amber-400" : "text-emerald-400", sub: totalCost > previousTotal ? "increase" : "decrease" },
            { label: "Potential Savings", value: `$${totalSavings.toLocaleString()}/mo`, icon: Brain, color: "text-emerald-400", sub: `${optimizations.length} optimizations` },
            { label: "Cost per Client", value: `$${Math.round(totalCost / 47).toLocaleString()}`, icon: BarChart3, color: "text-purple-400", sub: "47 active clients" },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{m.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /> Cost by Service</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costByService} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <YAxis type="category" dataKey="service" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} width={140} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px", fontSize: 11 }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Cost"]} />
                  <Bar dataKey="cost" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> Cost by Category</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={costByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {costByCategory.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px", fontSize: 11 }} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {costByCategory.map(c => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} /><span className="text-muted-foreground">{c.name}</span></div>
                  <span className="font-mono">${c.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-emerald-400" /> AI Optimization Recommendations</h3>
          <div className="space-y-3">
            {optimizations.map((o, idx) => (
              <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.06 }} className="bg-card border border-border rounded-xl p-5 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold">{o.title}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-mono font-bold text-emerald-400">{o.savings}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${o.effort === "Low" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{o.effort}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{o.detail}</p>
                <span className="text-[10px] font-mono text-muted-foreground">{o.confidence}% confidence</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
