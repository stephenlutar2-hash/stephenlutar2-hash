import { useQuery } from "@tanstack/react-query";
import { Ship, Navigation, AlertTriangle, Activity, Fuel, Users, Anchor, Gauge } from "lucide-react";
import { cn, getApiBase, statusColor, formatCoord } from "@/lib/utils";

export default function OperationsView() {
  const { data: fleetData, isLoading } = useQuery({
    queryKey: ["fleet"],
    queryFn: () => fetch(`${getApiBase()}/fleet`).then(r => r.json()),
  });

  const { data: alertsData } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => fetch(`${getApiBase()}/alerts`).then(r => r.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = fleetData?.summary;
  const vessels = fleetData?.vessels || [];
  const recentAlerts = (alertsData?.alerts || []).slice(0, 3);

  const kpis = [
    { label: "Active Vessels", value: summary?.activeVessels ?? 0, total: summary?.totalVessels, icon: Ship, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Routes In Progress", value: summary?.routesInProgress ?? 0, icon: Navigation, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Active Alerts", value: summary?.activeAlerts ?? 0, icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Fleet Utilization", value: `${summary?.avgUtilization ?? 0}%`, icon: Gauge, color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Operations Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Fleet status and operational summary</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{kpi.label}</span>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", kpi.bg)}>
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className={cn("text-3xl font-display font-bold", kpi.color)}>{kpi.value}</span>
              {kpi.total && <span className="text-muted-foreground text-sm mb-1">/ {kpi.total}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-display font-semibold">Fleet Status</h2>
            <span className="text-xs text-muted-foreground">{vessels.length} vessels</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Vessel</th>
                  <th className="text-left px-5 py-3 font-medium">Type</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Position</th>
                  <th className="text-left px-5 py-3 font-medium">Destination</th>
                  <th className="text-right px-5 py-3 font-medium">Speed</th>
                </tr>
              </thead>
              <tbody>
                {vessels.map((v: any) => (
                  <tr key={v.id} className="border-b border-white/3 hover:bg-white/3 transition">
                    <td className="px-5 py-3">
                      <div className="font-medium">{v.name}</div>
                      <div className="text-xs text-muted-foreground">{v.id}</div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{v.type}</td>
                    <td className="px-5 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", statusColor(v.status))}>
                        {v.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground font-mono">
                      {formatCoord(v.lat, "lat")}, {formatCoord(v.lng, "lng")}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{v.destination}</td>
                    <td className="px-5 py-3 text-right font-mono">{v.speed > 0 ? `${v.speed} kn` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-5">
            <h3 className="font-display font-semibold text-sm mb-4">Fleet Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "Underway", count: summary?.activeVessels ?? 0, color: "bg-emerald-500" },
                { label: "At Port", count: summary?.atPort ?? 0, color: "bg-blue-500" },
                { label: "Anchored", count: summary?.anchored ?? 0, color: "bg-yellow-500" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", item.color)} />
                  <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5">
            <h3 className="font-display font-semibold text-sm mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {recentAlerts.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3">
                  <AlertTriangle className={cn("w-4 h-4 shrink-0 mt-0.5", {
                    "text-red-400": a.severity === "critical",
                    "text-orange-400": a.severity === "high",
                    "text-yellow-400": a.severity === "medium",
                    "text-blue-400": a.severity === "low",
                  })} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{a.type.replace("-", " ")} · {a.severity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5">
            <h3 className="font-display font-semibold text-sm mb-4">Fleet Metrics</h3>
            <div className="space-y-4">
              {vessels.slice(0, 4).map((v: any) => (
                <div key={v.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground truncate mr-2">{v.name}</span>
                    <span className="text-xs font-medium">{v.fuelLevel}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", v.fuelLevel > 60 ? "bg-emerald-500" : v.fuelLevel > 30 ? "bg-yellow-500" : "bg-red-500")}
                      style={{ width: `${v.fuelLevel}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Fuel className="w-3 h-3" />
                <span>Fuel levels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
