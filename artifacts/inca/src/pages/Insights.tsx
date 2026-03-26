import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIncaProjects, useExperiments } from "@/hooks/use-inca";
import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";
import {
  Lightbulb, TrendingUp, AlertTriangle,
  CheckCircle2, ArrowRight, Brain, Sparkles, ChevronDown, BarChart3
} from "lucide-react";
import type { IncaProject, IncaExperiment } from "@szl-holdings/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import AnimatedCounter from "@/components/AnimatedCounter";
import { SkeletonCard, SkeletonChart } from "@/components/SkeletonLoader";

interface InsightCard {
  id: string;
  type: "success" | "warning" | "trend" | "discovery";
  title: string;
  description: string;
  metric?: string;
  projectName?: string;
  projectId?: number;
}

function generateInsights(
  projects: IncaProject[],
  experiments: IncaExperiment[]
): InsightCard[] {
  const insights: InsightCard[] = [];

  const topProject = projects.reduce((best, p) =>
    Number(p.accuracy) > Number(best?.accuracy || 0) ? p : best, projects[0]);

  if (topProject && Number(topProject.accuracy) >= 80) {
    insights.push({
      id: `top-${topProject.id}`,
      type: "success",
      title: "High-Performance Model Detected",
      description: `${topProject.name} using ${topProject.aiModel} has achieved ${topProject.accuracy}% accuracy, outperforming other models in the portfolio.`,
      metric: `${topProject.accuracy}%`,
      projectName: topProject.name,
      projectId: topProject.id,
    });
  }

  const lowAccuracyProjects = projects.filter(p => Number(p.accuracy) < 50 && Number(p.accuracy) > 0);
  lowAccuracyProjects.forEach(p => {
    insights.push({
      id: `low-${p.id}`,
      type: "warning",
      title: "Low Accuracy Alert",
      description: `${p.name} is currently at ${p.accuracy}% accuracy. Consider reviewing the model architecture or training data.`,
      metric: `${p.accuracy}%`,
      projectName: p.name,
      projectId: p.id,
    });
  });

  const failedExps = experiments.filter(e => e.status === "failed");
  if (failedExps.length > 0) {
    const failRate = ((failedExps.length / experiments.length) * 100).toFixed(0);
    insights.push({
      id: "fail-rate",
      type: "warning",
      title: "Experiment Failure Rate",
      description: `${failedExps.length} out of ${experiments.length} experiments have failed (${failRate}% failure rate). Review failed experiments for common patterns.`,
      metric: `${failRate}%`,
    });
  }

  const completedExps = experiments.filter(e => e.status === "completed");
  if (completedExps.length > 0) {
    const avgAcc = (completedExps.reduce((sum, e) => sum + Number(e.accuracy), 0) / completedExps.length).toFixed(1);
    insights.push({
      id: "avg-exp-acc",
      type: "trend",
      title: "Experiment Accuracy Trend",
      description: `Completed experiments average ${avgAcc}% accuracy across ${completedExps.length} experiments. ${Number(avgAcc) > 75 ? "Strong performance trend." : "Room for improvement."}`,
      metric: `${avgAcc}%`,
    });
  }

  const deployedCount = projects.filter(p => p.status === "deployed").length;
  if (deployedCount > 0) {
    insights.push({
      id: "deployed",
      type: "success",
      title: "Deployed Models",
      description: `${deployedCount} model${deployedCount > 1 ? "s" : ""} currently deployed in production. Monitoring active for performance degradation.`,
      metric: `${deployedCount}`,
    });
  }

  const modelsUsed = [...new Set(projects.map(p => p.aiModel))];
  if (modelsUsed.length > 1) {
    insights.push({
      id: "model-diversity",
      type: "discovery",
      title: "Model Architecture Diversity",
      description: `Portfolio spans ${modelsUsed.length} different AI architectures: ${modelsUsed.slice(0, 3).join(", ")}${modelsUsed.length > 3 ? ` and ${modelsUsed.length - 3} more` : ""}.`,
      metric: `${modelsUsed.length}`,
    });
  }

  if (projects.length === 0) {
    insights.push({
      id: "getting-started",
      type: "discovery",
      title: "Getting Started",
      description: "Create your first project to begin generating insights. INCA analyzes your projects and experiments to surface key findings.",
    });
  }

  return insights;
}

const typeConfig: Record<string, { icon: LucideIcon; color: string; bg: string; border: string }> = {
  success: { icon: CheckCircle2, color: "text-emerald", bg: "bg-emerald/10", border: "border-emerald/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  trend: { icon: TrendingUp, color: "text-cyan", bg: "bg-cyan/10", border: "border-cyan/20" },
  discovery: { icon: Sparkles, color: "text-violet", bg: "bg-violet/10", border: "border-violet/20" },
};

const COLORS = [
  "hsl(192, 85%, 55%)",
  "hsl(263, 70%, 58%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(340, 75%, 55%)",
];

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
};

export default function Insights() {
  const { data: projects, isLoading: loadingProjects } = useIncaProjects();
  const { data: experiments, isLoading: loadingExps } = useExperiments();
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const isLoading = loadingProjects || loadingExps;

  const insights = !isLoading && projects && experiments
    ? generateInsights(projects, experiments)
    : [];

  const filteredInsights = activeFilter === "all"
    ? insights
    : insights.filter(i => i.type === activeFilter);

  const statusBreakdown = experiments ? [
    { name: "Completed", value: experiments.filter(e => e.status === "completed").length, color: "hsl(160, 84%, 39%)" },
    { name: "Running", value: experiments.filter(e => e.status === "running").length, color: "hsl(38, 92%, 50%)" },
    { name: "Failed", value: experiments.filter(e => e.status === "failed").length, color: "hsl(0, 84%, 60%)" },
  ].filter(d => d.value > 0) : [];

  const modelPerformance = projects ? [...new Set(projects.map(p => p.aiModel))].map(model => {
    const modelProjects = projects.filter(p => p.aiModel === model);
    const avgAcc = modelProjects.reduce((s, p) => s + Number(p.accuracy), 0) / modelProjects.length;
    return { model, accuracy: Math.round(avgAcc), count: modelProjects.length };
  }).sort((a, b) => b.accuracy - a.accuracy) : [];

  const radarData = modelPerformance.slice(0, 5).map(m => ({
    subject: m.model.length > 12 ? m.model.slice(0, 12) + "…" : m.model,
    A: m.accuracy,
    fullMark: 100,
  }));

  const typeCounts = {
    all: insights.length,
    success: insights.filter(i => i.type === "success").length,
    warning: insights.filter(i => i.type === "warning").length,
    trend: insights.filter(i => i.type === "trend").length,
    discovery: insights.filter(i => i.type === "discovery").length,
  };

  return (
    <motion.div {...pageTransition} className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Insights</h2>
          <p className="text-muted-foreground mt-1 text-sm">AI-generated intelligence from your projects and experiments</p>
        </div>
        {!isLoading && insights.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
            <BarChart3 className="w-4 h-4 text-cyan" />
            <span className="text-xs font-mono text-muted-foreground">
              <AnimatedCounter value={insights.length} className="text-white font-bold" /> insights
            </span>
          </div>
        )}
      </div>

      {!isLoading && insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2"
        >
          {(["all", "success", "warning", "trend", "discovery"] as const).map(filter => (
            <motion.button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeFilter === filter
                  ? "bg-cyan/15 text-cyan border border-cyan/30"
                  : "bg-white/[0.03] text-muted-foreground border border-transparent hover:border-white/10 hover:text-white"
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              <span className="ml-1.5 text-[10px] opacity-60">({typeCounts[filter]})</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </>
      ) : (
        <>
          {projects && projects.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {statusBreakdown.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="glass-panel rounded-xl p-6"
                >
                  <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald" />
                    Experiment Distribution
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="w-36 h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={60}
                            paddingAngle={3}
                            dataKey="value"
                            animationBegin={200}
                            animationDuration={1000}
                          >
                            {statusBreakdown.map((entry, index) => (
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
                      {statusBreakdown.map(entry => {
                        const total = statusBreakdown.reduce((s, d) => s + d.value, 0);
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
                                transition={{ delay: 0.3, duration: 0.8 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {radarData.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="glass-panel rounded-xl p-6"
                >
                  <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-violet" />
                    Model Accuracy Radar
                  </h3>
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(225, 25%, 16%)" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }}
                        />
                        <Radar
                          dataKey="A"
                          stroke="hsl(192, 85%, 55%)"
                          fill="hsl(192, 85%, 55%)"
                          fillOpacity={0.15}
                          strokeWidth={2}
                          animationDuration={1200}
                        />
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
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {radarData.length <= 1 && modelPerformance.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="glass-panel rounded-xl p-6"
                >
                  <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-violet" />
                    Model Performance
                  </h3>
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={modelPerformance} margin={{ left: 5, right: 20 }}>
                        <XAxis dataKey="model" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(225, 38%, 10%)",
                            border: "1px solid hsl(225, 25%, 16%)",
                            borderRadius: "8px",
                            fontSize: 12,
                            color: "#fff",
                          }}
                          formatter={(value: number) => [`${value}%`, "Avg Accuracy"]}
                        />
                        <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} animationDuration={1200}>
                          {modelPerformance.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {filteredInsights.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-xl p-12 text-center"
            >
              <Lightbulb className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <h3 className="text-lg font-display font-bold text-white mb-1">
                {insights.length === 0 ? "No insights yet" : "No matching insights"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {insights.length === 0
                  ? "Insights will be generated as you add projects and experiments."
                  : "Try a different filter."}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredInsights.map((insight, i) => {
                const config = typeConfig[insight.type];
                const Icon = config.icon;
                const isExpanded = expandedInsight === insight.id;
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -2 }}
                    className={`glass-panel-hover rounded-xl p-5 ${config.border} cursor-pointer`}
                    onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}
                        whileHover={{ rotate: 8 }}
                      >
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                          {insight.metric && (
                            <AnimatedCounter
                              value={parseFloat(insight.metric) || 0}
                              suffix={insight.metric.includes("%") ? "%" : ""}
                              className={`text-lg font-display font-bold ${config.color} shrink-0`}
                            />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{insight.description}</p>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Type</span>
                                  <span className={`font-mono ${config.color}`}>{insight.type}</span>
                                </div>
                                {insight.projectName && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Project</span>
                                    <span className="text-cyan font-mono">{insight.projectName}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex items-center gap-3 mt-3">
                          {insight.projectId && (
                            <Link
                              href={`/projects/${insight.projectId}`}
                              className="inline-flex items-center gap-1 text-xs font-mono text-cyan hover:text-cyan/80 transition-colors"
                              onClick={e => e.stopPropagation()}
                            >
                              View Project <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                          <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors ml-auto">
                            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
