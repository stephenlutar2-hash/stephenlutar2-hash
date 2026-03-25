import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  GitBranch, Play, Pause, RotateCcw, CheckCircle2, XCircle,
  Clock, Loader2, ChevronDown,
} from "lucide-react";
import { workflows } from "@/data/demo";

const statusConfig = {
  running: { label: "Running", icon: Loader2, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", iconClass: "animate-spin" },
  queued: { label: "Queued", icon: Clock, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", iconClass: "" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", iconClass: "" },
  failed: { label: "Failed", icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20", iconClass: "" },
  paused: { label: "Paused", icon: Pause, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", iconClass: "" },
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

export default function Orchestration() {
  const loading = useSimulatedLoading();
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoadingSkeleton title="Orchestration" />
      </DashboardLayout>
    );
  }

  const filtered = filter === "all" ? workflows : workflows.filter(w => w.status === filter);

  const counts = {
    all: workflows.length,
    running: workflows.filter(w => w.status === "running").length,
    queued: workflows.filter(w => w.status === "queued").length,
    completed: workflows.filter(w => w.status === "completed").length,
    failed: workflows.filter(w => w.status === "failed").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Orchestration</h2>
          <p className="text-sm text-gray-500 mt-1">Active workflows, job queues, and execution pipelines</p>
        </div>

        <div className="flex flex-wrap gap-2">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {["Security Pipeline", "Analytics Pipeline", "ML Pipeline", "Data Pipeline"].map(pipeline => {
            const pipelineWfs = workflows.filter(w => w.pipeline === pipeline);
            const running = pipelineWfs.filter(w => w.status === "running").length;
            return (
              <div key={pipeline} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${pipelineColors[pipeline] || "from-gray-500 to-gray-600"}`} />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{pipeline}</span>
                </div>
                <p className="text-lg font-bold text-white">{pipelineWfs.length}</p>
                <p className="text-[10px] text-gray-500">{running} running</p>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          {filtered.map(wf => {
            const cfg = statusConfig[wf.status];
            const Icon = cfg.icon;
            const isExpanded = expandedId === wf.id;
            return (
              <div key={wf.id} className="rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : wf.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left"
                >
                  <Icon className={`w-5 h-5 shrink-0 ${cfg.color.split(" ")[0]} ${cfg.iconClass}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-medium text-white truncate">{wf.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{wf.pipeline}</span>
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
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${wf.progress}%` }} />
                      </div>
                    </div>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-white/5 pt-4">
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
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
