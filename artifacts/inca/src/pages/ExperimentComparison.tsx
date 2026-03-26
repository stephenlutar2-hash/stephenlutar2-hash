import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperiments, useIncaProjects } from "@/hooks/use-inca";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { GitCompare, Check, X, Layers, BarChart3, TrendingUp } from "lucide-react";

const COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6", "#14b8a6"];

function generateMetricSeries(expId: number, metric: string, length = 20) {
  const data = [];
  let val = metric === "loss" ? 2.5 : 0.3;
  for (let i = 0; i < length; i++) {
    const noise = Math.sin(expId * 31 + i * 7 + metric.length) * 0.05;
    if (metric === "loss") {
      val = Math.max(0.05, val - 0.08 - noise * 0.5 + Math.random() * 0.02);
    } else {
      val = Math.min(0.99, val + 0.025 + noise * 0.3 + Math.random() * 0.01);
    }
    data.push({ epoch: i + 1, value: parseFloat(val.toFixed(4)) });
  }
  return data;
}

export default function ExperimentComparison() {
  const { data: experiments } = useExperiments();
  const { data: projects } = useIncaProjects();
  const [selected, setSelected] = useState<number[]>([]);
  const [metric, setMetric] = useState<"accuracy" | "loss" | "validation">("accuracy");

  const completedExps = experiments?.filter(e => e.status === "completed" || e.status === "running") || [];

  const toggleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : prev.length < 6 ? [...prev, id] : prev
    );
  };

  const chartData = useMemo(() => {
    if (selected.length === 0) return [];
    const maxLen = 20;
    const series = selected.map(id => ({
      id,
      data: generateMetricSeries(id, metric, maxLen),
    }));
    return Array.from({ length: maxLen }, (_, i) => {
      const point: Record<string, number> = { epoch: i + 1 };
      series.forEach(s => {
        point[`exp_${s.id}`] = s.data[i]?.value ?? 0;
      });
      return point;
    });
  }, [selected, metric]);

  const radarData = useMemo(() => {
    if (selected.length === 0) return [];
    const metrics = ["Accuracy", "Precision", "Recall", "F1 Score", "AUC", "Speed"];
    return metrics.map((m, mi) => {
      const point: Record<string, string | number> = { metric: m };
      selected.forEach(id => {
        const seed = id * 17 + mi * 13;
        point[`exp_${id}`] = parseFloat((0.6 + Math.sin(seed) * 0.2 + Math.random() * 0.15).toFixed(2));
      });
      return point;
    });
  }, [selected]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <GitCompare className="w-6 h-6 text-cyan" />
            Experiment Comparison
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Select up to 6 experiments to compare side-by-side</p>
        </div>
        <div className="flex gap-2">
          {(["accuracy", "loss", "validation"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                metric === m
                  ? "bg-cyan/20 text-cyan border-cyan/30"
                  : "bg-white/[0.03] text-muted-foreground border-white/10 hover:bg-white/[0.06]"
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto pr-2">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
            Select Experiments ({selected.length}/6)
          </p>
          {completedExps.map(exp => {
            const isSelected = selected.includes(exp.id);
            const project = projects?.find(p => p.id === exp.projectId);
            return (
              <motion.button
                key={exp.id}
                onClick={() => toggleSelect(exp.id)}
                whileHover={{ x: 2 }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-cyan/10 border-cyan/30"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{exp.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{project?.name || "—"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-cyan">{exp.accuracy}%</span>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      isSelected ? "bg-cyan border-cyan" : "border-white/20"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
          {completedExps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No experiments available</div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence>
            {selected.length > 0 ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-xl p-6 backdrop-blur-md border border-white/[0.06]"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-cyan" />
                    <h3 className="font-display font-bold text-white">
                      {metric === "loss" ? "Loss Curve" : metric === "validation" ? "Validation Score" : "Accuracy"} Over Epochs
                    </h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="epoch" stroke="#64748b" fontSize={10} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(15,15,35,0.95)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        {selected.map((id, i) => {
                          const exp = experiments?.find(e => e.id === id);
                          return (
                            <Line
                              key={id}
                              type="monotone"
                              dataKey={`exp_${id}`}
                              name={exp?.name || `Exp #${id}`}
                              stroke={COLORS[i % COLORS.length]}
                              strokeWidth={2}
                              dot={false}
                              animationDuration={1200}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-panel rounded-xl p-6 backdrop-blur-md border border-white/[0.06]"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-4 h-4 text-violet" />
                    <h3 className="font-display font-bold text-white">Multi-Metric Radar</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={11} />
                        <PolarRadiusAxis stroke="rgba(255,255,255,0.05)" fontSize={9} />
                        {selected.map((id, i) => {
                          const exp = experiments?.find(e => e.id === id);
                          return (
                            <Radar
                              key={id}
                              name={exp?.name || `Exp #${id}`}
                              dataKey={`exp_${id}`}
                              stroke={COLORS[i % COLORS.length]}
                              fill={COLORS[i % COLORS.length]}
                              fillOpacity={0.1}
                            />
                          );
                        })}
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(15,15,35,0.95)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-panel rounded-xl overflow-hidden backdrop-blur-md border border-white/[0.06]"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
                >
                  <div className="flex items-center gap-2 p-4 border-b border-white/5">
                    <BarChart3 className="w-4 h-4 text-emerald" />
                    <h3 className="font-display font-bold text-white">Side-by-Side Comparison</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/[0.03]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase">Experiment</th>
                          <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase">Accuracy</th>
                          <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase">Status</th>
                          <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase">Project</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selected.map((id, i) => {
                          const exp = experiments?.find(e => e.id === id);
                          const proj = projects?.find(p => p.id === exp?.projectId);
                          if (!exp) return null;
                          return (
                            <tr key={id} className="hover:bg-white/[0.02]">
                              <td className="px-4 py-3 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                <span className="text-white font-medium">{exp.name}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-cyan">{exp.accuracy}%</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                  exp.status === "completed" ? "bg-emerald/10 text-emerald border-emerald/20" :
                                  exp.status === "failed" ? "bg-destructive/10 text-destructive border-destructive/20" :
                                  "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}>{exp.status.toUpperCase()}</span>
                              </td>
                              <td className="px-4 py-3 text-right text-muted-foreground">{proj?.name || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-muted-foreground"
              >
                <GitCompare className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Select experiments from the left panel to begin comparison</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
