import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import {
  Zap, FileText, Search, Filter, ChevronDown, ChevronUp,
  AlertTriangle, AlertCircle, Info, Bug, Clock, ArrowLeft
} from "lucide-react";

const LEVELS = ["ERROR", "WARN", "INFO", "DEBUG", "TRACE"] as const;
type LogLevel = typeof LEVELS[number];

const levelConfig: Record<LogLevel, { color: string; bg: string; icon: typeof AlertCircle }> = {
  ERROR: { color: "text-red-400", bg: "bg-red-500/10", icon: AlertCircle },
  WARN: { color: "text-amber-400", bg: "bg-amber-500/10", icon: AlertTriangle },
  INFO: { color: "text-blue-400", bg: "bg-blue-500/10", icon: Info },
  DEBUG: { color: "text-gray-400", bg: "bg-gray-500/10", icon: Bug },
  TRACE: { color: "text-gray-500", bg: "bg-gray-500/5", icon: Clock },
};

const SERVICES = ["core-engine", "data-nexus", "shield-protocol", "neural-mesh", "event-bus", "storage-engine", "config-matrix"];

function generateLogs(count: number) {
  const msgs: Record<LogLevel, string[]> = {
    ERROR: [
      "Connection pool exhausted: max_connections=100 reached",
      "Failed to replicate shard 7: timeout after 30s",
      "Authentication service returned 503",
      "Memory threshold exceeded: 92% utilized",
      "Disk I/O error on /dev/sda3: sector 48291",
    ],
    WARN: [
      "Slow query detected: 2.3s on users_index",
      "Certificate expiry in 14 days for *.szl.app",
      "Rate limit approaching: 850/1000 req/min",
      "Retry attempt 3/5 for upstream service",
      "Cache hit ratio dropped below 80%",
    ],
    INFO: [
      "Service health check passed",
      "Configuration reloaded successfully",
      "New deployment v4.2.1 rolled out",
      "Backup completed: 2.4GB compressed",
      "TLS handshake completed in 12ms",
    ],
    DEBUG: [
      "Request processed in 42ms",
      "Cache key generated: usr_8a2f3d",
      "Connection established to replica-3",
      "Garbage collection completed: 128MB freed",
      "Worker pool size adjusted: 16 -> 24",
    ],
    TRACE: [
      "Entering function processRequest()",
      "SQL query prepared: SELECT * FROM ...",
      "HTTP/2 stream opened: id=47",
      "Buffer allocated: 4096 bytes",
      "Event loop tick: 0.3ms",
    ],
  };

  return Array.from({ length: count }, (_, i) => {
    const level = LEVELS[Math.random() < 0.05 ? 0 : Math.random() < 0.15 ? 1 : Math.random() < 0.6 ? 2 : Math.random() < 0.85 ? 3 : 4];
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
    const msgList = msgs[level];
    const now = new Date();
    now.setMinutes(now.getMinutes() - i * 0.5 - Math.random() * 2);
    return {
      id: i,
      timestamp: now.toISOString(),
      level,
      service,
      message: msgList[Math.floor(Math.random() * msgList.length)],
      traceId: `tr-${Math.random().toString(36).slice(2, 10)}`,
    };
  });
}

export default function LogExplorer() {
  const [logs] = useState(() => generateLogs(200));
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "ALL">("ALL");
  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
  const [timeRange, setTimeRange] = useState<string>("1h");
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const now = new Date();
    const rangeMs: Record<string, number> = { "15m": 15 * 60000, "30m": 30 * 60000, "1h": 60 * 60000, "6h": 6 * 60 * 60000, "24h": 24 * 60 * 60000 };
    const cutoff = rangeMs[timeRange] ? new Date(now.getTime() - rangeMs[timeRange]) : null;
    return logs.filter(log => {
      if (levelFilter !== "ALL" && log.level !== levelFilter) return false;
      if (serviceFilter !== "ALL" && log.service !== serviceFilter) return false;
      if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase()) && !log.service.includes(searchQuery.toLowerCase())) return false;
      if (cutoff && new Date(log.timestamp) < cutoff) return false;
      return true;
    });
  }, [logs, levelFilter, serviceFilter, searchQuery, timeRange]);

  const volumeData = useMemo(() => {
    const buckets: Record<string, Record<LogLevel, number>> = {};
    logs.forEach(log => {
      const minute = log.timestamp.slice(0, 16);
      if (!buckets[minute]) buckets[minute] = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0, TRACE: 0 };
      buckets[minute][log.level]++;
    });
    return Object.entries(buckets).slice(-20).map(([time, counts]) => ({
      time: time.slice(11, 16),
      ...counts,
    }));
  }, [logs]);

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0, TRACE: 0 };
    logs.forEach(l => counts[l.level]++);
    return counts;
  }, [logs]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-display font-bold text-sm tracking-wider">ZEUS</span>
            <span className="text-[10px] text-gray-500 font-mono">LOG EXPLORER</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <FileText className="w-6 h-6 text-yellow-400" />
            Log Explorer
          </h2>
          <p className="text-sm text-gray-500 mt-1">Search, filter, and analyze system logs in real time</p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {LEVELS.map((level, i) => {
            const lc = levelConfig[level];
            const LevelIcon = lc.icon;
            return (
              <motion.button key={level} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setLevelFilter(levelFilter === level ? "ALL" : level)}
                className={`p-3 rounded-xl border backdrop-blur-md transition ${levelFilter === level ? "border-yellow-500/30 ring-1 ring-yellow-500/20" : "border-white/[0.06]"}`}
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
                <div className="flex items-center justify-between mb-1">
                  <LevelIcon className={`w-3.5 h-3.5 ${lc.color}`} />
                  <span className={`text-lg font-display font-bold ${lc.color}`}>{levelCounts[level]}</span>
                </div>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider">{level}</p>
              </motion.button>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl p-5 border border-white/[0.06] backdrop-blur-md"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
          <h3 className="text-sm font-bold text-white mb-3">Log Volume</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip contentStyle={{ background: "rgba(10,14,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }} />
                <Bar dataKey="ERROR" stackId="a" fill="#ef4444" fillOpacity={0.8} />
                <Bar dataKey="WARN" stackId="a" fill="#f59e0b" fillOpacity={0.8} />
                <Bar dataKey="INFO" stackId="a" fill="#3b82f6" fillOpacity={0.6} />
                <Bar dataKey="DEBUG" stackId="a" fill="#6b7280" fillOpacity={0.4} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500/30" />
          </div>
          <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white appearance-none cursor-pointer">
            <option value="ALL">All Services</option>
            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
            {["15m", "30m", "1h", "6h", "24h"].map(range => (
              <button key={range} onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${timeRange === range ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" : "text-gray-500 hover:text-gray-300"}`}>
                {range}
              </button>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-white/[0.06] overflow-hidden backdrop-blur-md"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}>
          <div className="max-h-[500px] overflow-y-auto">
            {filtered.slice(0, 80).map((log, i) => {
              const lc = levelConfig[log.level];
              const LevelIcon = lc.icon;
              const isExpanded = expandedLog === log.id;
              return (
                <motion.div key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.01 }}
                  className={`border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition ${isExpanded ? "bg-white/[0.03]" : ""}`}
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                >
                  <div className="flex items-center gap-3 px-4 py-2">
                    <span className="text-[10px] font-mono text-gray-500 w-16 shrink-0">{log.timestamp.slice(11, 19)}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${lc.bg} ${lc.color} w-12 text-center`}>{log.level}</span>
                    <span className="text-[10px] font-mono text-yellow-400/60 w-28 shrink-0 truncate">{log.service}</span>
                    <span className="text-xs text-gray-300 truncate flex-1">{log.message}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-3 pt-1 ml-16 space-y-1 text-xs">
                          <div className="flex gap-8">
                            <div><span className="text-gray-500">Trace ID:</span> <span className="font-mono text-yellow-400">{log.traceId}</span></div>
                            <div><span className="text-gray-500">Service:</span> <span className="text-white">{log.service}</span></div>
                            <div><span className="text-gray-500">Timestamp:</span> <span className="font-mono text-gray-300">{log.timestamp}</span></div>
                          </div>
                          <div className="p-2 bg-black/30 rounded-lg font-mono text-[11px] text-gray-400 mt-2">{log.message}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.05] text-[10px] text-gray-500 flex justify-between">
            <span>Showing {Math.min(filtered.length, 80)} of {filtered.length} logs</span>
            <span>{logs.length} total entries</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
