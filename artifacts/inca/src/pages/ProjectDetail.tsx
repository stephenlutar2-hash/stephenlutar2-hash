import { useState } from "react";
import { motion } from "framer-motion";
import { useIncaProjects, useMutateIncaProjects, useExperiments, useMutateExperiments } from "@/hooks/use-inca";
import ProjectModal from "@/components/ProjectModal";
import ExperimentModal from "@/components/ExperimentModal";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, Edit2, Trash2, Plus, Brain, FlaskConical, Target } from "lucide-react";
import type { IncaProject, CreateIncaProjectStatus, CreateIncaExperimentStatus } from "@workspace/api-client-react";

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
        <div className="h-64 glass-panel rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="glass-panel rounded-xl p-12 text-center max-w-lg mx-auto mt-12">
        <Brain className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
        <h3 className="text-lg font-display font-bold text-white mb-2">Project Not Found</h3>
        <Link href="/projects" className="text-sm text-cyan hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const acc = Number(project.accuracy);
  const completedExps = projectExperiments.filter(e => e.status === "completed").length;
  const runningExps = projectExperiments.filter(e => e.status === "running").length;
  const bestExp = projectExperiments.reduce((best, e) =>
    Number(e.accuracy) > Number(best?.accuracy || 0) ? e : best,
    projectExperiments[0]
  );

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-5xl"
    >
      <div className="flex items-center gap-3">
        <Link href="/projects" className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
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
          <button
            onClick={() => setEditModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 text-muted-foreground hover:text-white border border-border rounded-lg text-sm transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <p className="text-muted-foreground">{project.description}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="metric-card border-cyan/10">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 to-transparent rounded-xl" />
          <div className="relative text-center">
            <Target className="w-5 h-5 text-cyan mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-white">{acc.toFixed(1)}%</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">ACCURACY</p>
          </div>
        </div>
        <div className="metric-card border-violet/10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet/10 to-transparent rounded-xl" />
          <div className="relative text-center">
            <FlaskConical className="w-5 h-5 text-violet mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-white">{projectExperiments.length}</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">EXPERIMENTS</p>
          </div>
        </div>
        <div className="metric-card border-emerald/10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald/10 to-transparent rounded-xl" />
          <div className="relative text-center">
            <p className="text-2xl font-display font-bold text-emerald mt-6">{completedExps}</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">COMPLETED</p>
          </div>
        </div>
        <div className="metric-card border-amber-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl" />
          <div className="relative text-center">
            <p className="text-2xl font-display font-bold text-amber-400 mt-6">{runningExps}</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">RUNNING</p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-violet" />
            <h3 className="font-display font-bold text-white">Experiments</h3>
          </div>
          <button
            onClick={() => setExpModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-violet/15 text-violet border border-violet/30 rounded-lg text-sm hover:bg-violet hover:text-white transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Experiment
          </button>
        </div>

        {loadingExps ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-20 bg-white/[0.03] rounded-lg animate-pulse" />)}
          </div>
        ) : projectExperiments.length === 0 ? (
          <div className="text-center py-8">
            <FlaskConical className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No experiments for this project</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectExperiments.map(exp => (
              <div key={exp.id} className="bg-white/[0.02] rounded-lg p-4 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{exp.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${expStatusColors[exp.status] || expStatusColors.running}`}>
                        {exp.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-lg font-mono font-bold text-white">{exp.accuracy}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Hypothesis</p>
                    <p className="text-xs text-foreground/80">{exp.hypothesis}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Result</p>
                    <p className="text-xs text-foreground/80">{exp.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
