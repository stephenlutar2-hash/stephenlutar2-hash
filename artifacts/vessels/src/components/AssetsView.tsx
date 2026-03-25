import { useQuery } from "@tanstack/react-query";
import { Box, Wrench, Clock, MapPin, Activity, CheckCircle, AlertTriangle } from "lucide-react";
import { cn, getApiBase, statusColor, conditionColor, formatDate } from "@/lib/utils";

export default function AssetsView() {
  const { data, isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: () => fetch(`${getApiBase()}/assets`).then(r => r.json()),
  });

  const { data: fleetData } = useQuery({
    queryKey: ["fleet"],
    queryFn: () => fetch(`${getApiBase()}/fleet`).then(r => r.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const assets = data?.assets || [];
  const vessels = fleetData?.vessels || [];
  const getVesselName = (vesselId: string) => vessels.find((v: any) => v.id === vesselId)?.name || vesselId;

  const operational = assets.filter((a: any) => a.status === "operational").length;
  const maintenance = assets.filter((a: any) => a.status === "maintenance").length;

  const assetTypes = [...new Set(assets.map((a: any) => a.type))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Asset Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Equipment tracking and maintenance monitoring</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Assets</div>
          <div className="text-2xl font-display font-bold text-cyan-400">{assets.length}</div>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Operational</div>
          <div className="text-2xl font-display font-bold text-emerald-400">{operational}</div>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">In Maintenance</div>
          <div className="text-2xl font-display font-bold text-yellow-400">{maintenance}</div>
        </div>
        <div className="glass-panel rounded-xl p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Asset Types</div>
          <div className="text-2xl font-display font-bold text-blue-400">{assetTypes.length}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {assets.map((asset: any) => (
          <div key={asset.id} className="glass-panel rounded-xl p-5 hover:border-cyan-500/15 transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", asset.status === "maintenance" ? "bg-yellow-500/15" : "bg-cyan-500/10")}>
                  {asset.status === "maintenance" ? <Wrench className="w-4 h-4 text-yellow-400" /> : <Box className="w-4 h-4 text-cyan-400" />}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm">{asset.name}</h3>
                  <p className="text-xs text-muted-foreground">{asset.id}</p>
                </div>
              </div>
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", statusColor(asset.status))}>
                {asset.status}
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Box className="w-3 h-3" /> Type
                </span>
                <span>{asset.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> Condition
                </span>
                <span className={cn("font-medium capitalize", conditionColor(asset.condition))}>{asset.condition}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Location
                </span>
                <span className="text-xs">{asset.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Hours
                </span>
                <span className="font-mono text-xs">{asset.hoursOperated.toLocaleString()} hrs</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Vessel</span>
                <span className="text-cyan-400">{getVesselName(asset.vesselId)}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1.5">
                <span className="text-muted-foreground">Last Inspection</span>
                <span>{asset.lastInspection}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1.5">
                <span className="text-muted-foreground">Next Maintenance</span>
                <span className={cn(new Date(asset.nextMaintenance) < new Date("2026-04-01") ? "text-yellow-400" : "")}>
                  {asset.nextMaintenance}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
