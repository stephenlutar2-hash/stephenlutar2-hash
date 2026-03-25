import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ScrollText, Search, Filter } from "lucide-react";
import { logEntries } from "@/data/demo";

const levelConfig = {
  info: { label: "INFO", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  warn: { label: "WARN", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  error: { label: "ERROR", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  debug: { label: "DEBUG", color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
};

const levelTextColor = {
  info: "text-cyan-400/80",
  warn: "text-amber-400/80",
  error: "text-red-400/80",
  debug: "text-gray-500",
};

export default function ExecutionLogs() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const services = ["all", ...Array.from(new Set(logEntries.map(l => l.service)))];

  const filtered = logEntries.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.service.toLowerCase().includes(search.toLowerCase()) ||
      (log.traceId && log.traceId.toLowerCase().includes(search.toLowerCase()));
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesService = serviceFilter === "all" || log.service === serviceFilter;
    return matchesSearch && matchesLevel && matchesService;
  });

  const levelCounts = {
    all: logEntries.length,
    info: logEntries.filter(l => l.level === "info").length,
    warn: logEntries.filter(l => l.level === "warn").length,
    error: logEntries.filter(l => l.level === "error").length,
    debug: logEntries.filter(l => l.level === "debug").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Execution Logs</h2>
          <p className="text-sm text-gray-500 mt-1">System-wide log viewer with filtering and search</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search logs by message, service, or trace ID..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(levelCounts).map(([key, count]) => (
              <button
                key={key}
                onClick={() => setLevelFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase border transition-colors ${
                  levelFilter === key
                    ? key === "all" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : (levelConfig[key as keyof typeof levelConfig]?.color || "")
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                {key} ({count})
              </button>
            ))}
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-8 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
            >
              {services.map(s => (
                <option key={s} value={s} className="bg-gray-900">{s === "all" ? "All Services" : s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-black/30 border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">{filtered.length} log entries</span>
            <span className="text-xs text-gray-600 font-mono">Live tail active</span>
          </div>
          <div className="divide-y divide-white/[0.03] font-mono text-xs max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin">
            {filtered.map(log => {
              const lcfg = levelConfig[log.level];
              return (
                <div key={log.id} className={`px-4 py-2.5 flex items-start gap-3 hover:bg-white/[0.02] transition-colors ${log.level === "error" ? "bg-red-500/[0.03]" : log.level === "warn" ? "bg-amber-500/[0.02]" : ""}`}>
                  <span className="text-gray-600 shrink-0 w-20 pt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${lcfg.color}`}>
                    {lcfg.label}
                  </span>
                  <span className="text-violet-400/60 shrink-0 w-24 truncate">{log.service}</span>
                  <span className={`flex-1 break-all ${levelTextColor[log.level]}`}>{log.message}</span>
                  {log.traceId && (
                    <span className="text-gray-600 shrink-0 hidden lg:inline">{log.traceId}</span>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <ScrollText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No logs match your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
