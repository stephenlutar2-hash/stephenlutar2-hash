import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Boxes, GitBranch, Activity, Plug, Zap,
  AlertTriangle, CheckCircle2, XCircle, Clock, TrendingUp,
  ArrowUpRight, BarChart3, Loader2,
} from "lucide-react";
import { useDashboardStats, useWorkflows, useModules, useServices } from "@/hooks/useAlloyscapeApi";

const statusIcon: Record<string, JSX.Element> = {
  running: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  degraded: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  offline: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  maintenance: <Clock className="w-3.5 h-3.5 text-blue-400" />,
};

const statusBadge: Record<string, string> = {
  running: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  completed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  queued: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  failed: "text-red-400 bg-red-500/10 border-red-500/20",
  paused: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

const timelineDotColor: Record<string, string> = {
  running: "bg-cyan-400 shadow-cyan-400/50",
  completed: "bg-emerald-400 shadow-emerald-400/50",
  failed: "bg-red-400 shadow-red-400/50",
  paused: "bg-amber-400 shadow-amber-400/50",
  queued: "bg-blue-400 shadow-blue-400/50",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, isError: statsErr } = useDashboardStats();
  const { data: workflows = [], isLoading: wfLoading, isError: wfErr } = useWorkflows();
  const { data: modules = [], isLoading: modLoading, isError: modErr } = useModules();
  const { data: services = [], isLoading: svcLoading, isError: svcErr } = useServices();

  const isLoading = statsLoading || wfLoading || modLoading || svcLoading;
  const isError = statsErr || wfErr || modErr || svcErr;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
          <p className="text-gray-400">Failed to load dashboard data. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { label: "Active Modules", value: `${stats?.activeModules ?? 0}/${stats?.totalModules ?? 0}`, icon: Boxes, color: "from-cyan-500 to-blue-500", subtext: "Systems online", trend: "+2", up: true },
    { label: "Running Workflows", value: stats?.activeWorkflows ?? 0, icon: GitBranch, color: "from-violet-500 to-purple-500", subtext: `${stats?.queuedWorkflows ?? 0} queued`, trend: "+1", up: true },
    { label: "Service Health", value: `${stats?.healthyServices ?? 0}/${stats?.totalServices ?? 0}`, icon: Activity, color: "from-emerald-500 to-green-500", subtext: "Services healthy", trend: "98%", up: true },
    { label: "Active Connectors", value: `${stats?.activeConnectors ?? 0}/${stats?.totalConnectors ?? 0}`, icon: Plug, color: "from-amber-500 to-orange-500", subtext: "Integrations active", trend: "+1", up: true },
    { label: "Platform Uptime", value: `${stats?.platformUptime ?? 99.94}%`, icon: TrendingUp, color: "from-cyan-500 to-teal-500", subtext: "30-day average", trend: "0.01%", up: true },
    { label: "Events Processed", value: (stats?.eventsProcessed ?? 0).toLocaleString(), icon: Zap, color: "from-pink-500 to-rose-500", subtext: "Total events", trend: "+12K", up: true },
  ];

  const executionTimeline = workflows.slice(0, 7).map((wf: any) => ({
    time: wf.startedAt ? new Date(wf.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
    label: wf.name,
    status: wf.status,
    pipeline: wf.pipeline,
  }));

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/5 px-4 py-1.5 text-[10px] font-mono -mt-2">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 uppercase tracking-wider">SZL Portfolio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400">Operational</span>
            <span className="text-gray-600">·</span>
            <span className="text-blue-400">Readiness 90%</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500">0 Alerts</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-gray-500">
            <span>Uptime {stats?.platformUptime ?? 99.93}%</span>
            <span>·</span>
            <span>Last sync 8 min ago</span>
            <span>·</span>
            <span className="text-emerald-400">Live</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-white">System Overview</h2>
          <p className="text-sm text-gray-500 mt-1">AlloyScape infrastructure operations dashboard</p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((s) => (
            <motion.div
              key={s.label}
              variants={itemVariants}
              whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.12)" }}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/5 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center group-hover:shadow-lg transition-shadow`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-medium">
                  <ArrowUpRight className="w-3 h-3" />
                  {s.trend}
                </span>
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{s.subtext}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Execution Timeline</h3>
            </div>
            <span className="text-xs text-gray-500">Today</span>
          </div>
          <div className="p-5">
            <div className="relative">
              <div className="absolute left-[52px] top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/30 via-purple-500/20 to-transparent" />
              <div className="space-y-3">
                {executionTimeline.map((evt: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-4 group"
                  >
                    <span className="text-[10px] text-gray-600 font-mono w-10 text-right shrink-0">{evt.time}</span>
                    <div className={`w-2.5 h-2.5 rounded-full ${timelineDotColor[evt.status] || "bg-gray-400"} shadow-sm shrink-0 z-10 ${evt.status === "running" ? "animate-pulse" : ""}`} />
                    <div className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white font-medium">{evt.label}</span>
                        <span className="text-[10px] text-gray-600">{evt.pipeline}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge[evt.status] || "text-gray-400 bg-gray-500/10 border-gray-500/20"}`}>
                        {evt.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Workflows</h3>
              <span className="text-xs text-gray-500">{workflows.filter((w: any) => w.status === "running").length} running</span>
            </div>
            <div className="divide-y divide-white/5">
              {workflows.slice(0, 5).map((wf: any, i: number) => (
                <motion.div
                  key={wf.workflowId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{wf.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{wf.pipeline} &middot; {wf.duration}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge[wf.status] || "text-gray-400 bg-gray-500/10 border-gray-500/20"}`}>
                    {wf.status}
                  </span>
                  {wf.status === "running" && (
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${wf.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Module Health</h3>
              <span className="text-xs text-gray-500">{modules.filter((m: any) => m.status === "running").length} running</span>
            </div>
            <div className="divide-y divide-white/5">
              {modules.slice(0, 5).map((mod: any, i: number) => (
                <motion.div
                  key={mod.moduleId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  {statusIcon[mod.status] || <Clock className="w-3.5 h-3.5 text-gray-400" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{mod.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">v{mod.version} &middot; {mod.uptime} uptime</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{mod.cpu}% CPU</p>
                      <p className="text-[10px] text-gray-600">{mod.memory}% MEM</p>
                    </div>
                    <div className="w-12 h-6 flex items-end gap-px">
                      {[0.3, 0.5, 0.7, 0.4, 0.8, mod.cpu / 100].map((h: number, j: number) => (
                        <motion.div
                          key={j}
                          className={`flex-1 rounded-t-sm ${mod.cpu > 80 ? "bg-red-500/60" : mod.cpu > 50 ? "bg-amber-500/60" : "bg-emerald-500/60"}`}
                          initial={{ height: 0 }}
                          animate={{ height: `${h * 100}%` }}
                          transition={{ delay: 0.5 + j * 0.05, duration: 0.4 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Service Health Overview</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 p-4">
            {services.map((svc: any, i: number) => {
              const colors: Record<string, string> = {
                healthy: "border-emerald-500/20 bg-emerald-500/5",
                warning: "border-amber-500/20 bg-amber-500/5",
                critical: "border-red-500/20 bg-red-500/5",
                unknown: "border-gray-500/20 bg-gray-500/5",
              };
              const dotColors: Record<string, string> = {
                healthy: "bg-emerald-400",
                warning: "bg-amber-400",
                critical: "bg-red-400",
                unknown: "bg-gray-400",
              };
              return (
                <motion.div
                  key={svc.serviceId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.03 }}
                  whileHover={{ scale: 1.03 }}
                  className={`p-3 rounded-lg border ${colors[svc.status] || colors.unknown} transition-all cursor-default`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${dotColors[svc.status] || dotColors.unknown} ${svc.status === "critical" ? "animate-pulse" : ""}`} />
                    <span className="text-xs font-medium text-white truncate">{svc.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">{svc.responseTime > 0 ? `${svc.responseTime}ms` : "N/A"} &middot; {svc.uptime}%</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
