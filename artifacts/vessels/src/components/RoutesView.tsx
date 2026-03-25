import { useQuery } from "@tanstack/react-query";
import { Navigation, MapPin, Clock, ArrowRight, Ship } from "lucide-react";
import { cn, getApiBase, statusColor, formatDate } from "@/lib/utils";

export default function RoutesView() {
  const { data, isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: () => fetch(`${getApiBase()}/routes`).then(r => r.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const routes = data?.routes || [];
  const activeRoutes = routes.filter((r: any) => r.status === "in-transit");
  const completedRoutes = routes.filter((r: any) => r.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Route Tracking</h1>
        <p className="text-sm text-muted-foreground mt-1">Active and completed voyage routes</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Routes</div>
          <div className="text-2xl font-display font-bold text-cyan-400">{routes.length}</div>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">In Transit</div>
          <div className="text-2xl font-display font-bold text-emerald-400">{activeRoutes.length}</div>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Completed</div>
          <div className="text-2xl font-display font-bold text-muted-foreground">{completedRoutes.length}</div>
        </div>
      </div>

      <div className="space-y-4">
        {routes.map((route: any) => (
          <div key={route.id} className="glass-panel rounded-xl p-6 hover:border-cyan-500/15 transition">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <Ship className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <h3 className="font-display font-semibold">{route.vesselName}</h3>
                    <span className="text-xs text-muted-foreground">{route.id}</span>
                  </div>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ml-auto lg:ml-2", statusColor(route.status))}>
                    {route.status.replace("-", " ")}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{route.origin}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{route.destination}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-medium">{route.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all"
                      style={{ width: `${route.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
                    <span>{route.distanceCovered.toLocaleString()} nm</span>
                    <span>{route.distance.toLocaleString()} nm total</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-64 shrink-0 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Departed:</span>
                  <span className="ml-auto text-xs">{formatDate(route.departureTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">ETA:</span>
                  <span className="ml-auto text-xs">{formatDate(route.eta)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Waypoints:</span>
                  <span className="ml-auto text-xs">{route.waypoints?.length || 0}</span>
                </div>
              </div>
            </div>

            {route.waypoints && route.waypoints.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 flex-wrap">
                  {route.waypoints.map((wp: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium",
                        idx === 0 ? "bg-emerald-500/15 text-emerald-400" :
                        idx === route.waypoints.length - 1 ? "bg-cyan-500/15 text-cyan-400" :
                        "bg-white/5 text-muted-foreground"
                      )}>
                        {wp.name}
                      </div>
                      {idx < route.waypoints.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
