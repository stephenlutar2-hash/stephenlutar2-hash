import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIncaProjects, useExperiments, useMutateExperiments } from "@/hooks/use-inca";
import ExperimentModal from "@/components/ExperimentModal";
import { Link } from "wouter";
import { FlaskConical, Plus, Search, Filter, ArrowUpDown, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, AlertTriangle, RefreshCw } from "lucide-react";
import type { CreateIncaExperimentStatus } from "@szl-holdings/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import AnimatedCounter from "@/components/AnimatedCounter";
import { SkeletonChart, SkeletonRow } from "@/components/SkeletonLoader";

const statusColors: Record<string, string> = {
  running: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-emerald/10 text-emerald border-emerald/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const barColors: Record<string, string> = {
  completed: "hsl(160, 84%, 39%)",
  running: "hsl(38, 92%, 50%)",
  failed: "hsl(0, 84%, 60%)",
};

const statusIcons: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  running: Clock,
  failed: AlertCircle,
};

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
};

export default function Experiments() {
  const { data: projects } = useIncaProjects();
  const { data: experiments, isLoading, error } = useExperiments();
  const { create } = useMutateExperiments();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "accuracy">("date");
  const [expModal, setExpModal] = useState<{ isOpen: boolean; projectId: number }>({ isOpen: false, projectId: 0 });
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = experiments
    ?.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.hypothesis.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "accuracy") return Number(b.accuracy) - Number(a.accuracy);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }) || [];

  const comparisonData = filtered.slice(0, 12).map(exp => ({
    name: exp.name.length > 15 ? exp.name.slice(0, 15) + "…" : exp.name,
    accuracy: Number(exp.accuracy),
    status: exp.status,
  }));

  const totalExps = experiments?.length || 0;
  const completedCount = experiments?.filter(e => e.status === "completed").length || 0;
  const runningCount = experiments?.filter(e => e.status === "running").length || 0;
  const failedCount = experiments?.filter(e => e.status === "failed").length || 0;

  const handleExpSubmit = (data: { projectId: number; name: string; hypothesis: string; result: string; status: CreateIncaExperimentStatus; accuracy: number }) => {
    create.mutate({ data }, {
      onSuccess: () => setExpModal({ isOpen: false, projectId: 0 }),
    });
  };

  const defaultProjectId = projects?.[0]?.id || 0;

  if (error) {
    return (
      <motion.div {...pageTransition} className="space-y-6 max-w-7xl">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Experiments</h2>
          <p className="text-muted-foreground mt-1 text-sm">Track and compare experiment outcomes</p>
        </div>
        <div className="glass-panel rounded-xl p-8 border border-destructive/30 bg-destructive/5 text-center">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-white mb-1">Failed to load experiments</h3>
          <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching data.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-mono text-cyan bg-cyan/10 border border-cyan/20 rounded-lg hover:bg-cyan/20 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Experiments</h2>
          <p className="text-muted-foreground mt-1 text-sm">Track and compare experiment outcomes</p>
        </div>
        {projects && projects.length > 0 && (
          <motion.button
            onClick={() => setExpModal({ isOpen: true, projectId: defaultProjectId })}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet/15 text-violet border border-violet/30 rounded-lg hover:bg-violet hover:text-white font-medium text-sm transition-all glow-violet"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="w-4 h-4" />
            New Experiment
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Completed", value: completedCount, color: "text-emerald", icon: CheckCircle2, borderColor: "border-emerald/20", gradient: "from-emerald/10" },
          { label: "Running", value: runningCount, color: "text-amber-400", icon: Clock, borderColor: "border-amber-500/20", gradient: "from-amber-500/10" },
          { label: "Failed", value: failedCount, color: "text-destructive", icon: AlertCircle, borderColor: "border-destructive/20", gradient: "from-destructive/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`metric-card ${stat.borderColor}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} to-transparent rounded-xl opacity-50`} />
            <div className="relative flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <AnimatedCounter value={stat.value} className={`text-xl font-display font-bold ${stat.color} block`} />
                <p className="text-[10px] font-mono text-muted-foreground uppercase">{stat.label}</p>
              </div>
              {totalExps > 0 && (
                <span className="text-xs font-mono text-muted-foreground ml-auto">
                  {((stat.value / totalExps) * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {isLoading ? (
        <SkeletonChart />
      ) : comparisonData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-xl p-6"
        >
          <h3 className="font-display font-bold text-white mb-4">Accuracy Comparison</h3>
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(225, 38%, 10%)",
                    border: "1px solid hsl(225, 25%, 16%)",
                    borderRadius: "8px",
                    fontSize: 12,
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`${value}%`, "Accuracy"]}
                />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} animationDuration={1200}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={index} fill={barColors[entry.status] || barColors.running} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3 justify-center">
            {Object.entries(barColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search experiments..."
            className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-violet focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:border-violet focus:outline-none transition-colors"
          >
            <option value="all">All</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <motion.button
          onClick={() => setSortBy(sortBy === "date" ? "accuracy" : "date")}
          className="flex items-center gap-2 px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-muted-foreground hover:text-white transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {sortBy === "date" ? "By Date" : "By Accuracy"}
        </motion.button>
      </div>

      {isLoading ? (
        <div className="glass-panel rounded-xl p-4 space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-xl p-12 text-center"
        >
          <FlaskConical className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-white mb-1">No experiments found</h3>
          <p className="text-sm text-muted-foreground">
            {experiments?.length === 0
              ? "Create experiments from a project to start tracking."
              : "Try adjusting your filters."}
          </p>
        </motion.div>
      ) : (
        <div className="glass-panel rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black/30 border-b border-white/5">
              <tr className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                <th className="px-5 py-3 w-8"></th>
                <th className="px-5 py-3">Experiment</th>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3 w-24">Status</th>
                <th className="px-5 py-3 w-40">Accuracy</th>
                <th className="px-5 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map((exp, idx) => {
                const proj = projects?.find(p => p.id === exp.projectId);
                const isExpanded = expandedId === exp.id;
                const StatusIcon = statusIcons[exp.status] || Clock;
                return (
                  <React.Fragment key={exp.id}>
                    <motion.tr
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                    >
                      <td className="px-5 py-3.5">
                        <motion.div
                          className={`w-2.5 h-2.5 rounded-full ${
                            exp.status === "completed" ? "bg-emerald" :
                            exp.status === "failed" ? "bg-destructive" :
                            "bg-amber-400"
                          }`}
                          animate={exp.status === "running" ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-white">{exp.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(exp.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        {proj ? (
                          <Link href={`/projects/${proj.id}`} className="text-xs text-cyan hover:underline font-mono" onClick={e => e.stopPropagation()}>
                            {proj.name}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">#{exp.projectId}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border ${statusColors[exp.status] || statusColors.running}`}>
                          <StatusIcon className="w-3 h-3" />
                          {exp.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                exp.status === "completed" ? "bg-emerald" :
                                exp.status === "failed" ? "bg-destructive" :
                                "bg-amber-400"
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${exp.accuracy}%` }}
                              transition={{ delay: idx * 0.03 + 0.3, duration: 0.6 }}
                            />
                          </div>
                          <span className="font-mono text-sm text-white w-12 text-right">{exp.accuracy}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </td>
                    </motion.tr>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          key={`${exp.id}-detail`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-white/[0.01]"
                        >
                          <td colSpan={6} className="px-5 py-4">
                            <div className="grid grid-cols-2 gap-6 pl-8">
                              <div>
                                <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Hypothesis</p>
                                <p className="text-sm text-foreground/80">{exp.hypothesis}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Result</p>
                                <p className="text-sm text-foreground/80">{exp.result}</p>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ExperimentModal
        isOpen={expModal.isOpen}
        onClose={() => setExpModal({ isOpen: false, projectId: 0 })}
        projectId={expModal.projectId}
        projectName={projects?.find(p => p.id === expModal.projectId)?.name}
        onSubmit={handleExpSubmit}
        isPending={create.isPending}
        error={create.isError}
      />
    </motion.div>
  );
}
