import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { Target, AlertTriangle, CheckCircle, Gauge } from "lucide-react";

const SLO_DATA = [
  { name: "API Availability", target: 99.95, current: 99.97, errorBudget: 100, burnRate: 0.3, status: "healthy" },
  { name: "Latency P99 < 200ms", target: 95, current: 93.2, errorBudget: 64, burnRate: 1.8, status: "warning" },
  { name: "Error Rate < 0.1%", target: 99.9, current: 99.85, errorBudget: 50, burnRate: 2.5, status: "warning" },
  { name: "Throughput > 1K/s", target: 99, current: 99.8, errorBudget: 92, burnRate: 0.4, status: "healthy" },
  { name: "DNS Resolution < 50ms", target: 99.99, current: 99.995, errorBudget: 100, burnRate: 0.1, status: "healthy" },
  { name: "Certificate Validity", target: 100, current: 100, errorBudget: 100, burnRate: 0, status: "healthy" },
];

function BudgetGauge({ value, label }: { value: number; label: string }) {
  const color = value >= 80 ? "#10b981" : value >= 50 ? "#f59e0b" : value >= 20 ? "#ef4444" : "#dc2626";
  const circumference = 2 * Math.PI * 35;
  const offset = circumference - (value / 100) * circumference * 0.75;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-16">
        <svg viewBox="0 0 80 55" className="w-full h-full">
          <path d="M 8 50 A 32 32 0 0 1 72 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} strokeLinecap="round" />
          <motion.path
            d="M 8 50 A 32 32 0 0 1 72 50"
            fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={circumference * 0.75}
            initial={{ strokeDashoffset: circumference * 0.75 }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-display font-bold" style={{ color }}>{value}%</span>
      </div>
      <p className="text-[9px] text-muted-foreground mt-1 text-center leading-tight">{label}</p>
    </div>
  );
}

export default function SloBurnRate() {
  const burnData = Array.from({ length: 30 }, (_, i) => ({
    day: `D${i + 1}`,
    budget: Math.max(0, 100 - i * 1.2 - Math.sin(i * 0.5) * 5 + Math.random() * 3),
    burnRate: 0.5 + Math.sin(i * 0.3) * 0.8 + Math.random() * 0.3,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Target className="w-6 h-6 text-primary" />
          SLO Burn Rate Dashboard
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Error budget consumption gauges</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {SLO_DATA.map((slo, i) => (
          <motion.div key={slo.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="p-4 rounded-xl border border-white/[0.06] backdrop-blur-md"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
            <BudgetGauge value={Math.round(slo.errorBudget)} label={slo.name} />
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl p-6 border border-white/[0.06] backdrop-blur-md"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-amber-400" /> Error Budget Consumption Over Time
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={burnData}>
              <defs>
                <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={9} interval={4} />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "rgba(10,14,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
              <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Critical", position: "right", fill: "#ef4444", fontSize: 10 }} />
              <Area type="monotone" dataKey="budget" stroke="#3b82f6" fill="url(#budgetGrad)" strokeWidth={2} dot={false} name="Error Budget %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl overflow-hidden border border-white/[0.06] backdrop-blur-md"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase">SLO</th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase">Target</th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase">Current</th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase">Error Budget</th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase">Burn Rate</th>
                <th className="px-4 py-3 text-center text-xs text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {SLO_DATA.map((slo, i) => (
                <motion.tr key={slo.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.04 }}
                  className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white font-medium">{slo.name}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{slo.target}%</td>
                  <td className="px-4 py-3 text-right font-mono text-white">{slo.current}%</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          style={{ background: slo.errorBudget >= 80 ? "#10b981" : slo.errorBudget >= 50 ? "#f59e0b" : "#ef4444" }}
                          initial={{ width: 0 }} animate={{ width: `${slo.errorBudget}%` }} transition={{ duration: 0.8 }} />
                      </div>
                      <span className="font-mono text-white w-10 text-right">{slo.errorBudget}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className={slo.burnRate > 2 ? "text-red-400" : slo.burnRate > 1 ? "text-amber-400" : "text-emerald-400"}>{slo.burnRate}x</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {slo.status === "healthy" ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /> : <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto" />}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
