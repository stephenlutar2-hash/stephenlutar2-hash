import { motion } from "framer-motion";
import { useIncaProjects, useExperiments } from "@/hooks/use-inca";
import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";
import {
  Lightbulb, TrendingUp, AlertTriangle,
  CheckCircle2, ArrowRight, Brain, Sparkles
} from "lucide-react";
import type { IncaProject, IncaExperiment } from "@workspace/api-client-react";

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

export default function Insights() {
  const { data: projects, isLoading: loadingProjects } = useIncaProjects();
  const { data: experiments, isLoading: loadingExps } = useExperiments();

  const isLoading = loadingProjects || loadingExps;

  const insights = !isLoading && projects && experiments
    ? generateInsights(projects, experiments)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl"
    >
      <div>
        <h2 className="text-3xl font-display font-bold text-white">Insights</h2>
        <p className="text-muted-foreground mt-1 text-sm">AI-generated intelligence from your projects and experiments</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 glass-panel rounded-xl animate-pulse" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
          <Lightbulb className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-white mb-1">No insights yet</h3>
          <p className="text-sm text-muted-foreground">Insights will be generated as you add projects and experiments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {insights.map((insight, i) => {
            const config = typeConfig[insight.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className={`glass-panel-hover rounded-xl p-5 ${config.border}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                      {insight.metric && (
                        <span className={`text-lg font-display font-bold ${config.color} shrink-0`}>
                          {insight.metric}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{insight.description}</p>
                    {insight.projectId && (
                      <Link
                        href={`/projects/${insight.projectId}`}
                        className="inline-flex items-center gap-1 text-xs font-mono text-cyan mt-3 hover:text-cyan/80 transition-colors"
                      >
                        View Project <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
