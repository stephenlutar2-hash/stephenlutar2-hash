import { useState, useMemo } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useModules, useMutateModules, useLogs, useMutateLogs } from "@/hooks/use-zeus";
import { Layout } from "@/components/Layout";
import { Modal } from "@/components/Modal";
import { Plus, Edit2, Trash2, Cpu, ActivitySquare, Server, Gauge, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@szl-holdings/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import type { ZeusModule } from "@szl-holdings/api-client-react";

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: '#fff',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function Zeus() {
  const { data: modules, isLoading: loadingModules, error: modulesError } = useModules();
  const { data: logs, isLoading: loadingLogs, error: logsError } = useLogs();
  const { create: createModule, update: updateModule, remove: removeModule } = useMutateModules();
  const { create: createLog } = useMutateLogs();

  const [moduleModal, setModuleModal] = useState<{ isOpen: boolean; data?: ZeusModule }>({ isOpen: false });
  const [logModal, setLogModal] = useState({ isOpen: false });

  const uptimeChartData = useMemo(() => {
    if (!modules) return [];
    return modules.map(m => ({
      name: m.name.length > 10 ? m.name.slice(0, 10) + '…' : m.name,
      uptime: m.uptime,
      fill: m.uptime >= 99 ? '#4ade80' : m.uptime >= 95 ? '#facc15' : '#f87171',
    }));
  }, [modules]);

  const statusCounts = useMemo(() => {
    if (!modules) return { active: 0, inactive: 0, updating: 0, error: 0 };
    const counts = { active: 0, inactive: 0, updating: 0, error: 0 };
    modules.forEach(m => {
      if (counts[m.status as keyof typeof counts] !== undefined) {
        counts[m.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [modules]);

  const avgUptime = useMemo(() => {
    if (!modules || modules.length === 0) return 0;
    return Math.round(modules.reduce((s, m) => s + m.uptime, 0) / modules.length * 100) / 100;
  }, [modules]);

  const logLevelCounts = useMemo(() => {
    if (!logs) return { info: 0, warn: 0, error: 0, debug: 0 };
    const counts = { info: 0, warn: 0, error: 0, debug: 0 };
    logs.forEach(l => {
      if (counts[l.level as keyof typeof counts] !== undefined) {
        counts[l.level as keyof typeof counts]++;
      }
    });
    return counts;
  }, [logs]);

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

  const hasError = modulesError || logsError;

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between border-b border-border/50 pb-6"
        >
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
        </motion.div>

        {hasError && (
          <div className="glass-panel rounded-xl p-6 border border-cyan-500/30 bg-cyan-500/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Failed to load data</p>
                <p className="text-xs text-muted-foreground mt-0.5">Please check your connection and try again.</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Active", value: statusCounts.active, color: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-400" },
            { label: "Updating", value: statusCounts.updating, color: "text-yellow-400", border: "border-yellow-500/20", dot: "bg-yellow-400" },
            { label: "Errors", value: statusCounts.error, color: "text-red-400", border: "border-red-500/20", dot: "bg-red-400" },
            { label: "Avg Uptime", value: `${avgUptime}%`, color: "text-cyan-400", border: "border-cyan-500/20", dot: "bg-cyan-400" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass-panel rounded-xl p-4 border ${stat.border}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${stat.dot}`} />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
              <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {!loadingModules && modules && modules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-xl p-5 border border-cyan-500/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-display uppercase tracking-widest text-cyan-400">Module Uptime Overview</h3>
            </div>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uptimeChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[90, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="uptime" radius={[4, 4, 0, 0]}>
                    {uptimeChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        <div>
          <h3 className="text-lg font-display font-bold text-white mb-6">Active Subsystems</h3>
          {loadingModules ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-panel rounded-xl p-6 animate-pulse border-cyan-500/20 space-y-4">
                  <div className="space-y-2">
                    <div className="h-5 bg-white/5 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                  </div>
                  <div className="h-10 bg-white/5 rounded" />
                  <div className="flex justify-between">
                    <div className="h-4 bg-white/5 rounded w-16" />
                    <div className="h-4 bg-white/5 rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {modules?.map((mod, i) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-panel rounded-xl p-6 border-cyan-500/10 hover:border-cyan-500/30 transition-all group relative"
                >
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
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                    {mod.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Uptime</span>
                      <span className={cn("text-[10px] font-mono", mod.uptime >= 99 ? "text-emerald-400" : mod.uptime >= 95 ? "text-yellow-400" : "text-red-400")}>{mod.uptime}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", mod.uptime >= 99 ? "bg-emerald-500" : mod.uptime >= 95 ? "bg-yellow-500" : "bg-red-500")}
                        initial={{ width: 0 }}
                        animate={{ width: `${mod.uptime}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  
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
                  </div>
                </motion.div>
              ))}
              {(!modules || modules.length === 0) && (
                <div className="col-span-full py-12 text-center text-muted-foreground glass-panel rounded-xl">
                  <Server className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium mb-1">Core modules offline</p>
                  <p className="text-xs text-muted-foreground/60">Deploy a module to bring systems online.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-white">
              <ActivitySquare className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-display font-bold">System Telemetry Logs</h3>
              <div className="hidden sm:flex items-center gap-2 ml-4">
                {[
                  { label: "INFO", count: logLevelCounts.info, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
                  { label: "WARN", count: logLevelCounts.warn, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
                  { label: "ERR", count: logLevelCounts.error, color: "text-red-400 bg-red-500/10 border-red-500/20" },
                ].map(l => (
                  <span key={l.label} className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${l.color}`}>
                    {l.label} {l.count}
                  </span>
                ))}
              </div>
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
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-3"><div className="h-4 bg-white/5 rounded w-24" /></td>
                      <td className="px-6 py-3"><div className="h-4 bg-white/5 rounded w-12" /></td>
                      <td className="px-6 py-3"><div className="h-4 bg-white/5 rounded w-20" /></td>
                      <td className="px-6 py-3"><div className="h-4 bg-white/5 rounded w-full" /></td>
                    </tr>
                  ))
                ) : logs?.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
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
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
