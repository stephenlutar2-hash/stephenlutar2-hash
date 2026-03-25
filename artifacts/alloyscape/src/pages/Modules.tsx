import DashboardLayout from "@/components/DashboardLayout";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, Cpu, HardDrive, Layers,
} from "lucide-react";
import { modules } from "@/data/demo";

const statusConfig = {
  running: { label: "Running", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  degraded: { label: "Degraded", icon: AlertTriangle, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  offline: { label: "Offline", icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
  maintenance: { label: "Maintenance", icon: Clock, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", dot: "bg-blue-400" },
};

export default function Modules() {
  const loading = useSimulatedLoading();

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoadingSkeleton title="System Modules" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">System Modules</h2>
          <p className="text-sm text-gray-500 mt-1">All registered modules and services with status and version info</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const count = modules.filter(m => m.status === key).length;
            return (
              <div key={key} className={`px-3 py-2 rounded-lg border ${cfg.color} flex items-center gap-2`}>
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-xs font-medium">{cfg.label}: {count}</span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {modules.map(mod => {
            const cfg = statusConfig[mod.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={mod.id} className="rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white">{mod.name}</h3>
                        <span className="text-[10px] text-gray-500 font-mono">v{mod.version}</span>
                      </div>
                      <p className="text-xs text-gray-400">{mod.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ml-2 flex items-center gap-1 ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="p-2 rounded-lg bg-white/[0.03] text-center">
                      <Cpu className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
                      <p className="text-sm font-bold text-white">{mod.cpu}%</p>
                      <p className="text-[10px] text-gray-600">CPU</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.03] text-center">
                      <HardDrive className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
                      <p className="text-sm font-bold text-white">{mod.memory}%</p>
                      <p className="text-[10px] text-gray-600">Memory</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.03] text-center">
                      <Layers className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
                      <p className="text-sm font-bold text-white">{mod.instances}</p>
                      <p className="text-[10px] text-gray-600">Instances</p>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                  <span>Uptime: {mod.uptime}</span>
                  <span>Last check: {mod.lastHealthCheck}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
