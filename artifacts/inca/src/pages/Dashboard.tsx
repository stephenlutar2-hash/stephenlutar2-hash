import { motion } from "framer-motion";
import { useIncaProjects, useExperiments } from "@/hooks/use-inca";
import { Link } from "wouter";
import {
  FolderKanban, FlaskConical, Target, Lightbulb,
  TrendingUp, TrendingDown, ArrowRight, Brain, Zap, Clock, Activity
} from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import Sparkline from "@/components/Sparkline";
import { SkeletonMetricCard, SkeletonRow } from "@/components/SkeletonLoader";
import { useMemo } from "react";

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
};

function generateSparklineData(seed: number, length = 10) {
  const data: number[] = [];
  let val = seed;
  for (let i = 0; i < length; i++) {
    const pseudo = Math.sin(seed * 9301 + i * 49297) * 0.5 + 0.5;
    val = val + (Math.sin(i * 0.8 + seed) * 3) + (pseudo - 0.3) * 2;
    data.push(Math.max(0, val));
  }
  return data;
}

export default function Dashboard() {
  const { data: projects, isLoading: loadingProjects } = useIncaProjects();
  const { data: experiments, isLoading: loadingExperiments } = useExperiments();

  const totalProjects = projects?.length || 0;
  const activeExperiments = experiments?.filter(e => e.status === "running").length || 0;
  const totalExperiments = experiments?.length || 0;
  const completedExperiments = experiments?.filter(e => e.status === "completed").length || 0;
  const failedExperiments = experiments?.filter(e => e.status === "failed").length || 0;

  const avgAccuracy = projects && projects.length > 0
    ? (projects.reduce((sum, p) => sum + Number(p.accuracy), 0) / projects.length)
    : 0;

  const topProject = projects?.reduce((best, p) =>
    Number(p.accuracy) > Number(best?.accuracy || 0) ? p : best
  , projects?.[0]);

  const recentExperiments = experiments
    ?.slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5) || [];

  const deployedProjects = projects?.filter(p => p.status === "deployed").length || 0;

  const sparklines = useMemo(() => ({
    projects: generateSparklineData(totalProjects + 5),
    experiments: generateSparklineData(activeExperiments + 10),
    accuracy: generateSparklineData(avgAccuracy / 4),
    insights: generateSparklineData(completedExperiments + 3),
  }), [totalProjects, activeExperiments, avgAccuracy, completedExperiments]);

  const metrics = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: FolderKanban,
      iconClass: "text-cyan",
      gradient: "from-cyan/20 to-cyan/5",
      borderColor: "border-cyan/20",
      trend: "+12%",
      trendUp: true,
      sparkData: sparklines.projects,
      sparkColor: "hsl(192, 85%, 55%)",
    },
    {
      label: "Active Experiments",
      value: activeExperiments,
      icon: FlaskConical,
      iconClass: "text-violet",
      gradient: "from-violet/20 to-violet/5",
      borderColor: "border-violet/20",
      trend: `${totalExperiments} total`,
      trendUp: true,
      sparkData: sparklines.experiments,
      sparkColor: "hsl(263, 70%, 58%)",
    },
    {
      label: "Avg. Accuracy",
      value: avgAccuracy,
      suffix: "%",
      icon: Target,
      iconClass: "text-emerald",
      gradient: "from-emerald/20 to-emerald/5",
      borderColor: "border-emerald/20",
      trend: avgAccuracy >= 75 ? "On target" : "Below target",
      trendUp: avgAccuracy >= 75,
      sparkData: sparklines.accuracy,
      sparkColor: "hsl(160, 84%, 39%)",
    },
    {
      label: "Insights Generated",
      value: completedExperiments + deployedProjects,
      icon: Lightbulb,
      iconClass: "text-amber-400",
      gradient: "from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-500/20",
      trend: "+3 new",
      trendUp: true,
      sparkData: sparklines.insights,
      sparkColor: "hsl(38, 92%, 50%)",
    },
  ];

  const isLoading = loadingProjects || loadingExperiments;

  const recentActivity = useMemo(() => {
    const items: { id: string; type: string; text: string; time: string; color: string }[] = [];
    if (experiments) {
      experiments
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4)
        .forEach(exp => {
          items.push({
            id: `exp-${exp.id}`,
            type: exp.status === "completed" ? "success" : exp.status === "failed" ? "error" : "running",
            text: `${exp.name} — ${exp.status}`,
            time: new Date(exp.createdAt).toLocaleDateString(),
            color: exp.status === "completed" ? "text-emerald" : exp.status === "failed" ? "text-destructive" : "text-amber-400",
          });
        });
    }
    return items;
  }, [experiments]);

  return (
    <motion.div {...pageTransition} className="space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <motion.h2
            className="text-3xl font-display font-bold text-white"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Command Center
          </motion.h2>
          <motion.p
            className="text-muted-foreground mt-1 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Executive intelligence overview
          </motion.p>
        </div>
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-emerald"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs font-mono text-muted-foreground">LIVE</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading ? (
          <SkeletonMetricCard />
        ) : (
          metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className={`metric-card ${m.borderColor} group cursor-default`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} rounded-xl opacity-50`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <motion.div
                    whileHover={{ rotate: 12 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <m.icon className={`w-5 h-5 ${m.iconClass}`} />
                  </motion.div>
                  <Sparkline data={m.sparkData} color={m.sparkColor} width={64} height={24} />
                </div>
                <div className="space-y-1">
                  <AnimatedCounter
                    value={m.value}
                    suffix={m.suffix}
                    decimals={m.suffix === "%" ? 1 : 0}
                    className="text-2xl font-display font-bold text-white block"
                  />
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{m.label}</p>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {m.trendUp ? (
                    <TrendingUp className="w-3 h-3 text-emerald" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-amber-400" />
                  )}
                  <span className={`text-[10px] font-mono ${m.trendUp ? "text-emerald" : "text-amber-400"}`}>
                    {m.trend}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
        {isLoading && <><SkeletonMetricCard /><SkeletonMetricCard /><SkeletonMetricCard /></>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2 glass-panel rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-violet" />
              <h3 className="font-display font-bold text-white">Recent Experiments</h3>
            </div>
            <Link href="/experiments" className="text-xs font-mono text-cyan hover:text-cyan/80 flex items-center gap-1 transition-colors group">
              VIEW ALL <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : recentExperiments.length === 0 ? (
            <div className="text-center py-8">
              <FlaskConical className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No experiments yet</p>
              <Link href="/projects" className="text-xs text-cyan mt-2 inline-block hover:underline">
                Create a project to get started
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentExperiments.map((exp, idx) => {
                const proj = projects?.find(p => p.id === exp.projectId);
                return (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.06 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-default"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <motion.div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          exp.status === "completed" ? "bg-emerald" :
                          exp.status === "failed" ? "bg-destructive" :
                          "bg-amber-400"
                        }`}
                        animate={exp.status === "running" ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{exp.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {proj?.name || `Project #${exp.projectId}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        exp.status === "completed" ? "bg-emerald/10 text-emerald border-emerald/20" :
                        exp.status === "failed" ? "bg-destructive/10 text-destructive border-destructive/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {exp.status.toUpperCase()}
                      </span>
                      <span className="text-sm font-mono text-white w-14 text-right">{exp.accuracy}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Brain className="w-4 h-4 text-cyan" />
            <h3 className="font-display font-bold text-white">Top Model</h3>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <motion.div
                  className="w-20 h-20 rounded-full bg-white/[0.04]"
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              </div>
              <motion.div className="h-5 w-32 mx-auto bg-white/[0.04] rounded" animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }} />
            </div>
          ) : topProject ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <motion.div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan/20 to-violet/20 border border-cyan/30 mx-auto flex items-center justify-center mb-3 relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-cyan/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    style={{ borderTopColor: "hsl(192, 85%, 55%)", borderRightColor: "transparent" }}
                  />
                  <AnimatedCounter
                    value={Number(topProject.accuracy)}
                    suffix="%"
                    decimals={0}
                    className="text-2xl font-display font-bold text-cyan"
                  />
                </motion.div>
                <h4 className="text-lg font-bold text-white">{topProject.name}</h4>
                <p className="text-xs font-mono text-violet mt-1">{topProject.aiModel}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-mono ${
                    topProject.status === "deployed" ? "text-emerald" : "text-cyan"
                  }`}>{topProject.status}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Experiments</span>
                  <span className="text-white font-mono">
                    {experiments?.filter(e => e.projectId === topProject.id).length || 0}
                  </span>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={`/projects/${topProject.id}`}
                  className="block w-full text-center text-xs font-mono text-cyan bg-cyan/10 border border-cyan/20 rounded-lg py-2 hover:bg-cyan/20 transition-colors"
                >
                  VIEW PROJECT <ArrowRight className="w-3 h-3 inline ml-1" />
                </Link>
              </motion.div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No models yet</p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-bold text-white">Performance Overview</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "COMPLETED", value: completedExperiments, color: "text-emerald", bgColor: "from-emerald/10" },
              { label: "RUNNING", value: activeExperiments, color: "text-amber-400", bgColor: "from-amber-500/10" },
              { label: "FAILED", value: failedExperiments, color: "text-destructive", bgColor: "from-destructive/10" },
              { label: "DEPLOYED", value: deployedProjects, color: "text-cyan", bgColor: "from-cyan/10" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="bg-white/[0.03] rounded-lg p-4 text-center relative overflow-hidden group"
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <AnimatedCounter value={item.value} className={`text-2xl font-display font-bold ${item.color}`} />
                  <p className="text-xs font-mono text-muted-foreground mt-1">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {totalExperiments > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Success Rate</span>
                <span className="font-mono text-white">
                  {totalExperiments > 0 ? ((completedExperiments / totalExperiments) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald to-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${totalExperiments > 0 ? (completedExperiments / totalExperiments) * 100 : 0}%` }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-violet" />
            <h3 className="font-display font-bold text-white">Recent Activity</h3>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + idx * 0.06 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    item.type === "success" ? "bg-emerald" :
                    item.type === "error" ? "bg-destructive" :
                    "bg-amber-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/80 truncate">{item.text}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">{item.time}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
