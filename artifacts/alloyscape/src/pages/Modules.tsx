import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, Cpu, HardDrive, Layers,
  ArrowUpDown, Search,
} from "lucide-react";
import { modules } from "@/data/demo";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; dot: string }> = {
  running: { label: "Running", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  degraded: { label: "Degraded", icon: AlertTriangle, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  offline: { label: "Offline", icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
  maintenance: { label: "Maintenance", icon: Clock, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", dot: "bg-blue-400" },
};

type SortKey = "name" | "cpu" | "memory" | "status";

export default function Modules() {
  const loading = useSimulatedLoading();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoadingSkeleton title="System Modules" />
      </DashboardLayout>
    );
  }

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  }

  const filtered = modules
    .filter(m => {
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
      if (sortBy === "cpu") return (a.cpu - b.cpu) * dir;
      if (sortBy === "memory") return (a.memory - b.memory) * dir;
      return a.status.localeCompare(b.status) * dir;
    });

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-white">System Modules</h2>
          <p className="text-sm text-gray-500 mt-1">All registered modules and services with status and version info</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search modules..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setStatusFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${statusFilter === "all" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}>
              All ({modules.length})
            </button>
            {Object.entries(statusConfig).map(([key, cfg]) => {
              const count = modules.filter(m => m.status === key).length;
              return (
                <button key={key} onClick={() => setStatusFilter(key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${statusFilter === key ? cfg.color : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}>
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}: {count}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          {(["name", "cpu", "memory", "status"] as SortKey[]).map(key => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider border transition-colors ${sortBy === key ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"}`}
            >
              <ArrowUpDown className="w-3 h-3" />
              {key} {sortBy === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </button>
          ))}
        </div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
        >
          {filtered.map(mod => {
            const cfg = statusConfig[mod.status];
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={mod.id}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.12)" }}
                onClick={() => setSelectedId(selectedId === mod.id ? null : mod.id)}
                className={`rounded-xl bg-white/[0.03] border cursor-pointer ${selectedId === mod.id ? "border-cyan-500/40 ring-1 ring-cyan-500/20" : "border-white/5"} transition-colors overflow-hidden`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white">{mod.name}</h3>
                        <span className="text-[10px] text-gray-500 font-mono">v{mod.version}</span>
                      </div>
                      <p className="text-xs text-gray-400">{mod.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ml-2 flex items-center gap-1 ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="p-2 rounded-lg bg-white/[0.03] text-center">
                      <Cpu className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
                      <p className={`text-sm font-bold ${mod.cpu > 80 ? "text-red-400" : mod.cpu > 60 ? "text-amber-400" : "text-white"}`}>{mod.cpu}%</p>
                      <p className="text-[10px] text-gray-600">CPU</p>
                      <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${mod.cpu > 80 ? "bg-red-500" : mod.cpu > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${mod.cpu}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.03] text-center">
                      <HardDrive className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
                      <p className={`text-sm font-bold ${mod.memory > 80 ? "text-red-400" : mod.memory > 60 ? "text-amber-400" : "text-white"}`}>{mod.memory}%</p>
                      <p className="text-[10px] text-gray-600">Memory</p>
                      <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${mod.memory > 80 ? "bg-red-500" : mod.memory > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${mod.memory}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.03] text-center">
                      <Layers className="w-3.5 h-3.5 text-gray-500 mx-auto mb-1" />
                      <p className="text-sm font-bold text-white">{mod.instances}</p>
                      <p className="text-[10px] text-gray-600">Instances</p>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                  <span>Uptime: {mod.uptime}</span>
                  <span>Last check: {mod.lastHealthCheck}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Layers className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-500">No Modules Found</h3>
            <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
