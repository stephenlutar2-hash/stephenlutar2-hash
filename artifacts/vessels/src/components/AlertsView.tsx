import { useQuery } from "@tanstack/react-query";
import { Bell, AlertTriangle, Cloud, Navigation, Shield, FileWarning, Anchor, MapPin, Clock, CheckCircle } from "lucide-react";
import { cn, getApiBase, severityColor, formatDate, formatCoord } from "@/lib/utils";

const typeIcons: Record<string, any> = {
  weather: Cloud,
  maintenance: FileWarning,
  "route-deviation": Navigation,
  compliance: Shield,
  security: AlertTriangle,
  port: Anchor,
};

export default function AlertsView() {
  const { data, isLoading } = useQuery({
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

  const alerts = data?.alerts || [];
  const unacknowledged = alerts.filter((a: any) => !a.acknowledged).length;
  const critical = alerts.filter((a: any) => a.severity === "critical").length;
  const high = alerts.filter((a: any) => a.severity === "high").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Alerts & Advisories</h1>
        <p className="text-sm text-muted-foreground mt-1">Priority-sorted alert feed and situation monitoring</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Alerts</div>
          <div className="text-2xl font-display font-bold text-cyan-400">{alerts.length}</div>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Unacknowledged</div>
          <div className="text-2xl font-display font-bold text-orange-400">{unacknowledged}</div>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Critical</div>
          <div className="text-2xl font-display font-bold text-red-400">{critical}</div>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">High Priority</div>
          <div className="text-2xl font-display font-bold text-orange-400">{high}</div>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert: any) => {
          const Icon = typeIcons[alert.type] || Bell;
          return (
            <div key={alert.id} className={cn("glass-panel rounded-xl p-5 border-l-4 hover:bg-white/3 transition", {
              "border-l-red-500": alert.severity === "critical",
              "border-l-orange-500": alert.severity === "high",
              "border-l-yellow-500": alert.severity === "medium",
              "border-l-blue-500": alert.severity === "low",
            })}>
              <div className="flex items-start gap-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", severityColor(alert.severity))}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-display font-semibold leading-tight">{alert.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border capitalize", severityColor(alert.severity))}>
                          {alert.severity}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">{alert.type.replace("-", " ")}</span>
                        {alert.acknowledged && (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle className="w-3 h-3" /> Acknowledged
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDate(alert.timestamp)}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{alert.message}</p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    {alert.vesselId && (
                      <span className="flex items-center gap-1">
                        <Anchor className="w-3 h-3" /> {alert.vesselId}
                      </span>
                    )}
                    {alert.lat != null && (
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3" />
                        {formatCoord(alert.lat, "lat")}, {formatCoord(alert.lng, "lng")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
