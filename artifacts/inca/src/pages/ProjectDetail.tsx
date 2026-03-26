import { useState } from "react";
import { motion } from "framer-motion";
import { useIncaProjects, useMutateIncaProjects, useExperiments, useMutateExperiments } from "@/hooks/use-inca";
import ProjectModal from "@/components/ProjectModal";
import ExperimentModal from "@/components/ExperimentModal";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, Edit2, Trash2, Plus, Brain, FlaskConical, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import type { CreateIncaProjectStatus, CreateIncaExperimentStatus } from "@szl-holdings/api-client-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import Sparkline from "@/components/Sparkline";
import { SkeletonMetricCard, SkeletonRow } from "@/components/SkeletonLoader";

const statusColors: Record<string, string> = {
  research: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  development: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  testing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  deployed: "bg-emerald/10 text-emerald border-emerald/20",
  archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const expStatusColors: Record<string, string> = {
  running: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-emerald/10 text-emerald border-emerald/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusSteps = ["research", "development", "testing", "deployed"];

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
};

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data: projects, isLoading: loadingProjects } = useIncaProjects();
  const { data: experiments, isLoading: loadingExps } = useExperiments();
  const { update, remove } = useMutateIncaProjects();
  const { create: createExp } = useMutateExperiments();

  const [editModal, setEditModal] = useState(false);
  const [expModal, setExpModal] = useState(false);

  const project = projects?.find(p => p.id === Number(params.id));
  const projectExperiments = experiments
    ?.filter(e => e.projectId === Number(params.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

  if (loadingProjects) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
        <div className="glass-panel rounded-xl p-6 space-y-3">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <motion.div {...pageTransition} className="glass-panel rounded-xl p-12 text-center max-w-lg mx-auto mt-12">
        <Brain className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
        <h3 className="text-lg font-display font-bold text-white mb-2">Project Not Found</h3>
        <Link href="/projects" className="text-sm text-cyan hover:underline">
          Back to Projects
        </Link>
      </motion.div>
    );
  }

  const acc = Number(project.accuracy);
  const completedExps = projectExperiments.filter(e => e.status === "completed").length;
  const bestExp = projectExperiments.reduce((best, e) =>
    Number(e.accuracy) > Number(best?.accuracy || 0) ? e : best,
    projectExperiments[0]
  );
  const activeStepIdx = statusSteps.indexOf(project.status);

  const accuracyTrend = projectExperiments
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(e => Number(e.accuracy));

  const handleEdit = (data: { name: string; description: string; status: CreateIncaProjectStatus; aiModel: string; accuracy: number }) => {
    update.mutate({ id: project.id, data });
    setEditModal(false);
  };

  const handleDelete = () => {
    if (window.confirm("Delete this project and all associated data?")) {
      remove.mutate({ id: project.id });
      setLocation("/projects");
    }
  };

  const handleExpSubmit = (data: { projectId: number; name: string; hypothesis: string; result: string; status: CreateIncaExperimentStatus; accuracy: number }) => {
    createExp.mutate({ data });
    setExpModal(false);
  };

  return (
    <motion.div {...pageTransition} className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
          <Link href="/projects" className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-display font-bold text-white">{project.name}</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${statusColors[project.status] || statusColors.research}`}>
              {project.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{project.aiModel}</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={() => setEditModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 text-muted-foreground hover:text-white border border-border rounded-lg text-sm transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </motion.button>
          <motion.button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm hover:bg-destructive/20 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl p-6"
      >
        <p className="text-muted-foreground">{project.description}</p>

        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Project Pipeline</p>
          <div className="flex items-center gap-2">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <motion.div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono flex-1 justify-center ${
                    i <= activeStepIdx
                      ? "bg-cyan/10 text-cyan border border-cyan/20"
                      : "bg-white/[0.03] text-muted-foreground border border-white/5"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                >
                  {i < activeStepIdx && <CheckCircle2 className="w-3 h-3" />}
                  {i === activeStepIdx && (
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-cyan"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  {step}
                </motion.div>
                {i < statusSteps.length - 1 && (
                  <div className={`w-6 h-px ${i < activeStepIdx ? "bg-cyan/40" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            icon: Target,
            label: "ACCURACY",
            value: acc,
            suffix: "%",
            decimals: 1,
            color: "text-cyan",
            borderColor: "border-cyan/10",
            gradient: "from-cyan/10",
            sparkData: accuracyTrend,
            sparkColor: "hsl(192, 85%, 55%)",
          },
          {
            icon: FlaskConical,
            label: "EXPERIMENTS",
            value: projectExperiments.length,
            color: "text-violet",
            borderColor: "border-violet/10",
            gradient: "from-violet/10",
          },
          {
            icon: CheckCircle2,
            label: "COMPLETED",
            value: completedExps,
            color: "text-emerald",
            borderColor: "border-emerald/10",
            gradient: "from-emerald/10",
          },
          {
            icon: TrendingUp,
            label: "BEST ACCURACY",
            value: bestExp ? Number(bestExp.accuracy) : 0,
            suffix: "%",
            decimals: 1,
            color: "text-amber-400",
            borderColor: "border-amber-500/10",
            gradient: "from-amber-500/10",
          },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            className={`metric-card ${m.borderColor}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            whileHover={{ y: -2 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} to-transparent rounded-xl`} />
            <div className="relative text-center">
              <m.icon className={`w-5 h-5 ${m.color} mx-auto mb-2`} />
              <AnimatedCounter
                value={m.value}
                suffix={m.suffix}
                decimals={m.decimals}
                className={`text-2xl font-display font-bold text-white block`}
              />
              <p className="text-[10px] font-mono text-muted-foreground mt-1">{m.label}</p>
              {m.sparkData && m.sparkData.length > 1 && (
                <div className="flex justify-center mt-2">
                  <Sparkline data={m.sparkData} color={m.sparkColor!} width={60} height={20} />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-violet" />
            <h3 className="font-display font-bold text-white">Experiments</h3>
            <span className="text-xs font-mono text-muted-foreground ml-1">({projectExperiments.length})</span>
          </div>
          <motion.button
            onClick={() => setExpModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-violet/15 text-violet border border-violet/30 rounded-lg text-sm hover:bg-violet hover:text-white transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="w-3.5 h-3.5" />
            New Experiment
          </motion.button>
        </div>

        {loadingExps ? (
          <div className="space-y-3">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : projectExperiments.length === 0 ? (
          <div className="text-center py-8">
            <FlaskConical className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No experiments for this project</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectExperiments.map((exp, idx) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + idx * 0.05 }}
                whileHover={{ x: 4 }}
                className="bg-white/[0.02] rounded-lg p-4 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <motion.div
                        className={`w-2 h-2 rounded-full ${
                          exp.status === "completed" ? "bg-emerald" :
                          exp.status === "failed" ? "bg-destructive" :
                          "bg-amber-400"
                        }`}
                        animate={exp.status === "running" ? { scale: [1, 1.5, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <h4 className="text-sm font-semibold text-white">{exp.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${expStatusColors[exp.status] || expStatusColors.running}`}>
                        {exp.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-4">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-white">{exp.accuracy}%</span>
                  </div>
                </div>

                <div className="ml-4 mt-2 mb-3">
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        exp.status === "completed" ? "bg-gradient-to-r from-emerald to-emerald/70" :
                        exp.status === "failed" ? "bg-gradient-to-r from-destructive to-destructive/70" :
                        "bg-gradient-to-r from-amber-400 to-amber-500/70"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${exp.accuracy}%` }}
                      transition={{ delay: 0.5 + idx * 0.05, duration: 0.8 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 ml-4">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Hypothesis</p>
                    <p className="text-xs text-foreground/80">{exp.hypothesis}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Result</p>
                    <p className="text-xs text-foreground/80">{exp.result}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <ProjectModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        onSubmit={handleEdit}
        project={project}
        isPending={update.isPending}
      />

      <ExperimentModal
        isOpen={expModal}
        onClose={() => setExpModal(false)}
        projectId={project.id}
        projectName={project.name}
        onSubmit={handleExpSubmit}
        isPending={createExp.isPending}
      />
    </motion.div>
  );
}
