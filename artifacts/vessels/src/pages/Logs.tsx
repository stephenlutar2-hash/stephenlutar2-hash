import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollText, Search, Filter, Ship, Clock } from "lucide-react";

function severityBadge(severity: string) {
  if (severity === "critical") return "bg-red-500/15 text-red-400 border-red-500/30";
  if (severity === "warning") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-blue-500/15 text-blue-400 border-blue-500/30";
}

function eventTypeBadge(type: string) {
  const colors: Record<string, string> = {
    voyage: "bg-cyan-500/10 text-cyan-400",
    port: "bg-purple-500/10 text-purple-400",
    bunker: "bg-amber-500/10 text-amber-400",
    cargo: "bg-emerald-500/10 text-emerald-400",
    compliance: "bg-blue-500/10 text-blue-400",
    maintenance: "bg-orange-500/10 text-orange-400",
    crew: "bg-pink-500/10 text-pink-400",
  };
  return colors[type] || "bg-gray-500/10 text-gray-400";
}

export default function Logs() {
  const { data, isLoading } = useQuery({
    queryKey: ["vessels-logs"],
    queryFn: () => fetch("/api/vessels/logs").then(r => r.json()),
  });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  if (isLoading || !data) {
    return <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-white/[0.02] border border-white/5 animate-pulse" />)}</div>;
  }

  const filtered = data.logs.filter((log: any) => {
    if (typeFilter !== "all" && log.eventType !== typeFilter) return false;
    if (severityFilter !== "all" && log.severity !== severityFilter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !(log.vessel || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Operational Event Stream</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Logs</h2>
        </div>
        <div className="text-xs text-gray-500 font-mono bg-white/[0.03] px-3 py-1.5 rounded border border-white/5">
          {data.totalCount} events / 24h
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/30 transition"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/30 appearance-none cursor-pointer"
          >
            <option value="all">All Types</option>
            {data.eventTypes.map((t: string) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/30 appearance-none cursor-pointer"
          >
            <option value="all">All Severity</option>
            {data.severities.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="space-y-0">
          {filtered.map((log: any) => (
            <div key={log.id} className={`flex items-start gap-3 px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${
              log.severity === "critical" ? "border-l-2 border-l-red-500" :
              log.severity === "warning" ? "border-l-2 border-l-amber-500" :
              "border-l-2 border-l-transparent"
            }`}>
              <div className="flex flex-col items-center gap-1 shrink-0 w-14 pt-0.5">
                <span className="text-[10px] font-mono text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded border ${severityBadge(log.severity)}`}>
                  {log.severity}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/90 leading-relaxed">{log.message}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${eventTypeBadge(log.eventType)}`}>
                    {log.eventType}
                  </span>
                  {log.vessel && (
                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                      <Ship className="w-3 h-3" />{log.vessel}
                    </span>
                  )}
                  {log.voyage && (
                    <span className="text-[10px] text-gray-600 font-mono">{log.voyage}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-gray-500">
              <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No matching log entries</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
