import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIncaProjects, useMutateIncaProjects, useExperiments } from "@/hooks/use-inca";
import ProjectModal from "@/components/ProjectModal";
import { Link } from "wouter";
import { Plus, Edit2, Trash2, ChevronRight, Brain, Search, LayoutGrid, List } from "lucide-react";
import type { IncaProject, CreateIncaProjectStatus } from "@szl-holdings/api-client-react";
import { SkeletonCard } from "@/components/SkeletonLoader";
import AnimatedCounter from "@/components/AnimatedCounter";

const statusColors: Record<string, string> = {
  research: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  development: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  testing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  deployed: "bg-emerald/10 text-emerald border-emerald/20",
  archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const statusSteps = ["research", "development", "testing", "deployed"];

function getAccuracyColor(accuracy: number) {
  if (accuracy >= 90) return "text-emerald";
  if (accuracy >= 70) return "text-cyan";
  if (accuracy >= 50) return "text-amber-400";
  return "text-destructive";
}

function getAccuracyBarColor(accuracy: number) {
  if (accuracy >= 90) return "from-emerald to-emerald/70";
  if (accuracy >= 70) return "from-cyan to-cyan/70";
  if (accuracy >= 50) return "from-amber-400 to-amber-500/70";
  return "from-destructive to-destructive/70";
}

function StatusPipeline({ status }: { status: string }) {
  const activeIdx = statusSteps.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {statusSteps.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          <motion.div
            className={`w-2 h-2 rounded-full ${i <= activeIdx ? "bg-cyan" : "bg-white/10"}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 + 0.2 }}
          />
          {i < statusSteps.length - 1 && (
            <div className={`w-4 h-px ${i < activeIdx ? "bg-cyan/50" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
};

export default function Projects() {
  const { data: projects, isLoading } = useIncaProjects();
  const { data: experiments } = useExperiments();
  const { create, update, remove } = useMutateIncaProjects();
  const [modal, setModal] = useState<{ isOpen: boolean; project?: IncaProject }>({ isOpen: false });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = projects?.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.aiModel.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  }) || [];

  const handleSubmit = (data: { name: string; description: string; status: CreateIncaProjectStatus; aiModel: string; accuracy: number }) => {
    if (modal.project) {
      update.mutate({ id: modal.project.id, data });
    } else {
      create.mutate({ data });
    }
    setModal({ isOpen: false });
  };

  return (
    <motion.div {...pageTransition} className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Projects</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage your AI research projects</p>
        </div>
        <motion.button
          onClick={() => setModal({ isOpen: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan/15 text-cyan border border-cyan/30 rounded-lg hover:bg-cyan hover:text-background font-medium text-sm transition-all glow-cyan"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus className="w-4 h-4" />
          New Project
        </motion.button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-cyan focus:outline-none transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-cyan focus:outline-none transition-colors"
        >
          <option value="all">All Status</option>
          <option value="research">Research</option>
          <option value="development">Development</option>
          <option value="testing">Testing</option>
          <option value="deployed">Deployed</option>
          <option value="archived">Archived</option>
        </select>
        <div className="flex items-center gap-1 bg-input border border-border rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"} transition-colors`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded ${viewMode === "list" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"} transition-colors`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-xl p-12 text-center"
        >
          <Brain className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-white mb-1">
            {projects?.length === 0 ? "No projects yet" : "No matching projects"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {projects?.length === 0
              ? "Create your first AI research project to get started."
              : "Try adjusting your search or filter."}
          </p>
          {projects?.length === 0 && (
            <button
              onClick={() => setModal({ isOpen: true })}
              className="px-4 py-2 bg-cyan/15 text-cyan border border-cyan/30 rounded-lg text-sm font-medium hover:bg-cyan hover:text-background transition-all"
            >
              Create Project
            </button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {filtered.map((proj, i) => {
                const projExps = experiments?.filter(e => e.projectId === proj.id) || [];
                const acc = Number(proj.accuracy);
                return (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -3 }}
                    className="glass-panel-hover rounded-xl p-6 group relative"
                  >
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <motion.button
                        onClick={() => setModal({ isOpen: true, project: proj })}
                        className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          if (window.confirm("Delete this project?")) {
                            remove.mutate({ id: proj.id });
                          }
                        }}
                        className="p-1.5 rounded-md bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan/10 to-violet/10 border border-cyan/20 flex items-center justify-center shrink-0">
                        <AnimatedCounter
                          value={acc}
                          decimals={0}
                          className={`text-lg font-display font-bold ${getAccuracyColor(acc)}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0 pr-16">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-white truncate">{proj.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border shrink-0 ${statusColors[proj.status] || statusColors.research}`}>
                            {proj.status}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-cyan/60 mb-2">{proj.aiModel}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{proj.description}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Accuracy</span>
                        <span className={`font-mono ${getAccuracyColor(acc)}`}>{proj.accuracy}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${getAccuracyBarColor(acc)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${acc}%` }}
                          transition={{ delay: i * 0.04 + 0.3, duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          {projExps.length} experiment{projExps.length !== 1 ? "s" : ""}
                        </span>
                        <StatusPipeline status={proj.status} />
                      </div>
                      <Link
                        href={`/projects/${proj.id}`}
                        className="text-xs font-mono text-cyan hover:text-cyan/80 flex items-center gap-1 transition-colors group/link"
                      >
                        DETAILS <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel rounded-xl overflow-hidden"
            >
              <table className="w-full text-left">
                <thead className="bg-black/30 border-b border-white/5">
                  <tr className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3">Model</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Pipeline</th>
                    <th className="px-5 py-3">Accuracy</th>
                    <th className="px-5 py-3 w-16">Exps</th>
                    <th className="px-5 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filtered.map((proj, i) => {
                    const projExps = experiments?.filter(e => e.projectId === proj.id) || [];
                    const acc = Number(proj.accuracy);
                    return (
                      <motion.tr
                        key={proj.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-white">{proj.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{proj.description}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-mono text-cyan/60">{proj.aiModel}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${statusColors[proj.status] || statusColors.research}`}>
                            {proj.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusPipeline status={proj.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full bg-gradient-to-r ${getAccuracyBarColor(acc)}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${acc}%` }}
                                transition={{ delay: i * 0.03 + 0.2, duration: 0.6 }}
                              />
                            </div>
                            <span className={`text-sm font-mono ${getAccuracyColor(acc)}`}>{proj.accuracy}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{projExps.length}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => setModal({ isOpen: true, project: proj })}
                              className="p-1 rounded text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/projects/${proj.id}`}
                              className="text-xs font-mono text-cyan hover:text-cyan/80"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <ProjectModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false })}
        onSubmit={handleSubmit}
        project={modal.project}
        isPending={create.isPending || update.isPending}
      />
    </motion.div>
  );
}
