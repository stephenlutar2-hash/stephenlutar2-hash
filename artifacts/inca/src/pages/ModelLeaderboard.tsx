import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useIncaProjects, useExperiments } from "@/hooks/use-inca";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Trophy, Medal, ArrowUpDown, Crown, Star, ChevronUp, ChevronDown } from "lucide-react";

const MEDALS = ["🥇", "🥈", "🥉"];
const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  elite: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  strong: { bg: "bg-emerald/10", text: "text-emerald", border: "border-emerald/20" },
  moderate: { bg: "bg-cyan/10", text: "text-cyan", border: "border-cyan/20" },
  weak: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
};

function getBadge(accuracy: number) {
  if (accuracy >= 90) return { label: "ELITE", key: "elite" };
  if (accuracy >= 75) return { label: "STRONG", key: "strong" };
  if (accuracy >= 60) return { label: "MODERATE", key: "moderate" };
  return { label: "NEEDS WORK", key: "weak" };
}

type SortField = "accuracy" | "name" | "experiments" | "status";
type SortDir = "asc" | "desc";

export default function ModelLeaderboard() {
  const { data: projects } = useIncaProjects();
  const { data: experiments } = useExperiments();
  const [sortField, setSortField] = useState<SortField>("accuracy");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const sorted = useMemo(() => {
    if (!projects) return [];
    const enriched = projects.map(p => ({
      ...p,
      expCount: experiments?.filter(e => e.projectId === p.id).length || 0,
      acc: Number(p.accuracy),
    }));
    return enriched.sort((a, b) => {
      let cmp = 0;
      if (sortField === "accuracy") cmp = a.acc - b.acc;
      else if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "experiments") cmp = a.expCount - b.expCount;
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [projects, experiments, sortField, sortDir]);

  const chartData = sorted.slice(0, 10).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
    accuracy: p.acc,
  }));

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === "desc" ? <ChevronDown className="w-3 h-3 text-cyan" /> : <ChevronUp className="w-3 h-3 text-cyan" />;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <Trophy className="w-6 h-6 text-amber-400" />
          Model Leaderboard
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Ranked by performance with sortable columns</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 border border-white/[0.06]"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
      >
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" /> Top 10 Performance
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={80} />
              <Tooltip contentStyle={{ background: "rgba(15,15,35,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="accuracy" radius={[0, 6, 6, 0]} animationDuration={1200}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "#06b6d4"} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl overflow-hidden border border-white/[0.06]"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase w-12">#</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase cursor-pointer" onClick={() => handleSort("name")}>
                  <span className="flex items-center gap-1">Model <SortIcon field="name" /></span>
                </th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase cursor-pointer" onClick={() => handleSort("accuracy")}>
                  <span className="flex items-center gap-1 justify-end">Accuracy <SortIcon field="accuracy" /></span>
                </th>
                <th className="px-4 py-3 text-center text-xs text-muted-foreground uppercase">Badge</th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase cursor-pointer" onClick={() => handleSort("experiments")}>
                  <span className="flex items-center gap-1 justify-end">Experiments <SortIcon field="experiments" /></span>
                </th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase cursor-pointer" onClick={() => handleSort("status")}>
                  <span className="flex items-center gap-1 justify-end">Status <SortIcon field="status" /></span>
                </th>
                <th className="px-4 py-3 text-right text-xs text-muted-foreground uppercase">AI Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sorted.map((project, i) => {
                const badge = getBadge(project.acc);
                const badgeStyle = BADGE_COLORS[badge.key];
                return (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-center">
                      {i < 3 ? <span className="text-lg">{MEDALS[i]}</span> : <span className="text-muted-foreground font-mono text-xs">{i + 1}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {i === 0 && <Star className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="text-white font-medium">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: project.acc >= 90 ? "#f59e0b" : project.acc >= 75 ? "#10b981" : project.acc >= 60 ? "#06b6d4" : "#ef4444" }}
                            initial={{ width: 0 }}
                            animate={{ width: `${project.acc}%` }}
                            transition={{ duration: 0.8, delay: i * 0.03 }}
                          />
                        </div>
                        <span className="font-mono text-cyan w-12 text-right">{project.acc}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{project.expCount}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        project.status === "deployed" ? "bg-emerald/10 text-emerald border-emerald/20" :
                        project.status === "development" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        project.status === "testing" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        project.status === "archived" ? "bg-gray-500/10 text-gray-400 border-gray-500/20" :
                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>{project.status.toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground font-mono">{project.aiModel}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Medal className="w-8 h-8 mx-auto mb-2 opacity-20" />
            No models to rank yet
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
