import { motion } from "framer-motion";
import { useIncaProjects, useExperiments } from "@/hooks/use-inca";
import { Link } from "wouter";
import {
  FolderKanban, FlaskConical, Target, Lightbulb,
  TrendingUp, ArrowRight, Brain, Zap
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function Dashboard() {
  const { data: projects, isLoading: loadingProjects } = useIncaProjects();
  const { data: experiments, isLoading: loadingExperiments } = useExperiments();

  const totalProjects = projects?.length || 0;
  const activeExperiments = experiments?.filter(e => e.status === "running").length || 0;
  const totalExperiments = experiments?.length || 0;
  const completedExperiments = experiments?.filter(e => e.status === "completed").length || 0;
  const failedExperiments = experiments?.filter(e => e.status === "failed").length || 0;

  const avgAccuracy = projects && projects.length > 0
    ? (projects.reduce((sum, p) => sum + Number(p.accuracy), 0) / projects.length).toFixed(1)
    : "0.0";

  const topProject = projects?.reduce((best, p) =>
    Number(p.accuracy) > Number(best?.accuracy || 0) ? p : best
  , projects?.[0]);

  const recentExperiments = experiments
    ?.slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5) || [];

  const deployedProjects = projects?.filter(p => p.status === "deployed").length || 0;

  const metrics = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: FolderKanban,
      color: "cyan",
      gradient: "from-cyan/20 to-cyan/5",
      borderColor: "border-cyan/20",
    },
    {
      label: "Active Experiments",
      value: activeExperiments,
      icon: FlaskConical,
      color: "violet",
      gradient: "from-violet/20 to-violet/5",
      borderColor: "border-violet/20",
    },
    {
      label: "Avg. Accuracy",
      value: `${avgAccuracy}%`,
      icon: Target,
      color: "emerald",
      gradient: "from-emerald/20 to-emerald/5",
      borderColor: "border-emerald/20",
    },
    {
      label: "Insights Generated",
      value: completedExperiments + deployedProjects,
      icon: Lightbulb,
      color: "amber",
      gradient: "from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-500/20",
    },
  ];

  const isLoading = loadingProjects || loadingExperiments;

  return (
    <motion.div {...fadeIn} className="space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Command Center</h2>
          <p className="text-muted-foreground mt-1 text-sm">Executive intelligence overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className={`metric-card ${m.borderColor}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} rounded-xl opacity-50`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <m.icon className={`w-5 h-5 text-${m.color}`} />
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-display font-bold text-white">{m.value}</p>
                )}
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{m.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="lg:col-span-2 glass-panel rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-violet" />
              <h3 className="font-display font-bold text-white">Recent Experiments</h3>
            </div>
            <Link href="/experiments" className="text-xs font-mono text-cyan hover:text-cyan/80 flex items-center gap-1 transition-colors">
              VIEW ALL <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-white/[0.03] rounded-lg animate-pulse" />
              ))}
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
              {recentExperiments.map(exp => {
                const proj = projects?.find(p => p.id === exp.projectId);
                return (
                  <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        exp.status === "completed" ? "bg-emerald" :
                        exp.status === "failed" ? "bg-destructive" :
                        "bg-amber-400 animate-pulse"
                      }`} />
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
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="glass-panel rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Brain className="w-4 h-4 text-cyan" />
            <h3 className="font-display font-bold text-white">Top Model</h3>
          </div>

          {isLoading ? (
            <div className="h-40 bg-white/[0.03] rounded-lg animate-pulse" />
          ) : topProject ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan/20 to-violet/20 border border-cyan/30 mx-auto flex items-center justify-center mb-3">
                  <span className="text-2xl font-display font-bold text-cyan">{Number(topProject.accuracy).toFixed(0)}%</span>
                </div>
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

              <Link
                href={`/projects/${topProject.id}`}
                className="block w-full text-center text-xs font-mono text-cyan bg-cyan/10 border border-cyan/20 rounded-lg py-2 hover:bg-cyan/20 transition-colors"
              >
                VIEW PROJECT <ArrowRight className="w-3 h-3 inline ml-1" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No models yet</p>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="glass-panel rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="font-display font-bold text-white">Performance Overview</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.03] rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-emerald">{completedExperiments}</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">COMPLETED</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-amber-400">{activeExperiments}</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">RUNNING</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-destructive">{failedExperiments}</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">FAILED</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-4 text-center">
            <p className="text-2xl font-display font-bold text-cyan">{deployedProjects}</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">DEPLOYED</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
