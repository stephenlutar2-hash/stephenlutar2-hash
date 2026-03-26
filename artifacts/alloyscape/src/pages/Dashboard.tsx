import DashboardLayout from "@/components/DashboardLayout";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  Boxes, GitBranch, Activity, Plug, Users, Zap, Clock,
  AlertTriangle, CheckCircle2, XCircle, TrendingUp,
} from "lucide-react";
import { dashboardStats, workflows, modules, serviceHealthData } from "@/data/demo";

const statCards = [
  { label: "Active Modules", value: `${dashboardStats.activeModules}/${dashboardStats.totalModules}`, icon: Boxes, color: "from-cyan-500 to-blue-500", subtext: "Systems online" },
  { label: "Running Workflows", value: dashboardStats.activeWorkflows, icon: GitBranch, color: "from-violet-500 to-purple-500", subtext: `${dashboardStats.queuedWorkflows} queued` },
  { label: "Service Health", value: `${dashboardStats.healthyServices}/${dashboardStats.totalServices}`, icon: Activity, color: "from-emerald-500 to-green-500", subtext: "Services healthy" },
  { label: "Active Connectors", value: `${dashboardStats.activeConnectors}/${dashboardStats.totalConnectors}`, icon: Plug, color: "from-amber-500 to-orange-500", subtext: "Integrations active" },
  { label: "Platform Uptime", value: `${dashboardStats.platformUptime}%`, icon: TrendingUp, color: "from-cyan-500 to-teal-500", subtext: "30-day average" },
  { label: "Events Processed", value: dashboardStats.eventsProcessed.toLocaleString(), icon: Zap, color: "from-pink-500 to-rose-500", subtext: "Total events" },
];

const statusIcon = {
  running: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  degraded: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  offline: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  maintenance: <Clock className="w-3.5 h-3.5 text-blue-400" />,
};

const statusBadge = {
  running: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  completed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  queued: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  failed: "text-red-400 bg-red-500/10 border-red-500/20",
  paused: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export default function Dashboard() {
  const loading = useSimulatedLoading();

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoadingSkeleton title="System Overview" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/5 px-4 py-1.5 text-[10px] font-mono -mt-2">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 uppercase tracking-wider">SZL Portfolio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400">Operational</span>
            <span className="text-gray-600">·</span>
            <span className="text-blue-400">Readiness 90%</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500">0 Alerts</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-gray-500">
            <span>Uptime 99.93%</span>
            <span>·</span>
            <span>Last sync 8 min ago</span>
            <span>·</span>
            <span className="text-amber-400">Demo Mode</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">System Overview</h2>
          <p className="text-sm text-gray-500 mt-1">AlloyScape infrastructure operations dashboard</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{s.subtext}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Workflows</h3>
              <span className="text-xs text-gray-500">{workflows.filter(w => w.status === "running").length} running</span>
            </div>
            <div className="divide-y divide-white/5">
              {workflows.slice(0, 5).map(wf => (
                <div key={wf.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{wf.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{wf.pipeline} &middot; {wf.duration}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge[wf.status]}`}>
                    {wf.status}
                  </span>
                  {wf.status === "running" && (
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${wf.progress}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Module Status</h3>
              <span className="text-xs text-gray-500">{modules.filter(m => m.status === "running").length} running</span>
            </div>
            <div className="divide-y divide-white/5">
              {modules.slice(0, 5).map(mod => (
                <div key={mod.id} className="px-5 py-3 flex items-center gap-3">
                  {statusIcon[mod.status]}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{mod.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">v{mod.version} &middot; {mod.uptime} uptime</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{mod.cpu}% CPU</p>
                    <p className="text-[10px] text-gray-600">{mod.memory}% MEM</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Service Health Overview</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 p-4">
            {serviceHealthData.map(svc => {
              const colors = {
                healthy: "border-emerald-500/20 bg-emerald-500/5",
                warning: "border-amber-500/20 bg-amber-500/5",
                critical: "border-red-500/20 bg-red-500/5",
                unknown: "border-gray-500/20 bg-gray-500/5",
              };
              const dotColors = {
                healthy: "bg-emerald-400",
                warning: "bg-amber-400",
                critical: "bg-red-400",
                unknown: "bg-gray-400",
              };
              return (
                <div key={svc.id} className={`p-3 rounded-lg border ${colors[svc.status]}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${dotColors[svc.status]} ${svc.status === "critical" ? "animate-pulse" : ""}`} />
                    <span className="text-xs font-medium text-white truncate">{svc.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">{svc.responseTime > 0 ? `${svc.responseTime}ms` : "N/A"} &middot; {svc.uptime}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
