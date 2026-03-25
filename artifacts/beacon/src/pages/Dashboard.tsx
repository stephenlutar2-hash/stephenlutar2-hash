import { useState } from "react";
import { motion } from "framer-motion";
import { useMetrics, useMutateMetrics, useProjects, useMutateProjects } from "@/hooks/use-beacon";
import { Layout } from "@/components/Layout";
import { Modal } from "@/components/Modal";
import { Plus, TrendingUp, TrendingDown, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BeaconMetric, BeaconProject } from "@workspace/api-client-react";

export default function Dashboard() {
  const { data: metrics, isLoading: loadingMetrics } = useMetrics();
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { create: createMetric, update: updateMetric, remove: removeMetric } = useMutateMetrics();
  const { create: createProject, update: updateProject, remove: removeProject } = useMutateProjects();

  const [metricModal, setMetricModal] = useState<{ isOpen: boolean; data?: BeaconMetric }>({ isOpen: false });
  const [projectModal, setProjectModal] = useState<{ isOpen: boolean; data?: BeaconProject }>({ isOpen: false });

  const handleMetricSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      value: Number(fd.get("value")),
      unit: fd.get("unit") as string,
      change: Number(fd.get("change")),
      category: fd.get("category") as string,
    };

    if (metricModal.data) {
      updateMetric.mutate({ id: metricModal.data.id, data });
    } else {
      createMetric.mutate({ data });
    }
    setMetricModal({ isOpen: false });
  };

  const handleProjectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      status: fd.get("status") as any,
      progress: Number(fd.get("progress")),
      platform: fd.get("platform") as string,
    };

    if (projectModal.data) {
      updateProject.mutate({ id: projectModal.data.id, data });
    } else {
      createProject.mutate({ data });
    }
    setProjectModal({ isOpen: false });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-display font-bold glow-text">Overview Telemetry</h2>
            <p className="text-muted-foreground mt-1">Aggregated global metrics across all active holdings.</p>
          </div>
          <button 
            onClick={() => setMetricModal({ isOpen: true })}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all glow-border"
          >
            <Plus className="w-4 h-4" />
            <span>Add Metric</span>
          </button>
        </div>

        {/* METRICS GRID */}
        {loadingMetrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 glass-panel rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics?.map((metric, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={metric.id} 
                className="glass-panel rounded-xl p-6 group relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button onClick={() => setMetricModal({ isOpen: true, data: metric })} className="text-muted-foreground hover:text-white"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => removeMetric.mutate({ id: metric.id })} className="text-destructive hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
                <p className="text-sm font-mono text-muted-foreground mb-4">{metric.category} // {metric.name}</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-display font-bold text-white">{metric.value}</span>
                  <span className="text-lg text-muted-foreground mb-1">{metric.unit}</span>
                </div>
                <div className={cn("mt-4 flex items-center gap-1.5 text-sm font-medium", metric.change >= 0 ? "text-green-400" : "text-destructive")}>
                  {metric.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(metric.change)}% from last cycle</span>
                </div>
              </motion.div>
            ))}
            {(!metrics || metrics.length === 0) && (
              <div className="col-span-full py-12 text-center text-muted-foreground glass-panel rounded-xl">
                No telemetry metrics deployed.
              </div>
            )}
          </div>
        )}

        {/* PROJECTS SECTION */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-bold text-white">Active Initiatives</h3>
            <button 
              onClick={() => setProjectModal({ isOpen: true })}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Initiative</span>
            </button>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-display tracking-wider text-xs text-muted-foreground uppercase">Project</th>
                  <th className="px-6 py-4 font-display tracking-wider text-xs text-muted-foreground uppercase">Platform</th>
                  <th className="px-6 py-4 font-display tracking-wider text-xs text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-4 font-display tracking-wider text-xs text-muted-foreground uppercase">Progress</th>
                  <th className="px-6 py-4 font-display tracking-wider text-xs text-muted-foreground uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loadingProjects ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading initiatives...</td></tr>
                ) : projects?.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No active initiatives found.</td></tr>
                ) : (
                  projects?.map((project) => (
                    <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{project.name}</div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-primary">{project.platform}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 text-xs rounded-full border font-bold tracking-wider uppercase",
                          project.status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          project.status === 'building' ? "bg-primary/10 text-primary border-primary/20" :
                          project.status === 'planning' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                          "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        )}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 w-48">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-1000 relative"
                              style={{ width: `${project.progress}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                            </div>
                          </div>
                          <span className="text-sm font-mono text-muted-foreground">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setProjectModal({ isOpen: true, data: project })} className="p-2 text-muted-foreground hover:text-white transition-colors inline-block"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => removeProject.mutate({ id: project.id })} className="p-2 text-muted-foreground hover:text-destructive transition-colors inline-block ml-2"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <Modal isOpen={metricModal.isOpen} onClose={() => setMetricModal({ isOpen: false })} title={metricModal.data ? "Edit Metric" : "Deploy New Metric"}>
        <form onSubmit={handleMetricSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Metric Name</label>
            <input required name="name" defaultValue={metricModal.data?.name} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Value</label>
              <input required type="number" step="0.01" name="value" defaultValue={metricModal.data?.value} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Unit</label>
              <input required name="unit" placeholder="e.g. M, %, ms" defaultValue={metricModal.data?.unit} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Change %</label>
              <input required type="number" step="0.1" name="change" defaultValue={metricModal.data?.change} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Category</label>
              <input required name="category" defaultValue={metricModal.data?.category} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setMetricModal({ isOpen: false })} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createMetric.isPending || updateMetric.isPending} className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 glow-border transition-all">
              {createMetric.isPending || updateMetric.isPending ? "Deploying..." : "Save Metric"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={projectModal.isOpen} onClose={() => setProjectModal({ isOpen: false })} title={projectModal.data ? "Edit Initiative" : "New Initiative"}>
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Project Name</label>
            <input required name="name" defaultValue={projectModal.data?.name} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea required name="description" defaultValue={projectModal.data?.description} rows={3} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Status</label>
              <select required name="status" defaultValue={projectModal.data?.status || 'planning'} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all">
                <option value="active">Active</option>
                <option value="building">Building</option>
                <option value="planning">Planning</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Platform</label>
              <input required name="platform" defaultValue={projectModal.data?.platform} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Progress ({projectModal.data?.progress || 0}%)</label>
            <input required type="range" name="progress" min="0" max="100" defaultValue={projectModal.data?.progress || 0} className="w-full accent-primary" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setProjectModal({ isOpen: false })} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createProject.isPending || updateProject.isPending} className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 glow-border transition-all">
              Save Initiative
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
