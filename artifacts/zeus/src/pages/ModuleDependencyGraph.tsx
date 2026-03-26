import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Zap, GitBranch, ArrowLeft, X, Activity, Cpu, Database, Shield, Network, Settings, HardDrive } from "lucide-react";

const MODULES = [
  { id: "core", name: "Core Engine", icon: Cpu, status: "online", load: 42, x: 50, y: 12, color: "#eab308" },
  { id: "data", name: "Data Nexus", icon: Database, status: "online", load: 58, x: 25, y: 32, color: "#3b82f6" },
  { id: "shield", name: "Shield Protocol", icon: Shield, status: "online", load: 23, x: 75, y: 32, color: "#10b981" },
  { id: "mesh", name: "Neural Mesh", icon: Network, status: "degraded", load: 87, x: 15, y: 55, color: "#f59e0b" },
  { id: "config", name: "Config Matrix", icon: Settings, status: "online", load: 12, x: 50, y: 52, color: "#8b5cf6" },
  { id: "events", name: "Event Bus", icon: Activity, status: "online", load: 35, x: 85, y: 55, color: "#06b6d4" },
  { id: "storage", name: "Storage Engine", icon: HardDrive, status: "online", load: 51, x: 35, y: 78, color: "#ec4899" },
  { id: "version", name: "Versioning", icon: GitBranch, status: "maintenance", load: 0, x: 65, y: 78, color: "#6b7280" },
];

const DEPS = [
  { from: "core", to: "data", strength: 0.9, label: "data sync" },
  { from: "core", to: "shield", strength: 0.8, label: "auth" },
  { from: "core", to: "config", strength: 0.95, label: "config" },
  { from: "core", to: "events", strength: 0.7, label: "events" },
  { from: "data", to: "storage", strength: 0.85, label: "persistence" },
  { from: "data", to: "mesh", strength: 0.6, label: "routing" },
  { from: "shield", to: "config", strength: 0.5, label: "policies" },
  { from: "shield", to: "events", strength: 0.4, label: "audit" },
  { from: "events", to: "storage", strength: 0.7, label: "logs" },
  { from: "config", to: "version", strength: 0.3, label: "versioning" },
  { from: "mesh", to: "events", strength: 0.65, label: "metrics" },
  { from: "storage", to: "version", strength: 0.5, label: "snapshots" },
];

const statusColors: Record<string, string> = {
  online: "#10b981",
  degraded: "#f59e0b",
  maintenance: "#6b7280",
};

export default function ModuleDependencyGraph() {
  const [selected, setSelected] = useState<typeof MODULES[0] | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);

  const connectedEdges = selected ? DEPS.filter(d => d.from === selected.id || d.to === selected.id) : [];
  const connectedIds = selected ? new Set([selected.id, ...connectedEdges.map(e => e.from), ...connectedEdges.map(e => e.to)]) : null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="font-display font-bold text-sm tracking-wider">ZEUS</span>
            <span className="text-[10px] text-gray-500 font-mono">DEPENDENCY GRAPH</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-yellow-400" />
            Module Dependency Graph
          </h2>
          <p className="text-sm text-gray-500 mt-1">Interactive dependency topology between Zeus system modules</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Modules", value: MODULES.length, color: "text-yellow-400" },
            { label: "Online", value: MODULES.filter(m => m.status === "online").length, color: "text-emerald-400" },
            { label: "Dependencies", value: DEPS.length, color: "text-blue-400" },
            { label: "Avg Load", value: `${Math.round(MODULES.filter(m => m.status === "online").reduce((s, m) => s + m.load, 0) / MODULES.filter(m => m.status === "online").length)}%`, color: "text-cyan-400" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl border border-white/[0.06] backdrop-blur-md"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/[0.06] overflow-hidden relative backdrop-blur-md"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <svg viewBox="0 0 100 95" className="w-full" style={{ minHeight: 480 }}>
            <defs>
              <marker id="dep-arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="rgba(234,179,8,0.3)" />
              </marker>
              {MODULES.map(m => (
                <radialGradient key={m.id} id={`glow-${m.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={m.color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={m.color} stopOpacity={0} />
                </radialGradient>
              ))}
            </defs>

            {DEPS.map((dep, i) => {
              const from = MODULES.find(m => m.id === dep.from)!;
              const to = MODULES.find(m => m.id === dep.to)!;
              const isHighlighted = hoveredEdge === i || (connectedIds && connectedEdges.includes(dep));
              const dimmed = connectedIds && !connectedEdges.includes(dep);
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              return (
                <g key={i} onMouseEnter={() => setHoveredEdge(i)} onMouseLeave={() => setHoveredEdge(null)} style={{ cursor: "pointer" }}>
                  <motion.line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={isHighlighted ? "#eab308" : "rgba(255,255,255,0.08)"}
                    strokeWidth={isHighlighted ? 0.4 : 0.2}
                    strokeOpacity={dimmed ? 0.1 : 1}
                    markerEnd="url(#dep-arrow)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: i * 0.04 }}
                  />
                  {isHighlighted && (
                    <>
                      <rect x={midX - 4} y={midY - 1.5} width={8} height={3} rx={0.8} fill="rgba(0,0,0,0.8)" stroke="rgba(234,179,8,0.3)" strokeWidth={0.15} />
                      <text x={midX} y={midY + 0.5} textAnchor="middle" fill="#eab308" fontSize={1.3} fontFamily="monospace">{dep.label}</text>
                    </>
                  )}
                </g>
              );
            })}

            {MODULES.map((mod, i) => {
              const dimmed = connectedIds && !connectedIds.has(mod.id);
              const isSelected = selected?.id === mod.id;
              return (
                <g key={mod.id} onClick={() => setSelected(isSelected ? null : mod)} style={{ cursor: "pointer" }}>
                  <motion.circle
                    cx={mod.x} cy={mod.y} r={5}
                    fill={`url(#glow-${mod.id})`}
                    initial={{ r: 0 }}
                    animate={{ r: 5 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    opacity={dimmed ? 0.2 : 1}
                  />
                  {isSelected && (
                    <circle cx={mod.x} cy={mod.y} r={4.5} fill="none" stroke={mod.color} strokeWidth={0.2} strokeDasharray="1 0.5">
                      <animate attributeName="r" values="4.5;6;4.5" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={mod.x} cy={mod.y} r={2.8} fill={mod.color} fillOpacity={dimmed ? 0.15 : 0.8}
                    stroke={statusColors[mod.status]} strokeWidth={0.25} />
                  <text x={mod.x} y={mod.y + 0.5} textAnchor="middle" fill="white" fontSize={1.2} fontWeight="700" opacity={dimmed ? 0.3 : 1}>
                    {mod.name.split(" ")[0]}
                  </text>
                  <text x={mod.x} y={mod.y - 4} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={1.1} opacity={dimmed ? 0.3 : 1}>
                    {mod.name}
                  </text>
                  {mod.status !== "online" && !dimmed && (
                    <text x={mod.x} y={mod.y + 5} textAnchor="middle" fill={statusColors[mod.status]} fontSize={1} fontWeight="600">
                      {mod.status.toUpperCase()}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-4 right-4 w-72 rounded-xl border border-white/10 backdrop-blur-md p-4"
                style={{ background: "rgba(10,14,20,0.95)" }}
              >
                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: selected.color }} />
                    <h3 className="text-sm font-bold text-white">{selected.name}</h3>
                  </div>
                  <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                <div className="space-y-2 text-xs mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="font-mono uppercase" style={{ color: statusColors[selected.status] }}>{selected.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Load</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: selected.color }}
                          initial={{ width: 0 }} animate={{ width: `${selected.load}%` }} transition={{ duration: 0.6 }} />
                      </div>
                      <span className="font-mono text-white">{selected.load}%</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Dependencies ({connectedEdges.length})</p>
                  {connectedEdges.map((edge, i) => {
                    const other = MODULES.find(m => m.id === (edge.from === selected.id ? edge.to : edge.from))!;
                    const direction = edge.from === selected.id ? "→" : "←";
                    return (
                      <div key={i} className="flex items-center gap-2 py-1 text-xs">
                        <span className="text-yellow-400 font-mono">{direction}</span>
                        <div className="w-2 h-2 rounded-full" style={{ background: other.color }} />
                        <span className="text-gray-300">{other.name}</span>
                        <span className="text-gray-600 ml-auto font-mono text-[10px]">{edge.label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
