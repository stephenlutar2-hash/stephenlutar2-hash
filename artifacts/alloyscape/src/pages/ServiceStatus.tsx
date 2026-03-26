import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  Activity, CheckCircle2, AlertTriangle, XCircle, HelpCircle,
  Clock, Globe, Zap, ArrowUpDown, Search,
} from "lucide-react";
import { serviceHealthData } from "@/data/demo";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; dot: string; bar: string }> = {
  healthy: { label: "Healthy", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400", bar: "bg-emerald-500" },
  warning: { label: "Warning", icon: AlertTriangle, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400", bar: "bg-amber-500" },
  critical: { label: "Critical", icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20", dot: "bg-red-400 animate-pulse", bar: "bg-red-500" },
  unknown: { label: "Unknown", icon: HelpCircle, color: "text-gray-400 bg-gray-500/10 border-gray-500/20", dot: "bg-gray-400", bar: "bg-gray-500" },
};

function getResponseTimeColor(ms: number) {
  if (ms === 0) return "text-gray-500";
  if (ms < 100) return "text-emerald-400";
  if (ms < 500) return "text-amber-400";
  return "text-red-400";
}

type SortKey = "name" | "responseTime" | "uptime" | "status";

export default function ServiceStatus() {
  const loading = useSimulatedLoading();
  const [sortBy, setSortBy] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoadingSkeleton title="Service Status" />
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

  const statusOrder: Record<string, number> = { critical: 0, warning: 1, unknown: 2, healthy: 3 };

  const filtered = serviceHealthData
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
      if (sortBy === "responseTime") return (a.responseTime - b.responseTime) * dir;
      if (sortBy === "uptime") return (a.uptime - b.uptime) * dir;
      return ((statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4)) * dir;
    });

  const healthy = serviceHealthData.filter(s => s.status === "healthy").length;
  const warning = serviceHealthData.filter(s => s.status === "warning").length;
  const critical = serviceHealthData.filter(s => s.status === "critical").length;

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-white">Service Status</h2>
          <p className="text-sm text-gray-500 mt-1">Health monitoring for all connected SZL platform services</p>
        </motion.div>

        <div className="flex flex-wrap gap-4">
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => setStatusFilter(statusFilter === "healthy" ? "all" : "healthy")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${statusFilter === "healthy" ? "bg-emerald-500/20 border-emerald-500/30" : "bg-emerald-500/10 border-emerald-500/20"}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">{healthy} Healthy</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => setStatusFilter(statusFilter === "warning" ? "all" : "warning")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${statusFilter === "warning" ? "bg-amber-500/20 border-amber-500/30" : "bg-amber-500/10 border-amber-500/20"}`}>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">{warning} Warning</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => setStatusFilter(statusFilter === "critical" ? "all" : "critical")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${statusFilter === "critical" ? "bg-red-500/20 border-red-500/30" : "bg-red-500/10 border-red-500/20"}`}>
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">{critical} Critical</span>
          </motion.button>
          {statusFilter !== "all" && (
            <button onClick={() => setStatusFilter("all")} className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition">
              Clear Filter
            </button>
          )}
        </div>

        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
          <motion.div className="bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${(healthy / Math.max(serviceHealthData.length, 1)) * 100}%` }} transition={{ duration: 0.8 }} />
          <motion.div className="bg-amber-500" initial={{ width: 0 }} animate={{ width: `${(warning / Math.max(serviceHealthData.length, 1)) * 100}%` }} transition={{ duration: 0.8, delay: 0.1 }} />
          <motion.div className="bg-red-500" initial={{ width: 0 }} animate={{ width: `${(critical / Math.max(serviceHealthData.length, 1)) * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
            />
          </div>
          <div className="flex gap-2">
            {(["status", "name", "responseTime", "uptime"] as SortKey[]).map(key => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider border transition-colors ${sortBy === key ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"}`}
              >
                <ArrowUpDown className="w-3 h-3" />
                {key === "responseTime" ? "latency" : key} {sortBy === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((svc, i) => {
            const cfg = statusConfig[svc.status];
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.005 }}
                onClick={() => setSelectedId(selectedId === svc.id ? null : svc.id)}
                className={`rounded-xl bg-white/[0.03] border cursor-pointer ${selectedId === svc.id ? "border-cyan-500/40 ring-1 ring-cyan-500/20" : svc.status === "critical" ? "border-red-500/20" : svc.status === "warning" ? "border-amber-500/20" : "border-white/5"} hover:border-white/10 transition-colors p-5`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full ${cfg.dot} shrink-0`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{svc.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{svc.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-center">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Zap className="w-3 h-3 text-gray-500" />
                        <span className={`font-mono font-bold ${getResponseTimeColor(svc.responseTime)}`}>
                          {svc.responseTime > 0 ? `${svc.responseTime}ms` : "N/A"}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-600">Response</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Activity className="w-3 h-3 text-gray-500" />
                        <span className="font-mono font-bold text-gray-300">{svc.uptime}%</span>
                      </div>
                      <p className="text-[10px] text-gray-600">Uptime</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-400">{svc.lastIncident}</span>
                      </div>
                      <p className="text-[10px] text-gray-600">Last Incident</p>
                    </div>
                    <div className="text-center hidden lg:block">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Globe className="w-3 h-3 text-gray-500" />
                        <span className="font-mono text-gray-400">{svc.endpoint}</span>
                      </div>
                      <p className="text-[10px] text-gray-600">Endpoint</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Activity className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-500">No Services Found</h3>
            <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
