import { motion } from "framer-motion";
import { useIncaProjects, useExperiments } from "@/hooks/use-inca";
import { Link } from "wouter";
import { Activity, Brain, ArrowRight, Target } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

const COLORS = [
  "hsl(192, 85%, 55%)",
  "hsl(263, 70%, 58%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(340, 75%, 55%)",
];

export default function Models() {
  const { data: projects, isLoading: loadingProjects } = useIncaProjects();
  const { data: experiments, isLoading: loadingExps } = useExperiments();

  const isLoading = loadingProjects || loadingExps;

  const projectAccuracyData = (projects || []).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
    accuracy: Number(p.accuracy),
    model: p.aiModel,
    id: p.id,
  })).sort((a, b) => b.accuracy - a.accuracy);

  const modelGroups: Record<string, { count: number; avgAccuracy: number; models: string[] }> = {};
  (projects || []).forEach(p => {
    const model = p.aiModel;
    if (!modelGroups[model]) {
      modelGroups[model] = { count: 0, avgAccuracy: 0, models: [] };
    }
    modelGroups[model].count += 1;
    modelGroups[model].avgAccuracy += Number(p.accuracy);
    modelGroups[model].models.push(p.name);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl"
    >
      <div>
        <h2 className="text-3xl font-display font-bold text-white">Model Performance</h2>
        <p className="text-muted-foreground mt-1 text-sm">Monitor accuracy trends and model comparisons</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 glass-panel rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projectAccuracyData.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
          <Activity className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-white mb-1">No model data</h3>
          <p className="text-sm text-muted-foreground mb-4">Create projects to start tracking model performance.</p>
          <Link
            href="/projects"
            className="px-4 py-2 bg-cyan/15 text-cyan border border-cyan/30 rounded-lg text-sm font-medium hover:bg-cyan hover:text-background transition-all inline-block"
          >
            Go to Projects
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan" />
                Accuracy by Project
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectAccuracyData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(225, 38%, 10%)",
                        border: "1px solid hsl(225, 25%, 16%)",
                        borderRadius: "8px",
                        fontSize: 12,
                        color: "#fff",
                      }}
                      formatter={(value: number) => [`${value}%`, "Accuracy"]}
                    />
                    <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
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
              transition={{ delay: 0.2, duration: 0.4 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet" />
                Accuracy Trend
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accuracyTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(225, 38%, 10%)",
                        border: "1px solid hsl(225, 25%, 16%)",
                        borderRadius: "8px",
                        fontSize: 12,
                        color: "#fff",
                      }}
                      formatter={(value: number) => [`${value}%`, "Accuracy"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="hsl(192, 85%, 55%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(192, 85%, 55%)", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
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
                        >
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(225, 38%, 10%)",
                            border: "1px solid hsl(225, 25%, 16%)",
                            borderRadius: "8px",
                            fontSize: 12,
                            color: "#fff",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {pieData.map((entry, i) => (
                      <div key={entry.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-foreground/80 font-mono">{entry.name}</span>
                        </div>
                        <span className="text-muted-foreground">{entry.value} project{Number(entry.value) !== 1 ? "s" : ""}</span>
                      </div>
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
              transition={{ delay: 0.4, duration: 0.4 }}
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
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(225, 38%, 10%)",
                              border: "1px solid hsl(225, 25%, 16%)",
                              borderRadius: "8px",
                              fontSize: 12,
                              color: "#fff",
                            }}
                          />
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
                              <span className="text-muted-foreground">{entry.value} ({pct}%)</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: entry.color,
                                }}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="glass-panel rounded-xl p-6"
          >
            <h3 className="font-display font-bold text-white mb-4">Model Performance Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-white/5">
                    <th className="pb-3 pr-4">Model</th>
                    <th className="pb-3 pr-4">Projects</th>
                    <th className="pb-3 pr-4">Avg Accuracy</th>
                    <th className="pb-3 pr-4">Projects Using</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {Object.entries(modelGroups).map(([model, data]) => (
                    <tr key={model} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4">
                        <span className="text-sm font-mono text-cyan">{model}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-white">{data.count}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-cyan"
                              style={{ width: `${data.avgAccuracy}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono text-white">{data.avgAccuracy.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-muted-foreground">{data.models.join(", ")}</span>
                      </td>
                      <td className="py-3">
                        <Link
                          href="/projects"
                          className="text-xs font-mono text-cyan hover:text-cyan/80 flex items-center gap-1"
                        >
                          VIEW <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
