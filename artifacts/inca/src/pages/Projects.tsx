import { useState } from "react";
import { motion } from "framer-motion";
import { useIncaProjects, useMutateIncaProjects, useExperiments } from "@/hooks/use-inca";
import ProjectModal from "@/components/ProjectModal";
import { Link } from "wouter";
import { Plus, Edit2, Trash2, ChevronRight, Brain, Search } from "lucide-react";
import type { IncaProject, CreateIncaProjectStatus } from "@workspace/api-client-react";

const statusColors: Record<string, string> = {
  research: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  development: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  testing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  deployed: "bg-emerald/10 text-emerald border-emerald/20",
  archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

function getAccuracyColor(accuracy: number) {
  if (accuracy >= 90) return "text-emerald";
  if (accuracy >= 70) return "text-cyan";
  if (accuracy >= 50) return "text-amber-400";
  return "text-destructive";
}

export default function Projects() {
  const { data: projects, isLoading } = useIncaProjects();
  const { data: experiments } = useExperiments();
  const { create, update, remove } = useMutateIncaProjects();
  const [modal, setModal] = useState<{ isOpen: boolean; project?: IncaProject }>({ isOpen: false });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Projects</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage your AI research projects</p>
        </div>
        <button
          onClick={() => setModal({ isOpen: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan/15 text-cyan border border-cyan/30 rounded-lg hover:bg-cyan hover:text-background font-medium text-sm transition-all glow-cyan"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
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
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-52 glass-panel rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((proj, i) => {
            const projExps = experiments?.filter(e => e.projectId === proj.id) || [];
            const acc = Number(proj.accuracy);
            return (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="glass-panel-hover rounded-xl p-6 group relative"
              >
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => setModal({ isOpen: true, project: proj })}
                    className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this project?")) {
                        remove.mutate({ id: proj.id });
                      }
                    }}
                    className="p-1.5 rounded-md bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan/10 to-violet/10 border border-cyan/20 flex items-center justify-center shrink-0">
                    <span className={`text-lg font-display font-bold ${getAccuracyColor(acc)}`}>
                      {acc.toFixed(0)}
                    </span>
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

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{projExps.length} experiment{projExps.length !== 1 ? "s" : ""}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>Accuracy: <span className={`font-mono ${getAccuracyColor(acc)}`}>{proj.accuracy}%</span></span>
                  </div>
                  <Link
                    href={`/projects/${proj.id}`}
                    className="text-xs font-mono text-cyan hover:text-cyan/80 flex items-center gap-1 transition-colors"
                  >
                    DETAILS <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
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
