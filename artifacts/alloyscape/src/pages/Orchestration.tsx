import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  GitBranch, Play, Pause, RotateCcw, CheckCircle2, XCircle,
  Clock, Loader2, ChevronDown, ArrowRight, Circle,
  Layers, Zap, Activity, Box, Database, Shield, BarChart3, Cpu
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

interface CanvasNode {
  id: string;
  label: string;
  type: "trigger" | "processor" | "output" | "decision" | "database";
  x: number;
  y: number;
  status: "active" | "idle" | "error";
}

interface CanvasEdge {
  from: string;
  to: string;
}

const canvasNodes: CanvasNode[] = [
  { id: "n1", label: "HTTP Trigger", type: "trigger", x: 50, y: 120, status: "active" },
  { id: "n2", label: "Auth Check", type: "decision", x: 230, y: 60, status: "active" },
  { id: "n3", label: "Rate Limiter", type: "processor", x: 230, y: 180, status: "active" },
  { id: "n4", label: "Data Transform", type: "processor", x: 420, y: 80, status: "active" },
  { id: "n5", label: "ML Inference", type: "processor", x: 420, y: 180, status: "idle" },
  { id: "n6", label: "PostgreSQL", type: "database", x: 610, y: 80, status: "active" },
  { id: "n7", label: "Redis Cache", type: "database", x: 610, y: 180, status: "active" },
  { id: "n8", label: "API Response", type: "output", x: 780, y: 120, status: "active" },
];

const canvasEdges: CanvasEdge[] = [
  { from: "n1", to: "n2" },
  { from: "n1", to: "n3" },
  { from: "n2", to: "n4" },
  { from: "n3", to: "n5" },
  { from: "n4", to: "n6" },
  { from: "n5", to: "n7" },
  { from: "n6", to: "n8" },
  { from: "n7", to: "n8" },
];

const nodeTypeIcons: Record<string, typeof Play> = {
  trigger: Zap,
  processor: Cpu,
  output: ArrowRight,
  decision: Shield,
  database: Database,
};

const nodeTypeColors: Record<string, string> = {
  trigger: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
  processor: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  output: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  decision: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  database: "border-violet-500/40 bg-violet-500/10 text-violet-400",
};

interface GanttTask {
  id: string;
  name: string;
  pipeline: string;
  startHour: number;
  duration: number;
  status: string;
}

const ganttTasks: GanttTask[] = [
  { id: "g1", name: "Threat Scan", pipeline: "Security Pipeline", startHour: 0, duration: 3, status: "completed" },
  { id: "g2", name: "Log Aggregation", pipeline: "Analytics Pipeline", startHour: 1, duration: 4, status: "completed" },
  { id: "g3", name: "Model Training", pipeline: "ML Pipeline", startHour: 2, duration: 6, status: "running" },
  { id: "g4", name: "ETL Batch", pipeline: "Data Pipeline", startHour: 4, duration: 3, status: "running" },
  { id: "g5", name: "Vuln Assessment", pipeline: "Security Pipeline", startHour: 5, duration: 2, status: "queued" },
  { id: "g6", name: "Report Generation", pipeline: "Analytics Pipeline", startHour: 6, duration: 2, status: "queued" },
  { id: "g7", name: "Feature Extraction", pipeline: "ML Pipeline", startHour: 8, duration: 3, status: "queued" },
  { id: "g8", name: "Cache Warmup", pipeline: "Data Pipeline", startHour: 7, duration: 1, status: "queued" },
];

const ganttStatusColors: Record<string, string> = {
  completed: "bg-emerald-500/60",
  running: "bg-cyan-500/60",
  queued: "bg-gray-500/30",
  failed: "bg-red-500/60",
};

const GANTT_HOURS = 12;

export default function Orchestration() {
  const loading = useSimulatedLoading();
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "pipeline" | "canvas" | "gantt">("list");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); }, []);

  const showFeedback = useCallback((message: string) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setActionFeedback(message);
    feedbackTimer.current = setTimeout(() => setActionFeedback(null), 2500);
  }, []);

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

  function getNodeCenter(node: CanvasNode) {
    return { x: node.x + 60, y: node.y + 25 };
  }

  return (
    <DashboardLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-white">Orchestration</h2>
          <p className="text-sm text-gray-500 mt-1">Active workflows, job queues, and execution pipelines</p>
        </motion.div>

        <AnimatePresence>
          {actionFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-400"
            >
              <CheckCircle2 className="w-4 h-4" />
              {actionFeedback}
            </motion.div>
          )}
        </AnimatePresence>

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
            {(["list", "pipeline", "canvas", "gantt"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${viewMode === mode ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}
              >
                {mode}
              </button>
            ))}
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

        {viewMode === "canvas" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Visual Workflow Canvas</span>
              <span className="text-[10px] text-gray-500 ml-2">Interactive node-based workflow editor</span>
            </div>
            <div className="p-6 overflow-x-auto">
              <svg width="900" height="280" className="min-w-[900px]">
                <defs>
                  <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="rgba(6, 182, 212, 0.4)" />
                  </marker>
                </defs>
                {canvasEdges.map((edge, i) => {
                  const from = canvasNodes.find(n => n.id === edge.from)!;
                  const to = canvasNodes.find(n => n.id === edge.to)!;
                  const fc = getNodeCenter(from);
                  const tc = getNodeCenter(to);
                  const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to;
                  return (
                    <motion.line
                      key={i}
                      x1={fc.x} y1={fc.y}
                      x2={tc.x} y2={tc.y}
                      stroke={isHighlighted ? "rgba(6, 182, 212, 0.6)" : "rgba(255,255,255,0.08)"}
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeDasharray={isHighlighted ? "0" : "4 4"}
                      markerEnd="url(#arrowhead)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    />
                  );
                })}
                {canvasNodes.map((node, i) => {
                  const Icon = nodeTypeIcons[node.type];
                  const colorClass = nodeTypeColors[node.type];
                  const isHovered = hoveredNode === node.id;
                  return (
                    <motion.g
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={node.x}
                        y={node.y}
                        width={120}
                        height={50}
                        rx={12}
                        fill={isHovered ? "rgba(6, 182, 212, 0.08)" : "rgba(255,255,255,0.02)"}
                        stroke={node.status === "active" ? (isHovered ? "rgba(6, 182, 212, 0.5)" : "rgba(6, 182, 212, 0.2)") : node.status === "error" ? "rgba(239, 68, 68, 0.3)" : "rgba(255,255,255,0.06)"}
                        strokeWidth={isHovered ? 2 : 1}
                      />
                      {node.status === "active" && (
                        <circle cx={node.x + 108} cy={node.y + 12} r={4} fill="#06b6d4" opacity={0.8}>
                          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <text x={node.x + 36} y={node.y + 30} fontSize={10} fill="rgba(255,255,255,0.7)" textAnchor="start" dominantBaseline="middle">
                        {node.label}
                      </text>
                      <foreignObject x={node.x + 10} y={node.y + 17} width={20} height={20}>
                        <div className="flex items-center justify-center w-5 h-5">
                          <Icon className={`w-3.5 h-3.5 ${node.type === "trigger" ? "text-cyan-400" : node.type === "processor" ? "text-blue-400" : node.type === "output" ? "text-emerald-400" : node.type === "decision" ? "text-amber-400" : "text-violet-400"}`} />
                        </div>
                      </foreignObject>
                    </motion.g>
                  );
                })}
              </svg>
            </div>
            <div className="px-5 py-3 border-t border-white/5 flex items-center gap-4">
              {Object.entries(nodeTypeColors).map(([type, color]) => {
                const Icon = nodeTypeIcons[type];
                return (
                  <div key={type} className="flex items-center gap-1.5">
                    <Icon className={`w-3 h-3 ${color.split(" ").pop()}`} />
                    <span className="text-[10px] text-gray-500 capitalize">{type}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {viewMode === "gantt" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Execution Timeline</span>
              <span className="text-[10px] text-gray-500 ml-2">Gantt-style task scheduling view</span>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="flex border-b border-white/5">
                  <div className="w-48 shrink-0 px-4 py-2 text-[10px] text-gray-500 uppercase tracking-wider font-bold">Task</div>
                  <div className="flex-1 flex">
                    {Array.from({ length: GANTT_HOURS }, (_, i) => (
                      <div key={i} className="flex-1 px-1 py-2 text-center text-[9px] text-gray-600 font-mono border-l border-white/[0.03]">
                        {String(i).padStart(2, "0")}:00
                      </div>
                    ))}
                  </div>
                </div>
                {ganttTasks.map((task, ti) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + ti * 0.04 }}
                    className="flex items-center border-b border-white/[0.03] hover:bg-white/[0.02] transition"
                  >
                    <div className="w-48 shrink-0 px-4 py-3">
                      <p className="text-xs font-medium text-white truncate">{task.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${pipelineColors[task.pipeline] || "from-gray-500 to-gray-600"}`} />
                        <span className="text-[9px] text-gray-600 truncate">{task.pipeline}</span>
                      </div>
                    </div>
                    <div className="flex-1 relative h-10">
                      {Array.from({ length: GANTT_HOURS }, (_, i) => (
                        <div key={i} className="absolute top-0 bottom-0 border-l border-white/[0.03]" style={{ left: `${(i / GANTT_HOURS) * 100}%` }} />
                      ))}
                      <motion.div
                        className={`absolute top-2 h-6 rounded-lg ${ganttStatusColors[task.status]} flex items-center px-2`}
                        style={{
                          left: `${(task.startHour / GANTT_HOURS) * 100}%`,
                          width: `${(task.duration / GANTT_HOURS) * 100}%`,
                        }}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: `${(task.duration / GANTT_HOURS) * 100}%`, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 + ti * 0.05 }}
                      >
                        <span className="text-[9px] font-bold text-white truncate">{task.duration}h</span>
                        {task.status === "running" && (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="px-5 py-3 border-t border-white/5 flex items-center gap-4">
              {Object.entries(ganttStatusColors).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div className={`w-3 h-2 rounded ${color}`} />
                  <span className="text-[10px] text-gray-500 capitalize">{status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {viewMode === "pipeline" && (
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
        )}

        {viewMode === "list" && (
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
                              <button onClick={() => showFeedback(`Pause requested for "${wf.name}" (demo)`)} className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors">
                                <Pause className="w-3 h-3" /> Pause
                              </button>
                            )}
                            {wf.status === "paused" && (
                              <button onClick={() => showFeedback(`Resume requested for "${wf.name}" (demo)`)} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium flex items-center gap-1.5 hover:bg-cyan-500/20 transition-colors">
                                <Play className="w-3 h-3" /> Resume
                              </button>
                            )}
                            {(wf.status === "failed" || wf.status === "completed") && (
                              <button onClick={() => showFeedback(`Retry queued for "${wf.name}" (demo)`)} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium flex items-center gap-1.5 hover:bg-cyan-500/20 transition-colors">
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
