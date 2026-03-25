import { useState } from "react";
import { format } from "date-fns";
import { useModules, useMutateModules, useLogs, useMutateLogs } from "@/hooks/use-zeus";
import { Layout } from "@/components/Layout";
import { Modal } from "@/components/Modal";
import { Plus, Edit2, Trash2, Cpu, ActivitySquare } from "lucide-react";
import { cn } from "@workspace/ui";
import type { ZeusModule } from "@workspace/api-client-react";

export default function Zeus() {
  const { data: modules, isLoading: loadingModules } = useModules();
  const { data: logs, isLoading: loadingLogs } = useLogs();
  const { create: createModule, update: updateModule, remove: removeModule } = useMutateModules();
  const { create: createLog } = useMutateLogs();

  const [moduleModal, setModuleModal] = useState<{ isOpen: boolean; data?: ZeusModule }>({ isOpen: false });
  const [logModal, setLogModal] = useState({ isOpen: false });

  const handleModuleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      version: fd.get("version") as string,
      status: fd.get("status") as any,
      category: fd.get("category") as string,
      uptime: Number(fd.get("uptime")),
    };

    if (moduleModal.data) {
      updateModule.mutate({ id: moduleModal.data.id, data });
    } else {
      createModule.mutate({ data });
    }
    setModuleModal({ isOpen: false });
  };

  const handleLogSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createLog.mutate({ data: {
      level: fd.get("level") as any,
      message: fd.get("message") as string,
      module: fd.get("module") as string,
    }});
    setLogModal({ isOpen: false });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-white tracking-wide">ZEUS</h2>
              <p className="text-muted-foreground text-sm font-mono tracking-wider">MODULAR CORE INFRASTRUCTURE</p>
            </div>
          </div>
          <button 
            onClick={() => setModuleModal({ isOpen: true })}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Module</span>
          </button>
        </div>

        {/* MODULES GRID */}
        <div>
          <h3 className="text-lg font-display font-bold text-white mb-6">Active Subsystems</h3>
          {loadingModules ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-48 glass-panel rounded-xl animate-pulse border-cyan-500/20" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {modules?.map(mod => (
                <div key={mod.id} className="glass-panel rounded-xl p-6 border-cyan-500/10 hover:border-cyan-500/30 transition-all group relative">
                   <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setModuleModal({ isOpen: true, data: mod })} className="text-muted-foreground hover:text-white"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => removeModule.mutate({ id: mod.id })} className="text-destructive hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  
                  <div className="flex items-start justify-between mb-4 pr-12">
                    <div>
                      <h4 className="text-lg font-bold text-white">{mod.name}</h4>
                      <p className="text-sm font-mono text-cyan-400/70">v{mod.version} // {mod.category}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[2.5rem]">
                    {mod.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        mod.status === 'active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" :
                        mod.status === 'updating' ? "bg-yellow-500 animate-pulse" :
                        mod.status === 'error' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-zinc-500"
                      )} />
                      <span className="text-xs font-mono font-bold tracking-wider uppercase text-muted-foreground">{mod.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-muted-foreground block">UPTIME</span>
                      <span className="text-sm font-bold text-white">{mod.uptime}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!modules || modules.length === 0) && (
                <div className="col-span-full py-12 text-center text-muted-foreground glass-panel rounded-xl">
                  Core modules offline.
                </div>
              )}
            </div>
          )}
        </div>

        {/* LOGS TABLE */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-white">
              <ActivitySquare className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-display font-bold">System Telemetry Logs</h3>
            </div>
            <button 
              onClick={() => setLogModal({ isOpen: true })}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-white text-sm border border-white/10 rounded-lg hover:bg-white/10 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Log</span>
            </button>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden font-mono text-sm border-cyan-500/20">
            <table className="w-full text-left">
              <thead className="bg-black/40 border-b border-cyan-500/20 text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-3 w-48">Timestamp</th>
                  <th className="px-6 py-3 w-32">Level</th>
                  <th className="px-6 py-3 w-48">Module</th>
                  <th className="px-6 py-3">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingLogs ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Streaming logs...</td></tr>
                ) : logs?.map(log => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3 text-muted-foreground">{format(new Date(log.createdAt), 'HH:mm:ss.SSS')}</td>
                    <td className="px-6 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold tracking-widest",
                        log.level === 'info' ? "bg-cyan-500/10 text-cyan-400" :
                        log.level === 'warn' ? "bg-yellow-500/10 text-yellow-400" :
                        log.level === 'error' ? "bg-red-500/10 text-red-400" :
                        "bg-zinc-500/10 text-zinc-400"
                      )}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-cyan-400/80">{log.module}</td>
                    <td className="px-6 py-3 text-white/90">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={moduleModal.isOpen} onClose={() => setModuleModal({ isOpen: false })} title={moduleModal.data ? "Edit Module" : "Deploy Module"}>
        <form onSubmit={handleModuleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Name</label>
              <input required name="name" defaultValue={moduleModal.data?.name} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Version</label>
              <input required name="version" defaultValue={moduleModal.data?.version} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea required name="description" defaultValue={moduleModal.data?.description} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Status</label>
              <select required name="status" defaultValue={moduleModal.data?.status || 'active'} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 transition-all">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="updating">Updating</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Category</label>
              <input required name="category" defaultValue={moduleModal.data?.category} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Uptime %</label>
              <input required type="number" step="0.01" name="uptime" defaultValue={moduleModal.data?.uptime || 100} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 transition-all" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setModuleModal({ isOpen: false })} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createModule.isPending || updateModule.isPending} className="px-6 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
              Commit Changes
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={logModal.isOpen} onClose={() => setLogModal({ isOpen: false })} title="Inject Telemetry Log">
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Level</label>
              <select required name="level" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 transition-all">
                <option value="info">INFO</option>
                <option value="warn">WARN</option>
                <option value="error">ERROR</option>
                <option value="debug">DEBUG</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Module Source</label>
              <input required name="module" placeholder="e.g. CORE-NET" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Message Payload</label>
            <textarea required name="message" rows={3} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 transition-all resize-none font-mono text-sm" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setLogModal({ isOpen: false })} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createLog.isPending} className="px-6 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/20">
              Inject Log
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
