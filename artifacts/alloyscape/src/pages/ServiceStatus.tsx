import DashboardLayout from "@/components/DashboardLayout";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  Activity, CheckCircle2, AlertTriangle, XCircle, HelpCircle,
  Clock, Globe, Zap,
} from "lucide-react";
import { serviceHealthData } from "@/data/demo";

const statusConfig = {
  healthy: { label: "Healthy", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400", bar: "bg-emerald-500" },
  warning: { label: "Warning", icon: AlertTriangle, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400", bar: "bg-amber-500" },
  critical: { label: "Critical", icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20", dot: "bg-red-400 animate-pulse", bar: "bg-red-500" },
  unknown: { label: "Unknown", icon: HelpCircle, color: "text-gray-400 bg-gray-500/10 border-gray-500/20", dot: "bg-gray-400", bar: "bg-gray-500" },
};

function getResponseTimeColor(ms: number) {
  if (ms === 0) return "text-gray-500";
  if (ms < 100) return "text-emerald-400";
  if (ms < 500) return "text-amber-400";
  return "text-red-400";
}

export default function ServiceStatus() {
  const loading = useSimulatedLoading();

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoadingSkeleton title="Service Status" />
      </DashboardLayout>
    );
  }

  const healthy = serviceHealthData.filter(s => s.status === "healthy").length;
  const warning = serviceHealthData.filter(s => s.status === "warning").length;
  const critical = serviceHealthData.filter(s => s.status === "critical").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Service Status</h2>
          <p className="text-sm text-gray-500 mt-1">Health monitoring for all connected SZL platform services</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">{healthy} Healthy</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">{warning} Warning</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">{critical} Critical</span>
          </div>
        </div>

        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 transition-all" style={{ width: `${(healthy / serviceHealthData.length) * 100}%` }} />
          <div className="bg-amber-500 transition-all" style={{ width: `${(warning / serviceHealthData.length) * 100}%` }} />
          <div className="bg-red-500 transition-all" style={{ width: `${(critical / serviceHealthData.length) * 100}%` }} />
        </div>

        <div className="space-y-3">
          {serviceHealthData.map(svc => {
            const cfg = statusConfig[svc.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={svc.id} className={`rounded-xl bg-white/[0.03] border ${svc.status === "critical" ? "border-red-500/20" : svc.status === "warning" ? "border-amber-500/20" : "border-white/5"} hover:border-white/10 transition-colors p-5`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full ${cfg.dot} shrink-0`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{svc.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{svc.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-center">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Zap className="w-3 h-3 text-gray-500" />
                        <span className={`font-mono font-bold ${getResponseTimeColor(svc.responseTime)}`}>
                          {svc.responseTime > 0 ? `${svc.responseTime}ms` : "N/A"}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-600">Response</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Activity className="w-3 h-3 text-gray-500" />
                        <span className="font-mono font-bold text-gray-300">{svc.uptime}%</span>
                      </div>
                      <p className="text-[10px] text-gray-600">Uptime</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-400">{svc.lastIncident}</span>
                      </div>
                      <p className="text-[10px] text-gray-600">Last Incident</p>
                    </div>
                    <div className="text-center hidden lg:block">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Globe className="w-3 h-3 text-gray-500" />
                        <span className="font-mono text-gray-400">{svc.endpoint}</span>
                      </div>
                      <p className="text-[10px] text-gray-600">Endpoint</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
