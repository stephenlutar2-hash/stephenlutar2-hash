import { useState } from "react";
import { motion } from "framer-motion";
import { useIncaProjects, useExperiments } from "@/hooks/use-inca";
import { Link } from "wouter";
import { Activity, Brain, ArrowRight, Target, TrendingUp, Award, Layers, AlertTriangle, RefreshCw } from "lucide-react";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import AnimatedCounter from "@/components/AnimatedCounter";
import Sparkline from "@/components/Sparkline";
import { SkeletonChart } from "@/components/SkeletonLoader";

const COLORS = [
  "hsl(192, 85%, 55%)",
  "hsl(263, 70%, 58%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(340, 75%, 55%)",
];

const tooltipStyle = {
  backgroundColor: "hsl(225, 38%, 10%)",
  border: "1px solid hsl(225, 25%, 16%)",
  borderRadius: "8px",
  fontSize: 12,
  color: "#fff",
};

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
};

export default function Models() {
  const { data: projects, isLoading: loadingProjects, error: projectsError } = useIncaProjects();
  const { data: experiments, isLoading: loadingExps, error: experimentsError } = useExperiments();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const isLoading = loadingProjects || loadingExps;
  const hasError = projectsError || experimentsError;

  const projectAccuracyData = (projects || []).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
    accuracy: Number(p.accuracy),
    model: p.aiModel,
    id: p.id,
  })).sort((a, b) => b.accuracy - a.accuracy);

  const modelGroups: Record<string, { count: number; avgAccuracy: number; models: string[]; bestAccuracy: number; totalExps: number }> = {};
  (projects || []).forEach(p => {
    const model = p.aiModel;
    if (!modelGroups[model]) {
      modelGroups[model] = { count: 0, avgAccuracy: 0, models: [], bestAccuracy: 0, totalExps: 0 };
    }
    modelGroups[model].count += 1;
    modelGroups[model].avgAccuracy += Number(p.accuracy);
    modelGroups[model].models.push(p.name);
    modelGroups[model].bestAccuracy = Math.max(modelGroups[model].bestAccuracy, Number(p.accuracy));
    modelGroups[model].totalExps += (experiments || []).filter(e => e.projectId === p.id).length;
  });
  Object.values(modelGroups).forEach(g => {
    g.avgAccuracy = g.count > 0 ? g.avgAccuracy / g.count : 0;
  });

  const pieData = Object.entries(modelGroups).map(([name, data]) => ({
    name,
    value: data.count,
    avgAccuracy: data.avgAccuracy.toFixed(1),
  }));

  const statusDistribution = {
    completed: experiments?.filter(e => e.status === "completed").length || 0,
    running: experiments?.filter(e => e.status === "running").length || 0,
    failed: experiments?.filter(e => e.status === "failed").length || 0,
  };

  const statusData = [
    { name: "Completed", value: statusDistribution.completed, color: "hsl(160, 84%, 39%)" },
    { name: "Running", value: statusDistribution.running, color: "hsl(38, 92%, 50%)" },
    { name: "Failed", value: statusDistribution.failed, color: "hsl(0, 84%, 60%)" },
  ].filter(d => d.value > 0);

  const accuracyTrendData = (projects || [])
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((p, idx) => ({
      index: idx + 1,
      name: p.name.length > 10 ? p.name.slice(0, 10) + "…" : p.name,
      accuracy: Number(p.accuracy),
    }));

  const radarData = Object.entries(modelGroups).slice(0, 5).map(([name, data]) => ({
    subject: name.length > 12 ? name.slice(0, 12) + "…" : name,
    accuracy: Math.round(data.avgAccuracy),
    projects: data.count * 20,
    experiments: Math.min(data.totalExps * 10, 100),
    fullMark: 100,
  }));

  const topModel = Object.entries(modelGroups).sort((a, b) => b[1].avgAccuracy - a[1].avgAccuracy)[0];
  const totalModels = Object.keys(modelGroups).length;
  const overallAvg = projects && projects.length > 0
    ? projects.reduce((s, p) => s + Number(p.accuracy), 0) / projects.length
    : 0;

  if (hasError) {
    return (
      <motion.div {...pageTransition} className="space-y-6 max-w-7xl">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Model Performance</h2>
          <p className="text-muted-foreground mt-1 text-sm">Monitor accuracy trends and model comparisons</p>
        </div>
        <div className="glass-panel rounded-xl p-8 border border-destructive/30 bg-destructive/5 text-center">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-white mb-1">Failed to load model data</h3>
          <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching data.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-mono text-cyan bg-cyan/10 border border-cyan/20 rounded-lg hover:bg-cyan/20 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Model Performance</h2>
          <p className="text-muted-foreground mt-1 text-sm">Monitor accuracy trends and model comparisons</p>
        </div>
      </div>

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <motion.div key={i} className="metric-card border-white/5" animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }}>
                <div className="h-16" />
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </>
      ) : projectAccuracyData.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-xl p-12 text-center"
        >
          <Activity className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-white mb-1">No model data</h3>
          <p className="text-sm text-muted-foreground mb-4">Create projects to start tracking model performance.</p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/projects"
              className="px-4 py-2 bg-cyan/15 text-cyan border border-cyan/30 rounded-lg text-sm font-medium hover:bg-cyan hover:text-background transition-all inline-block"
            >
              Go to Projects
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Award,
                label: "TOP MODEL",
                value: topModel ? topModel[0] : "N/A",
                sub: topModel ? `${topModel[1].avgAccuracy.toFixed(1)}% avg accuracy` : "",
                color: "text-cyan",
                borderColor: "border-cyan/20",
                gradient: "from-cyan/10",
              },
              {
                icon: Layers,
                label: "ARCHITECTURES",
                value: totalModels,
                sub: `${projects?.length || 0} total projects`,
                color: "text-violet",
                borderColor: "border-violet/20",
                gradient: "from-violet/10",
                isNumber: true,
              },
              {
                icon: Target,
                label: "OVERALL ACCURACY",
                value: overallAvg,
                sub: "Portfolio average",
                color: "text-emerald",
                borderColor: "border-emerald/20",
                gradient: "from-emerald/10",
                isNumber: true,
                suffix: "%",
                decimals: 1,
              },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                className={`metric-card ${m.borderColor}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -2 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} to-transparent rounded-xl opacity-50`} />
                <div className="relative flex items-center gap-3">
                  <m.icon className={`w-6 h-6 ${m.color}`} />
                  <div>
                    {m.isNumber ? (
                      <AnimatedCounter
                        value={m.value as number}
                        suffix={m.suffix}
                        decimals={m.decimals}
                        className="text-xl font-display font-bold text-white block"
                      />
                    ) : (
                      <p className="text-base font-display font-bold text-white truncate max-w-[180px]">{m.value}</p>
                    )}
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan" />
                Accuracy by Project
              </h3>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectAccuracyData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, "Accuracy"]} />
                    <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} animationDuration={1200}>
                      {projectAccuracyData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.75} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet" />
                Accuracy Trend
              </h3>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accuracyTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                    <defs>
                      <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(192, 85%, 55%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(192, 85%, 55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, "Accuracy"]} />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="hsl(192, 85%, 55%)"
                      strokeWidth={2}
                      fill="url(#accuracyGradient)"
                      dot={{ fill: "hsl(192, 85%, 55%)", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald" />
                Model Distribution
              </h3>
              {pieData.length > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          animationBegin={300}
                          animationDuration={1000}
                        >
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {pieData.map((entry, i) => (
                      <motion.div
                        key={entry.name}
                        className={`flex items-center justify-between text-xs p-2 rounded-lg cursor-pointer transition-all ${
                          selectedModel === entry.name ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                        }`}
                        onClick={() => setSelectedModel(selectedModel === entry.name ? null : entry.name)}
                        whileHover={{ x: 2 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-foreground/80 font-mono">{entry.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{entry.avgAccuracy}%</span>
                          <span className="text-muted-foreground/60">·</span>
                          <span className="text-muted-foreground">{entry.value} proj</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No data</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="font-display font-bold text-white mb-4">Experiment Success Rate</h3>
              {statusData.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            paddingAngle={3}
                            dataKey="value"
                            animationBegin={400}
                            animationDuration={1000}
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                      {statusData.map(entry => {
                        const total = statusData.reduce((s, d) => s + d.value, 0);
                        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0";
                        return (
                          <div key={entry.name}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-foreground/80">{entry.name}</span>
                              <span className="text-muted-foreground font-mono">{entry.value} ({pct}%)</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: entry.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No experiment data</p>
              )}
            </motion.div>
          </div>

          {radarData.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Multi-Dimensional Comparison
              </h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(225, 25%, 16%)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }}
                    />
                    <Radar
                      dataKey="accuracy"
                      stroke="hsl(192, 85%, 55%)"
                      fill="hsl(192, 85%, 55%)"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      name="Accuracy"
                      animationDuration={1200}
                    />
                    <Radar
                      dataKey="experiments"
                      stroke="hsl(263, 70%, 58%)"
                      fill="hsl(263, 70%, 58%)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name="Experiment Activity"
                      animationDuration={1200}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-panel rounded-xl p-6"
          >
            <h3 className="font-display font-bold text-white mb-4">Model Performance Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-white/5">
                    <th className="pb-3 pr-4">Model</th>
                    <th className="pb-3 pr-4">Projects</th>
                    <th className="pb-3 pr-4">Experiments</th>
                    <th className="pb-3 pr-4">Avg Accuracy</th>
                    <th className="pb-3 pr-4">Best</th>
                    <th className="pb-3 pr-4">Trend</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {Object.entries(modelGroups).sort((a, b) => b[1].avgAccuracy - a[1].avgAccuracy).map(([model, data], idx) => {
                    const sparkData = (projects || [])
                      .filter(p => p.aiModel === model)
                      .map(p => Number(p.accuracy));
                    return (
                      <motion.tr
                        key={model}
                        className={`hover:bg-white/[0.02] transition-colors ${selectedModel === model ? "bg-white/[0.04]" : ""}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.65 + idx * 0.04 }}
                      >
                        <td className="py-3 pr-4">
                          <span className="text-sm font-mono text-cyan">{model}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-sm text-white">{data.count}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-sm text-muted-foreground">{data.totalExps}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-cyan to-cyan/60"
                                initial={{ width: 0 }}
                                animate={{ width: `${data.avgAccuracy}%` }}
                                transition={{ delay: 0.7 + idx * 0.04, duration: 0.6 }}
                              />
                            </div>
                            <span className="text-sm font-mono text-white">{data.avgAccuracy.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-sm font-mono text-emerald">{data.bestAccuracy.toFixed(1)}%</span>
                        </td>
                        <td className="py-3 pr-4">
                          {sparkData.length > 1 ? (
                            <Sparkline data={sparkData} color="hsl(192, 85%, 55%)" width={50} height={18} />
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          <Link
                            href="/projects"
                            className="text-xs font-mono text-cyan hover:text-cyan/80 flex items-center gap-1 group"
                          >
                            VIEW <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
