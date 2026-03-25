import { useState } from "react";
import { useIncaProjects, useMutateIncaProjects, useExperiments, useMutateExperiments } from "@/hooks/use-inca";
import { Layout } from "@/components/Layout";
import { Modal } from "@/components/Modal";
import { Plus, Edit2, Trash2, Brain, FlaskConical, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IncaProject } from "@workspace/api-client-react";

export default function Inca() {
  const { data: projects, isLoading: loadingProjects } = useIncaProjects();
  const { data: experiments, isLoading: loadingExperiments } = useExperiments();
  const { create: createProj, update: updateProj, remove: removeProj } = useMutateIncaProjects();
  const { create: createExp } = useMutateExperiments();

  const [projectModal, setProjectModal] = useState<{ isOpen: boolean; data?: IncaProject }>({ isOpen: false });
  const [expModal, setExpModal] = useState({ isOpen: false, projectId: 0 });

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

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
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
        </div>

        {/* PROJECTS GRID */}
        <div>
          <h3 className="text-lg font-display font-bold text-white mb-6">Neural Models in Training</h3>
          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => <div key={i} className="h-48 glass-panel rounded-xl animate-pulse border-violet-500/20" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects?.map(proj => (
                <div key={proj.id} className="glass-panel rounded-xl p-6 border-violet-500/10 hover:border-violet-500/30 transition-all group relative overflow-hidden">
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
                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                    <button 
                      onClick={() => setExpModal({ isOpen: true, projectId: proj.id })}
                      className="text-xs font-mono text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                    >
                      RUN EXPERIMENT <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EXPERIMENTS TABLE */}
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
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading logs...</td></tr>
                ) : experiments?.map(exp => (
                  <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
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
                  </tr>
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
