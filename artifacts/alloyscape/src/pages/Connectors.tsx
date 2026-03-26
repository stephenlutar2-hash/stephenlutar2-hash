import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Plug, ArrowRight, CheckCircle2, XCircle, AlertCircle, AlertTriangle, Zap,
  Search, ArrowUpDown, Activity, Clock, Shield, TrendingUp, Loader2
} from "lucide-react";
import { useConnectors } from "@/hooks/useAlloyscapeApi";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  inactive: { label: "Inactive", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", dot: "bg-gray-400" },
  error: { label: "Error", color: "text-red-400 bg-red-500/10 border-red-500/20", dot: "bg-red-400 animate-pulse" },
};

const typeColors: Record<string, string> = {
  "Event Stream": "from-cyan-500 to-blue-500",
  "ETL": "from-emerald-500 to-green-500",
  "API Bridge": "from-violet-500 to-purple-500",
  "SAML/OIDC": "from-amber-500 to-orange-500",
  "WebSocket": "from-pink-500 to-rose-500",
  "Message Queue": "from-blue-500 to-indigo-500",
  "Webhook": "from-teal-500 to-cyan-500",
  "Metrics Stream": "from-gray-500 to-slate-500",
};

type SortKey = "name" | "events" | "status";

export default function Connectors() {
  const { data: connectors = [], isLoading, isError } = useConnectors();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("events");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const uptimeData: Record<string, number[]> = {};
  connectors.forEach((c: any) => {
    const base = c.status === "active" ? 99 : c.status === "error" ? 85 : 95;
    uptimeData[c.connectorId || c.id] = Array.from({ length: 30 }, () => Math.min(100, Math.max(80, base + (Math.random() - 0.3) * 8)));
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
          <p className="text-gray-400">Failed to load connectors. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  const filtered = connectors
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.type.toLowerCase().includes(searchQuery.toLowerCase()) || c.source.toLowerCase().includes(searchQuery.toLowerCase()) || c.target.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
      if (sortBy === "events") return (a.eventsProcessed - b.eventsProcessed) * dir;
      return a.status.localeCompare(b.status) * dir;
    });

  const active = connectors.filter(c => c.status === "active").length;
  const errored = connectors.filter(c => c.status === "error").length;
  const inactive = connectors.filter(c => c.status === "inactive").length;
  const totalEvents = connectors.reduce((sum, c) => sum + c.eventsProcessed, 0);
  const avgUptime = 99.2;

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-white">Connector Management</h2>
          <p className="text-sm text-gray-500 mt-1">View and configure integrations between services</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Active</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{active}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">of {connectors.length} total</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Events (24h)</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-cyan-400">{totalEvents.toLocaleString()}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">processed</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Avg Uptime</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{avgUptime}%</p>
            <p className="text-[10px] text-gray-600 mt-0.5">30-day average</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Issues</span>
              {errored > 0 ? <XCircle className="w-4 h-4 text-red-400" /> : <Shield className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className={`text-2xl font-bold ${errored > 0 ? "text-red-400" : "text-emerald-400"}`}>{errored + inactive}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{errored} errors, {inactive} inactive</p>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-4">
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${statusFilter === "active" ? "bg-emerald-500/20 border-emerald-500/30" : "bg-emerald-500/10 border-emerald-500/20"}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">{active} Active</span>
          </motion.button>
          {errored > 0 && (
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => setStatusFilter(statusFilter === "error" ? "all" : "error")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${statusFilter === "error" ? "bg-red-500/20 border-red-500/30" : "bg-red-500/10 border-red-500/20"}`}>
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">{errored} Error</span>
            </motion.button>
          )}
          {inactive > 0 && (
            <motion.button whileHover={{ scale: 1.03 }} onClick={() => setStatusFilter(statusFilter === "inactive" ? "all" : "inactive")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${statusFilter === "inactive" ? "bg-gray-500/20 border-gray-500/30" : "bg-gray-500/10 border-gray-500/20"}`}>
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-400">{inactive} Inactive</span>
            </motion.button>
          )}
          {statusFilter !== "all" && (
            <button onClick={() => setStatusFilter("all")} className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition">
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search connectors..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
            />
          </div>
          <div className="flex gap-2">
            {(["name", "events", "status"] as SortKey[]).map(key => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider border transition-colors ${sortBy === key ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"}`}
              >
                <ArrowUpDown className="w-3 h-3" />
                {key} {sortBy === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
        >
          {filtered.map(conn => {
            const cfg = statusConfig[conn.status];
            const uptime = uptimeData[conn.id] || [];
            const currentUptime = uptime.length > 0 ? uptime[uptime.length - 1].toFixed(1) : "—";
            return (
              <motion.div
                key={conn.id}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedId(selectedId === conn.id ? null : conn.id)}
                className={`rounded-xl bg-white/[0.03] border cursor-pointer ${selectedId === conn.id ? "border-cyan-500/40 ring-1 ring-cyan-500/20" : conn.status === "error" ? "border-red-500/20" : "border-white/5"} hover:border-white/10 transition-colors p-5`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Plug className="w-4 h-4 text-gray-500" />
                      <h3 className="text-sm font-bold text-white">{conn.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${typeColors[conn.type] || "from-gray-500 to-gray-600"} text-white text-[10px] font-bold`}>
                        {conn.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 my-4 px-2">
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-medium text-gray-300 truncate flex-1 text-center">
                    {conn.source}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className={`w-6 h-px ${conn.status === "active" ? "bg-cyan-500/40" : conn.status === "error" ? "bg-red-500/40" : "bg-white/10"}`} />
                    <ArrowRight className={`w-4 h-4 ${conn.status === "active" ? "text-cyan-500/60" : conn.status === "error" ? "text-red-500/60" : "text-gray-600"}`} />
                    <div className={`w-6 h-px ${conn.status === "active" ? "bg-cyan-500/40" : conn.status === "error" ? "bg-red-500/40" : "bg-white/10"}`} />
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-medium text-gray-300 truncate flex-1 text-center">
                    {conn.target}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Activity className="w-3 h-3" />30-day uptime</span>
                    <span className={`text-[10px] font-bold font-mono ${Number(currentUptime) >= 99 ? "text-emerald-400" : Number(currentUptime) >= 95 ? "text-amber-400" : "text-red-400"}`}>{currentUptime}%</span>
                  </div>
                  <div className="flex items-end gap-px h-6">
                    {uptime.map((val, i) => (
                      <motion.div
                        key={i}
                        className={`flex-1 rounded-sm ${val >= 99 ? "bg-emerald-500/50" : val >= 95 ? "bg-amber-500/50" : "bg-red-500/50"}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${((val - 80) / 20) * 100}%` }}
                        transition={{ duration: 0.3, delay: i * 0.01 }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last sync: {conn.lastSync}</span>
                  <span className="font-mono">{conn.eventsProcessed.toLocaleString()} events</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Plug className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-500">No Connectors Found</h3>
            <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
