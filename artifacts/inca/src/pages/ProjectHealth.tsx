import { useMemo } from "react";
import { motion } from "framer-motion";
import { useIncaProjects, useExperiments } from "@/hooks/use-inca";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { HeartPulse, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";

const COLORS_DONUT = ["#10b981", "#ef4444", "#f59e0b", "#06b6d4"];

export default function ProjectHealth() {
  const { data: projects } = useIncaProjects();
  const { data: experiments } = useExperiments();

  const statusData = useMemo(() => {
    if (!experiments) return [];
    const completed = experiments.filter(e => e.status === "completed").length;
    const failed = experiments.filter(e => e.status === "failed").length;
    const running = experiments.filter(e => e.status === "running").length;
    const pending = experiments.filter(e => e.status !== "completed" && e.status !== "failed" && e.status !== "running").length;
    return [
      { name: "Completed", value: completed, color: "#10b981" },
      { name: "Failed", value: failed, color: "#ef4444" },
      { name: "Running", value: running, color: "#f59e0b" },
      { name: "Pending", value: pending, color: "#06b6d4" },
    ].filter(d => d.value > 0);
  }, [experiments]);

  const trendData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      success: Math.floor(5 + Math.sin(i * 0.8) * 3 + i * 1.5 + Math.random() * 2),
      failure: Math.floor(2 + Math.sin(i * 1.2 + 1) * 1.5 + Math.random()),
    }));
  }, []);

  const projectHealthScores = useMemo(() => {
    if (!projects || !experiments) return [];
    return projects.map(p => {
      const exps = experiments.filter(e => e.projectId === p.id);
      const completed = exps.filter(e => e.status === "completed").length;
      const total = exps.length;
      const successRate = total > 0 ? (completed / total) * 100 : 0;
      const health = (Number(p.accuracy) * 0.6 + successRate * 0.4);
      return { ...p, successRate, health: parseFloat(health.toFixed(1)), totalExps: total, completedExps: completed };
    }).sort((a, b) => b.health - a.health);
  }, [projects, experiments]);

  const totalExps = experiments?.length || 0;
  const completedExps = experiments?.filter(e => e.status === "completed").length || 0;
  const successRate = totalExps > 0 ? ((completedExps / totalExps) * 100).toFixed(1) : "0";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <HeartPulse className="w-6 h-6 text-emerald" />
          Project Health Dashboard
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Experiment success/failure rates and health trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Overall Success Rate", value: `${successRate}%`, icon: CheckCircle, color: "text-emerald", bg: "from-emerald/10" },
          { label: "Total Experiments", value: totalExps.toString(), icon: Clock, color: "text-cyan", bg: "from-cyan/10" },
          { label: "Failed Experiments", value: (experiments?.filter(e => e.status === "failed").length || 0).toString(), icon: XCircle, color: "text-destructive", bg: "from-destructive/10" },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-panel rounded-xl p-5 border border-white/[0.06] relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${m.bg} to-transparent opacity-30`} />
            <div className="relative">
              <m.icon className={`w-5 h-5 ${m.color} mb-2`} />
              <p className="text-2xl font-display font-bold text-white">{m.value}</p>
              <p className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-wider">{m.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-xl p-6 border border-white/[0.06]"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <h3 className="font-display font-bold text-white mb-4">Status Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" animationDuration={1200}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(15,15,35,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">No experiment data</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-xl p-6 border border-white/[0.06]"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-cyan" />
            <h3 className="font-display font-bold text-white">Success/Failure Trend</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ background: "rgba(15,15,35,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} dot={false} name="Success" />
                <Line type="monotone" dataKey="failure" stroke="#ef4444" strokeWidth={2} dot={false} name="Failure" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel rounded-xl p-6 border border-white/[0.06]"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
      >
        <h3 className="font-display font-bold text-white mb-4">Project Health Scorecard</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectHealthScores.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.04 }}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{p.name}</span>
                <span className={`text-lg font-display font-bold ${
                  p.health >= 80 ? "text-emerald" : p.health >= 60 ? "text-amber-400" : "text-destructive"
                }`}>{p.health}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: p.health >= 80 ? "#10b981" : p.health >= 60 ? "#f59e0b" : "#ef4444" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${p.health}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.04 }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Accuracy: {p.accuracy}%</span>
                <span>Success: {p.successRate.toFixed(0)}%</span>
                <span>{p.completedExps}/{p.totalExps} exps</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
