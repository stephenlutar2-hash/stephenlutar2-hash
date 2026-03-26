import { useQuery } from "@tanstack/react-query";
import { Server, Wrench, Clock, AlertTriangle, Shield, Anchor } from "lucide-react";

function healthColor(score: number) {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  if (score >= 50) return "text-orange-400";
  return "text-red-400";
}

function healthBg(score: number) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-amber-500";
  if (score >= 50) return "bg-orange-500";
  return "bg-red-500";
}

function statusBadge(status: string) {
  if (status === "operational") return "bg-emerald-500/15 text-emerald-400";
  if (status === "warning" || status === "degraded") return "bg-amber-500/15 text-amber-400";
  if (status === "maintenance") return "bg-blue-500/15 text-blue-400";
  return "bg-red-500/15 text-red-400";
}

export default function Infrastructure() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vessels-infrastructure"],
    queryFn: async () => { const r = await fetch("/api/vessels/infrastructure"); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); },
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">Failed to load infrastructure data</p>
          <p className="text-gray-500 text-xs mt-1 mb-3">Please check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Fleet Asset Health</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Infrastructure</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Fleet Health Score", value: `${data.fleetHealthScore}%`, color: healthColor(data.fleetHealthScore), icon: Server },
          { label: "Maintenance Backlog", value: data.totalMaintenanceBacklog, color: data.totalMaintenanceBacklog > 30 ? "text-amber-400" : "text-emerald-400", icon: Wrench },
          { label: "Critical Systems", value: data.criticalSystems, color: data.criticalSystems > 0 ? "text-red-400" : "text-emerald-400", icon: AlertTriangle },
          { label: "Fleet Size", value: data.vesselHealth.length, color: "text-cyan-400", icon: Anchor },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.vesselHealth.map((v: any) => (
          <div key={v.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${v.overallHealth >= 70 ? "bg-emerald-500/10" : v.overallHealth >= 50 ? "bg-amber-500/10" : "bg-red-500/10"} flex items-center justify-center`}>
                  <Server className={`w-5 h-5 ${healthColor(v.overallHealth)}`} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white text-sm">{v.name}</h3>
                  <p className="text-[10px] text-gray-500">Built {v.built} • Last survey {v.lastSurvey}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                v.status === "drydock" ? "bg-blue-500/15 text-blue-400" :
                v.status === "laden" || v.status === "ballast" ? "bg-emerald-500/15 text-emerald-400" :
                "bg-amber-500/15 text-amber-400"
              }`}>
                {v.status}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Overall Health</span>
                <span className={`text-sm font-display font-bold ${healthColor(v.overallHealth)}`}>{v.overallHealth}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${healthBg(v.overallHealth)} rounded-full transition-all`} style={{ width: `${v.overallHealth}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 text-[11px]">
              <div className="bg-white/[0.02] rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Engine Hours</p>
                <p className="font-mono text-white">{v.engineHours.toLocaleString()}</p>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Remaining</p>
                <p className="font-mono text-white">{v.engineHoursRemaining.toLocaleString()}</p>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Hull Condition</p>
                <p className={`font-mono ${healthColor(v.hullCondition)}`}>{v.hullCondition}%</p>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">Next Drydock</p>
                <p className="font-mono text-white">{v.nextDrydock}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Systems</p>
              {v.systems.map((sys: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">{sys.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${healthBg(sys.health)} rounded-full`} style={{ width: `${sys.health}%` }} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1 py-0.5 rounded ${statusBadge(sys.status)}`}>
                      {sys.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {v.maintenanceBacklog > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Maintenance backlog</span>
                <span className={`font-mono ${v.maintenancePriority === "high" ? "text-red-400" : v.maintenancePriority === "medium" ? "text-amber-400" : "text-gray-400"}`}>
                  {v.maintenanceBacklog} items ({v.maintenancePriority})
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
