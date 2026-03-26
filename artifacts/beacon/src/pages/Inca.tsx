import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useIncaProjects, useMutateIncaProjects, useExperiments, useMutateExperiments } from "@/hooks/use-inca";
import { Layout } from "@/components/Layout";
import { Modal } from "@/components/Modal";
import { Plus, Edit2, Trash2, Brain, FlaskConical, ChevronRight, Target, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@szl-holdings/ui";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadialBarChart, RadialBar, Legend } from "recharts";
import type { IncaProject } from "@szl-holdings/api-client-react";

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: '#fff',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function Inca() {
  const { data: projects, isLoading: loadingProjects, error: projectsError } = useIncaProjects();
  const { data: experiments, isLoading: loadingExperiments, error: experimentsError } = useExperiments();
  const { create: createProj, update: updateProj, remove: removeProj } = useMutateIncaProjects();
  const { create: createExp } = useMutateExperiments();

  const [projectModal, setProjectModal] = useState<{ isOpen: boolean; data?: IncaProject }>({ isOpen: false });
  const [expModal, setExpModal] = useState({ isOpen: false, projectId: 0 });

  const accuracyChartData = useMemo(() => {
    if (!projects) return [];
    return projects.map(p => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
      accuracy: p.accuracy,
      fill: p.status === 'deployed' ? '#4ade80' : '#a78bfa',
    }));
  }, [projects]);

  const expStatusData = useMemo(() => {
    if (!experiments) return [];
    const counts = { running: 0, completed: 0, failed: 0 };
    experiments.forEach(e => {
      if (counts[e.status as keyof typeof counts] !== undefined) {
        counts[e.status as keyof typeof counts]++;
      }
    });
    return [
      { name: 'Completed', value: counts.completed, fill: '#4ade80' },
      { name: 'Running', value: counts.running, fill: '#facc15' },
      { name: 'Failed', value: counts.failed, fill: '#f87171' },
    ];
  }, [experiments]);

  const avgAccuracy = useMemo(() => {
    if (!projects || projects.length === 0) return 0;
    return Math.round(projects.reduce((s, p) => s + p.accuracy, 0) / projects.length * 10) / 10;
  }, [projects]);

  const handleProjSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      status: fd.get("status") as any,
      aiModel: fd.get("aiModel") as string,
      accuracy: Number(fd.get("accuracy")),
    };

    if (projectModal.data) {
      updateProj.mutate({ id: projectModal.data.id, data });
    } else {
      createProj.mutate({ data });
    }
    setProjectModal({ isOpen: false });
  };

  const handleExpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createExp.mutate({ data: {
      projectId: Number(fd.get("projectId")),
      name: fd.get("name") as string,
      hypothesis: fd.get("hypothesis") as string,
      result: fd.get("result") as string,
      status: fd.get("status") as any,
      accuracy: Number(fd.get("accuracy")),
    }});
    setExpModal({ isOpen: false, projectId: 0 });
  };

  const hasError = projectsError || experimentsError;

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between border-b border-border/50 pb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
              <Brain className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-white tracking-wide">INCA AI</h2>
              <p className="text-muted-foreground text-sm font-mono tracking-wider">NEURAL INNOVATION ENGINE</p>
            </div>
          </div>
          <button 
            onClick={() => setProjectModal({ isOpen: true })}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-400 border border-violet-500/50 rounded-lg hover:bg-violet-500 hover:text-white transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span>Initialize Model</span>
          </button>
        </motion.div>

        {hasError && (
          <div className="glass-panel rounded-xl p-6 border border-violet-500/30 bg-violet-500/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-violet-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Failed to load data</p>
                <p className="text-xs text-muted-foreground mt-0.5">Please check your connection and try again.</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-lg hover:bg-violet-500/20 transition-colors shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Active Models", value: (projects?.length || 0).toString(), color: "text-violet-400", border: "border-violet-500/20" },
            { label: "Avg Accuracy", value: `${avgAccuracy}%`, color: "text-emerald-400", border: "border-emerald-500/20" },
            { label: "Experiments", value: (experiments?.length || 0).toString(), color: "text-cyan-400", border: "border-cyan-500/20" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass-panel rounded-xl p-5 border ${stat.border}`}
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {!loadingProjects && projects && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-xl p-5 border border-violet-500/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-display uppercase tracking-widest text-violet-400">Model Accuracy Comparison</h3>
            </div>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                    {accuracyChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        <div>
          <h3 className="text-lg font-display font-bold text-white mb-6">Neural Models in Training</h3>
          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="glass-panel rounded-xl p-6 animate-pulse border-violet-500/20 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-white/5 rounded w-1/2" />
                      <div className="h-3 bg-white/5 rounded w-1/3" />
                      <div className="h-3 bg-white/5 rounded w-full" />
                    </div>
                  </div>
                  <div className="h-8 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects?.map((proj, i) => (
                <motion.div
                  key={proj.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-panel rounded-xl p-6 border-violet-500/10 hover:border-violet-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 flex gap-2 z-10">
                    <button onClick={() => setProjectModal({ isOpen: true, data: proj })} className="text-muted-foreground hover:text-white"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => removeProj.mutate({ id: proj.id })} className="text-destructive hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-full bg-violet-500/5 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <div className="text-center">
                        <span className="block text-lg font-bold text-violet-400 leading-none">{proj.accuracy}%</span>
                        <span className="text-[9px] font-mono text-muted-foreground">ACCURACY</span>
                      </div>
                    </div>
                    <div className="flex-1 pr-12">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-white">{proj.name}</h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono border",
                          proj.status === 'deployed' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          "bg-violet-500/10 text-violet-400 border-violet-500/20"
                        )}>{proj.status}</span>
                      </div>
                      <p className="text-sm font-mono text-violet-400/50 mb-3">Model: {proj.aiModel}</p>
                      <p className="text-sm text-muted-foreground">{proj.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Accuracy</span>
                      <span className="text-[10px] font-mono text-violet-400">{proj.accuracy}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", proj.accuracy >= 90 ? "bg-emerald-500" : proj.accuracy >= 70 ? "bg-violet-500" : "bg-amber-500")}
                        initial={{ width: 0 }}
                        animate={{ width: `${proj.accuracy}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                    <button 
                      onClick={() => setExpModal({ isOpen: true, projectId: proj.id })}
                      className="text-xs font-mono text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                    >
                      RUN EXPERIMENT <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-8">
          <div className="flex items-center gap-2 text-white mb-6">
            <FlaskConical className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-display font-bold">Experiment Tracking</h3>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden border-violet-500/20">
            <table className="w-full text-left">
              <thead className="bg-black/40 border-b border-violet-500/20 text-xs text-muted-foreground uppercase font-mono">
                <tr>
                  <th className="px-6 py-4 w-16">ID</th>
                  <th className="px-6 py-4 w-48">Experiment</th>
                  <th className="px-6 py-4">Hypothesis & Results</th>
                  <th className="px-6 py-4 w-32">Status</th>
                  <th className="px-6 py-4 w-24 text-right">Result Acc.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingExperiments ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-8" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-32" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-full" /><div className="h-3 bg-white/5 rounded w-2/3 mt-2" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : experiments?.map((exp, i) => (
                  <motion.tr
                    key={exp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 text-muted-foreground font-mono text-sm">#{exp.id}</td>
                    <td className="px-6 py-4 font-semibold text-white text-sm">{exp.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-muted-foreground mb-1">H: {exp.hypothesis}</div>
                      <div className="text-violet-200">R: {exp.result}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border",
                        exp.status === 'completed' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        exp.status === 'failed' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      )}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-white">
                      {exp.accuracy}%
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={projectModal.isOpen} onClose={() => setProjectModal({ isOpen: false })} title={projectModal.data ? "Reconfigure Model" : "Initialize Model"}>
        <form onSubmit={handleProjSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Model Name</label>
              <input required name="name" defaultValue={projectModal.data?.name} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-violet-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Architecture (Model)</label>
              <input required name="aiModel" defaultValue={projectModal.data?.aiModel} placeholder="e.g. GPT-4, Llama-3" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-violet-500 transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea required name="description" defaultValue={projectModal.data?.description} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-violet-500 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Status</label>
              <select required name="status" defaultValue={projectModal.data?.status || 'research'} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-violet-500 transition-all">
                <option value="research">Research</option>
                <option value="development">Development</option>
                <option value="testing">Testing</option>
                <option value="deployed">Deployed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Base Accuracy %</label>
              <input required type="number" step="0.1" name="accuracy" defaultValue={projectModal.data?.accuracy || 0} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-violet-500 transition-all" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setProjectModal({ isOpen: false })} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createProj.isPending || updateProj.isPending} className="px-6 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all">
              Save Initialization
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={expModal.isOpen} onClose={() => setExpModal({ isOpen: false, projectId: 0 })} title="Log Experiment">
        <form onSubmit={handleExpSubmit} className="space-y-4">
          <input type="hidden" name="projectId" value={expModal.projectId} />
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Experiment Designation</label>
            <input required name="name" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-violet-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Hypothesis</label>
            <textarea required name="hypothesis" rows={2} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-violet-500 transition-all resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Result / Findings</label>
            <textarea required name="result" rows={2} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-violet-500 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Status</label>
              <select required name="status" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-violet-500 transition-all">
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">New Accuracy %</label>
              <input required type="number" step="0.1" name="accuracy" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-violet-500 transition-all" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setExpModal({ isOpen: false, projectId: 0 })} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createExp.isPending} className="px-6 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/20">
              Submit Log
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
