import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  GitBranch, Play, Pause, RotateCcw, CheckCircle2, XCircle,
  Clock, Loader2, ChevronDown, ArrowRight, Circle,
} from "lucide-react";
import { workflows } from "@/data/demo";

const statusConfig: Record<string, { label: string; icon: typeof Loader2; color: string; iconClass: string; nodeColor: string }> = {
  running: { label: "Running", icon: Loader2, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", iconClass: "animate-spin", nodeColor: "bg-cyan-500 shadow-cyan-500/40" },
  queued: { label: "Queued", icon: Clock, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", iconClass: "", nodeColor: "bg-blue-500 shadow-blue-500/40" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", iconClass: "", nodeColor: "bg-emerald-500 shadow-emerald-500/40" },
  failed: { label: "Failed", icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20", iconClass: "", nodeColor: "bg-red-500 shadow-red-500/40" },
  paused: { label: "Paused", icon: Pause, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", iconClass: "", nodeColor: "bg-amber-500 shadow-amber-500/40" },
};

const pipelineColors: Record<string, string> = {
  "Security Pipeline": "from-red-500 to-orange-500",
  "Analytics Pipeline": "from-blue-500 to-cyan-500",
  "ML Pipeline": "from-violet-500 to-purple-500",
  "Data Pipeline": "from-emerald-500 to-green-500",
  "Maintenance Pipeline": "from-gray-500 to-slate-500",
  "Content Pipeline": "from-pink-500 to-rose-500",
  "Finance Pipeline": "from-amber-500 to-yellow-500",
  "DevOps Pipeline": "from-teal-500 to-cyan-500",
};

const pipelineStages = [
  { name: "Trigger", icon: Play },
  { name: "Validate", icon: CheckCircle2 },
  { name: "Process", icon: Loader2 },
  { name: "Output", icon: ArrowRight },
];

export default function Orchestration() {
  const loading = useSimulatedLoading();
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "pipeline">("list");

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoadingSkeleton title="Orchestration" />
      </DashboardLayout>
    );
  }

  const filtered = filter === "all" ? workflows : workflows.filter(w => w.status === filter);

  const counts: Record<string, number> = {
    all: workflows.length,
    running: workflows.filter(w => w.status === "running").length,
    queued: workflows.filter(w => w.status === "queued").length,
    completed: workflows.filter(w => w.status === "completed").length,
    failed: workflows.filter(w => w.status === "failed").length,
  };

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-white">Orchestration</h2>
          <p className="text-sm text-gray-500 mt-1">Active workflows, job queues, and execution pipelines</p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(counts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider border transition-colors ${
                filter === key
                  ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              {key} ({count})
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${viewMode === "list" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("pipeline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${viewMode === "pipeline" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}
            >
              Pipeline
            </button>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
        >
          {["Security Pipeline", "Analytics Pipeline", "ML Pipeline", "Data Pipeline"].map(pipeline => {
            const pipelineWfs = workflows.filter(w => w.pipeline === pipeline);
            const running = pipelineWfs.filter(w => w.status === "running").length;
            const failed = pipelineWfs.filter(w => w.status === "failed").length;
            return (
              <motion.div
                key={pipeline}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${pipelineColors[pipeline] || "from-gray-500 to-gray-600"}`} />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{pipeline}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{pipelineWfs.length}</p>
                    <p className="text-[10px] text-gray-500">{running} running{failed > 0 ? ` · ${failed} failed` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {pipelineStages.map((stage, i) => (
                      <div key={i} className="flex items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${i < 2 + running ? "bg-cyan-500/20" : "bg-white/5"}`}>
                          <stage.icon className={`w-2.5 h-2.5 ${i < 2 + running ? "text-cyan-400" : "text-gray-600"}`} />
                        </div>
                        {i < pipelineStages.length - 1 && (
                          <div className={`w-2 h-px ${i < 1 + running ? "bg-cyan-500/40" : "bg-white/10"}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {viewMode === "pipeline" ? (
          <div className="space-y-4">
            {Object.keys(pipelineColors).map(pipeline => {
              const pipelineWfs = filtered.filter(w => w.pipeline === pipeline);
              if (pipelineWfs.length === 0) return null;
              return (
                <motion.div
                  key={pipeline}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden"
                >
                  <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${pipelineColors[pipeline]}`} />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{pipeline}</span>
                    <span className="text-[10px] text-gray-500 ml-2">{pipelineWfs.length} workflows</span>
                  </div>
                  <div className="p-5 overflow-x-auto">
                    <div className="flex items-start gap-4 min-w-max">
                      {pipelineWfs.map((wf, i) => {
                        const cfg = statusConfig[wf.status];
                        const Icon = cfg.icon;
                        return (
                          <motion.div
                            key={wf.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex items-center gap-3"
                          >
                            <div className="relative group">
                              <div className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all cursor-default
                                ${wf.status === "running" ? "border-cyan-500/40 bg-cyan-500/10" :
                                  wf.status === "completed" ? "border-emerald-500/40 bg-emerald-500/10" :
                                  wf.status === "failed" ? "border-red-500/40 bg-red-500/10" :
                                  wf.status === "paused" ? "border-amber-500/40 bg-amber-500/10" :
                                  "border-blue-500/40 bg-blue-500/10"
                                }`}
                              >
                                <Icon className={`w-6 h-6 ${cfg.color.split(" ")[0]} ${cfg.iconClass}`} />
                                {wf.status === "running" && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                                )}
                              </div>
                              <div className="mt-2 text-center w-28">
                                <p className="text-[10px] text-white font-medium truncate">{wf.name}</p>
                                <p className="text-[9px] text-gray-500">{wf.duration}</p>
                                {wf.status === "running" && (
                                  <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full bg-cyan-500 rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${wf.progress}%` }}
                                      transition={{ duration: 1 }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            {i < pipelineWfs.length - 1 && (
                              <div className="flex items-center gap-1 self-start mt-6">
                                <div className="w-6 h-px bg-white/10" />
                                <ArrowRight className="w-3 h-3 text-gray-600" />
                                <div className="w-6 h-px bg-white/10" />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((wf, i) => {
              const cfg = statusConfig[wf.status];
              const Icon = cfg.icon;
              const isExpanded = expandedId === wf.id;
              return (
                <motion.div
                  key={wf.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : wf.id)}
                    className="w-full px-5 py-4 flex items-center gap-4 text-left"
                  >
                    <div className="relative">
                      <Icon className={`w-5 h-5 shrink-0 ${cfg.color.split(" ")[0]} ${cfg.iconClass}`} />
                      {wf.status === "running" && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-medium text-white truncate">{wf.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${pipelineColors[wf.pipeline] || "from-gray-500 to-gray-600"}`} />
                          {wf.pipeline}
                        </span>
                        <span>Duration: {wf.duration}</span>
                        <span>Triggered: {wf.triggeredBy}</span>
                      </div>
                    </div>
                    {wf.status === "running" && (
                      <div className="w-24 shrink-0">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{wf.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${wf.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 border-t border-white/5 pt-4">
                          <div className="flex items-center gap-2 mb-4">
                            {pipelineStages.map((stage, si) => {
                              const stageProgress = wf.status === "completed" ? 4 :
                                wf.status === "failed" ? 2 :
                                wf.status === "running" ? Math.ceil((wf.progress / 100) * 4) :
                                wf.status === "queued" ? 0 : 1;
                              const isActive = si < stageProgress;
                              const isCurrent = si === stageProgress - 1;
                              return (
                                <div key={si} className="flex items-center gap-2 flex-1">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    isActive ? "bg-cyan-500/20 border border-cyan-500/30" :
                                    "bg-white/5 border border-white/10"
                                  } ${isCurrent && wf.status === "running" ? "ring-2 ring-cyan-500/20" : ""}`}>
                                    <stage.icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-gray-600"} ${isCurrent && wf.status === "running" ? "animate-pulse" : ""}`} />
                                  </div>
                                  {si < pipelineStages.length - 1 && (
                                    <div className={`flex-1 h-px ${isActive ? "bg-cyan-500/30" : "bg-white/10"}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Workflow ID</p>
                              <p className="text-xs font-mono text-gray-300">{wf.id}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Started At</p>
                              <p className="text-xs text-gray-300">{wf.startedAt ? new Date(wf.startedAt).toLocaleString() : "Pending"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Pipeline</p>
                              <p className="text-xs text-gray-300">{wf.pipeline}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Triggered By</p>
                              <p className="text-xs text-gray-300 capitalize">{wf.triggeredBy}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            {wf.status === "running" && (
                              <button className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors">
                                <Pause className="w-3 h-3" /> Pause
                              </button>
                            )}
                            {wf.status === "paused" && (
                              <button className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium flex items-center gap-1.5 hover:bg-cyan-500/20 transition-colors">
                                <Play className="w-3 h-3" /> Resume
                              </button>
                            )}
                            {(wf.status === "failed" || wf.status === "completed") && (
                              <button className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium flex items-center gap-1.5 hover:bg-cyan-500/20 transition-colors">
                                <RotateCcw className="w-3 h-3" /> Retry
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
