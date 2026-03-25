import { useState } from "react";
import { motion } from "framer-motion";
import { useIncaProjects, useExperiments, useMutateExperiments } from "@/hooks/use-inca";
import ExperimentModal from "@/components/ExperimentModal";
import { Link } from "wouter";
import { FlaskConical, Plus, Search, Filter, ArrowUpDown } from "lucide-react";
import type { CreateIncaExperimentStatus } from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

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

export default function Experiments() {
  const { data: projects } = useIncaProjects();
  const { data: experiments, isLoading } = useExperiments();
  const { create } = useMutateExperiments();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "accuracy">("date");
  const [expModal, setExpModal] = useState<{ isOpen: boolean; projectId: number }>({ isOpen: false, projectId: 0 });

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

  const handleExpSubmit = (data: { projectId: number; name: string; hypothesis: string; result: string; status: CreateIncaExperimentStatus; accuracy: number }) => {
    create.mutate({ data });
    setExpModal({ isOpen: false, projectId: 0 });
  };

  const defaultProjectId = projects?.[0]?.id || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Experiments</h2>
          <p className="text-muted-foreground mt-1 text-sm">Track and compare experiment outcomes</p>
        </div>
        {projects && projects.length > 0 && (
          <button
            onClick={() => setExpModal({ isOpen: true, projectId: defaultProjectId })}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet/15 text-violet border border-violet/30 rounded-lg hover:bg-violet hover:text-white font-medium text-sm transition-all glow-violet"
          >
            <Plus className="w-4 h-4" />
            New Experiment
          </button>
        )}
      </div>

      {comparisonData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="glass-panel rounded-xl p-6"
        >
          <h3 className="font-display font-bold text-white mb-4">Accuracy Comparison</h3>
          <div className="h-48">
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
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
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
        <button
          onClick={() => setSortBy(sortBy === "date" ? "accuracy" : "date")}
          className="flex items-center gap-2 px-3 py-2.5 bg-input border border-border rounded-lg text-sm text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {sortBy === "date" ? "By Date" : "By Accuracy"}
        </button>
      </div>

      {isLoading ? (
        <div className="glass-panel rounded-xl overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 border-b border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
          <FlaskConical className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-white mb-1">No experiments found</h3>
          <p className="text-sm text-muted-foreground">
            {experiments?.length === 0
              ? "Create experiments from a project to start tracking."
              : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black/30 border-b border-white/5">
              <tr className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                <th className="px-5 py-3">Experiment</th>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Hypothesis</th>
                <th className="px-5 py-3">Result</th>
                <th className="px-5 py-3 w-24">Status</th>
                <th className="px-5 py-3 w-20 text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map(exp => {
                const proj = projects?.find(p => p.id === exp.projectId);
                return (
                  <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-white">{exp.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(exp.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      {proj ? (
                        <Link href={`/projects/${proj.id}`} className="text-xs text-cyan hover:underline font-mono">
                          {proj.name}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">#{exp.projectId}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <p className="text-xs text-muted-foreground truncate">{exp.hypothesis}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <p className="text-xs text-foreground/80 truncate">{exp.result}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${statusColors[exp.status] || statusColors.running}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-mono text-sm text-white">{exp.accuracy}%</span>
                    </td>
                  </tr>
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
      />
    </motion.div>
  );
}
