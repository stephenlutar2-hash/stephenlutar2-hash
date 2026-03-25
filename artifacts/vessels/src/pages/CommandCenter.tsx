import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Server,
  ScrollText,
  Users,
  ShieldCheck,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Anchor,
  Ship,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const PILLAR_ICONS: Record<string, any> = {
  apm: Activity,
  infrastructure: Server,
  logs: ScrollText,
  experience: Users,
  synthetics: ShieldCheck,
  intelligence: Brain,
};

const PILLAR_COLORS: Record<string, string> = {
  apm: "emerald",
  infrastructure: "orange",
  logs: "blue",
  experience: "purple",
  synthetics: "amber",
  intelligence: "rose",
};

function statusBadge(status: string) {
  if (status === "healthy") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (status === "warning") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-red-500/15 text-red-400 border-red-500/30";
}

function directionIcon(dir: string) {
  if (dir === "up") return <TrendingUp className="w-3.5 h-3.5" />;
  if (dir === "down") return <TrendingDown className="w-3.5 h-3.5" />;
  return <Minus className="w-3.5 h-3.5" />;
}

export default function CommandCenter() {
  const { data, isLoading } = useQuery({
    queryKey: ["vessels-command-center"],
    queryFn: () => fetch("/api/vessels/command-center").then(r => r.json()),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Fleet Observability</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Command Center</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <Ship className="w-3.5 h-3.5" />
          {data.fleetSummary.total} vessels — {data.fleetSummary.laden} laden, {data.fleetSummary.ballast} ballast, {data.fleetSummary.atPort} at port
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {data.kpiRibbon.map((kpi: any, i: number) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 truncate">{kpi.label}</p>
            <p className="text-lg font-display font-bold text-white">{kpi.value}</p>
            <div className={`flex items-center gap-1 text-[11px] mt-1 ${kpi.direction === "up" ? "text-emerald-400" : kpi.direction === "down" ? "text-amber-400" : "text-gray-500"}`}>
              {directionIcon(kpi.direction)}
              {kpi.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.pillars.map((pillar: any) => {
          const Icon = PILLAR_ICONS[pillar.id] || Activity;
          const color = PILLAR_COLORS[pillar.id] || "cyan";
          return (
            <div key={pillar.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${color}-400`} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-sm">{pillar.name}</h3>
                    <p className="text-[11px] text-gray-500">{pillar.metric}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusBadge(pillar.status)}`}>
                  {pillar.status}
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-3xl font-display font-bold text-${color}-400`}>{pillar.score}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">Health Score</p>
                </div>
                <div className="w-24 h-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pillar.trend.map((v: number, i: number) => ({ i, v }))}>
                      <defs>
                        <linearGradient id={`grad-${pillar.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={pillar.status === "critical" ? "#ef4444" : pillar.status === "warning" ? "#f59e0b" : "#10b981"} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={pillar.status === "critical" ? "#ef4444" : pillar.status === "warning" ? "#f59e0b" : "#10b981"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={pillar.status === "critical" ? "#ef4444" : pillar.status === "warning" ? "#f59e0b" : "#10b981"} strokeWidth={1.5} fill={`url(#grad-${pillar.id})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {pillar.worst && (
                <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-gray-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate">{pillar.worst}</span>
                </div>
              )}

              {pillar.alerts > 0 && (
                <div className="mt-2 text-[10px] text-amber-400 font-mono">
                  {pillar.alerts} active alert{pillar.alerts > 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Alert Feed
        </h3>
        <div className="space-y-2">
          {data.alertFeed.map((alert: any) => (
            <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
              alert.severity === "critical" ? "border-red-500/20 bg-red-500/5" :
              alert.severity === "high" ? "border-amber-500/20 bg-amber-500/5" :
              "border-white/5 bg-white/[0.01]"
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                alert.severity === "critical" ? "bg-red-500/20 text-red-400" :
                alert.severity === "high" ? "bg-amber-500/20 text-amber-400" :
                "bg-blue-500/20 text-blue-400"
              }`}>
                {alert.severity}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/90">{alert.title}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500 font-mono">
                  <span>{alert.pillar}</span>
                  {alert.vessel && <span>• {alert.vessel}</span>}
                  <span>• {new Date(alert.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
