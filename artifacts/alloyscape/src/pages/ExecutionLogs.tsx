import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import { ScrollText, Search, Filter } from "lucide-react";
import { logEntries } from "@/data/demo";

const levelConfig: Record<string, { label: string; color: string }> = {
  info: { label: "INFO", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  warn: { label: "WARN", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  error: { label: "ERROR", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  debug: { label: "DEBUG", color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
};

const levelTextColor: Record<string, string> = {
  info: "text-cyan-400/80",
  warn: "text-amber-400/80",
  error: "text-red-400/80",
  debug: "text-gray-500",
};

export default function ExecutionLogs() {
  const loading = useSimulatedLoading();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoadingSkeleton title="Execution Logs" />
      </DashboardLayout>
    );
  }

  const services = ["all", ...Array.from(new Set(logEntries.map(l => l.service)))];

  const filtered = logEntries.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.service.toLowerCase().includes(search.toLowerCase()) ||
      (log.traceId && log.traceId.toLowerCase().includes(search.toLowerCase()));
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesService = serviceFilter === "all" || log.service === serviceFilter;
    return matchesSearch && matchesLevel && matchesService;
  });

  const levelCounts: Record<string, number> = {
    all: logEntries.length,
    info: logEntries.filter(l => l.level === "info").length,
    warn: logEntries.filter(l => l.level === "warn").length,
    error: logEntries.filter(l => l.level === "error").length,
    debug: logEntries.filter(l => l.level === "debug").length,
  };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-white">Execution Logs</h2>
          <p className="text-sm text-gray-500 mt-1">System-wide log viewer with filtering and search</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(levelCounts).map(([key, count]) => {
            const isActive = levelFilter === key;
            return (
              <motion.button
                key={key}
                onClick={() => setLevelFilter(key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-xl border text-center transition ${
                  isActive
                    ? key === "all" ? "bg-cyan-500/10 border-cyan-500/20" : (levelConfig[key]?.color || "")
                    : "bg-white/[0.03] border-white/5 hover:border-white/10"
                }`}
              >
                <p className={`text-xl font-bold ${isActive ? "" : "text-white"}`}>{count}</p>
                <p className={`text-[10px] uppercase tracking-wider mt-0.5 font-mono ${isActive ? "" : "text-gray-500"}`}>{key}</p>
              </motion.button>
            );
          })}
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

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-black/30 border border-white/5 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">{filtered.length} log entries</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-gray-600 font-mono">Live tail active</span>
            </div>
          </div>
          <div className="divide-y divide-white/[0.03] font-mono text-xs max-h-[calc(100vh-420px)] overflow-y-auto scrollbar-thin">
            {filtered.map((log, i) => {
              const lcfg = levelConfig[log.level];
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`px-4 py-2.5 flex items-start gap-3 hover:bg-white/[0.02] transition-colors ${log.level === "error" ? "bg-red-500/[0.03]" : log.level === "warn" ? "bg-amber-500/[0.02]" : ""}`}
                >
                  <span className="text-gray-600 shrink-0 w-20 pt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${lcfg.color}`}>
                    {lcfg.label}
                  </span>
                  <span className="text-violet-400/60 shrink-0 w-24 truncate">{log.service}</span>
                  <span className={`flex-1 break-all ${levelTextColor[log.level]}`}>{log.message}</span>
                  {log.traceId && (
                    <span
                      className="text-gray-600 shrink-0 hidden lg:inline cursor-pointer hover:text-cyan-400 transition-colors"
                      title="Copy trace ID"
                      onClick={() => navigator.clipboard.writeText(log.traceId!)}
                    >{log.traceId}</span>
                  )}
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <ScrollText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No logs match your filters</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
