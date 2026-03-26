import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, X, Activity, Clock, AlertTriangle } from "lucide-react";

const SERVICES = [
  { id: "api-gw", name: "API Gateway", health: "healthy", latency: 12, requests: 45000, x: 50, y: 10 },
  { id: "auth", name: "Auth Service", health: "healthy", latency: 8, requests: 32000, x: 20, y: 30 },
  { id: "user-svc", name: "User Service", health: "healthy", latency: 15, requests: 28000, x: 50, y: 30 },
  { id: "payment", name: "Payment Service", health: "warning", latency: 145, requests: 12000, x: 80, y: 30 },
  { id: "db-primary", name: "PostgreSQL Primary", health: "healthy", latency: 3, requests: 65000, x: 35, y: 55 },
  { id: "db-replica", name: "PostgreSQL Replica", health: "healthy", latency: 5, requests: 42000, x: 15, y: 70 },
  { id: "redis", name: "Redis Cache", health: "healthy", latency: 1, requests: 120000, x: 65, y: 55 },
  { id: "queue", name: "Message Queue", health: "healthy", latency: 4, requests: 38000, x: 85, y: 55 },
  { id: "ml-engine", name: "ML Engine", health: "degraded", latency: 250, requests: 8000, x: 50, y: 75 },
  { id: "notification", name: "Notification Svc", health: "healthy", latency: 22, requests: 15000, x: 85, y: 75 },
  { id: "cdn", name: "CDN Edge", health: "healthy", latency: 6, requests: 95000, x: 20, y: 90 },
  { id: "storage", name: "Object Storage", health: "healthy", latency: 18, requests: 22000, x: 65, y: 90 },
];

const EDGES = [
  { from: "api-gw", to: "auth", latency: 4 },
  { from: "api-gw", to: "user-svc", latency: 6 },
  { from: "api-gw", to: "payment", latency: 12 },
  { from: "auth", to: "db-primary", latency: 3 },
  { from: "user-svc", to: "db-primary", latency: 5 },
  { from: "user-svc", to: "redis", latency: 1 },
  { from: "payment", to: "queue", latency: 8 },
  { from: "payment", to: "db-primary", latency: 7 },
  { from: "db-primary", to: "db-replica", latency: 2 },
  { from: "redis", to: "ml-engine", latency: 15 },
  { from: "queue", to: "notification", latency: 10 },
  { from: "ml-engine", to: "storage", latency: 20 },
  { from: "api-gw", to: "cdn", latency: 2 },
  { from: "cdn", to: "storage", latency: 8 },
];

const healthColors: Record<string, { fill: string; stroke: string; glow: string }> = {
  healthy: { fill: "#10b981", stroke: "#059669", glow: "rgba(16,185,129,0.3)" },
  warning: { fill: "#f59e0b", stroke: "#d97706", glow: "rgba(245,158,11,0.3)" },
  degraded: { fill: "#ef4444", stroke: "#dc2626", glow: "rgba(239,68,68,0.3)" },
};

export default function ServiceDependencyMap() {
  const [selected, setSelected] = useState<typeof SERVICES[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <Network className="w-6 h-6 text-primary" />
          Service Dependency Map
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Health-colored nodes with latency labels on edges</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Healthy", count: SERVICES.filter(s => s.health === "healthy").length, color: "text-emerald-400" },
          { label: "Warning", count: SERVICES.filter(s => s.health === "warning").length, color: "text-amber-400" },
          { label: "Degraded", count: SERVICES.filter(s => s.health === "degraded").length, color: "text-red-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl border border-white/[0.06] backdrop-blur-md text-center"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.count}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/[0.06] overflow-hidden relative backdrop-blur-md"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
      >
        <svg viewBox="0 0 100 100" className="w-full" style={{ minHeight: 500 }}>
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="rgba(255,255,255,0.2)" />
            </marker>
          </defs>

          {EDGES.map((edge, i) => {
            const from = SERVICES.find(s => s.id === edge.from)!;
            const to = SERVICES.find(s => s.id === edge.to)!;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const latencyColor = edge.latency <= 5 ? "#10b981" : edge.latency <= 10 ? "#06b6d4" : edge.latency <= 20 ? "#f59e0b" : "#ef4444";
            return (
              <g key={i}>
                <motion.line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke="rgba(255,255,255,0.08)" strokeWidth={0.3}
                  markerEnd="url(#arrowhead)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                />
                <rect x={midX - 2.5} y={midY - 1.2} width={5} height={2.4} rx={0.5} fill="rgba(0,0,0,0.6)" />
                <text x={midX} y={midY + 0.5} textAnchor="middle" fill={latencyColor} fontSize={1.4} fontFamily="monospace">{edge.latency}ms</text>
              </g>
            );
          })}

          {SERVICES.map((service, i) => {
            const hc = healthColors[service.health];
            return (
              <g key={service.id} onClick={() => setSelected(service)} style={{ cursor: "pointer" }}>
                <motion.circle
                  cx={service.x} cy={service.y} r={3}
                  fill={hc.fill} fillOpacity={0.15}
                  initial={{ r: 0 }}
                  animate={{ r: 3 }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                />
                {service.health !== "healthy" && (
                  <circle cx={service.x} cy={service.y} r={3.5} fill="none" stroke={hc.fill} strokeWidth={0.2} strokeDasharray="1 1">
                    <animate attributeName="r" values="3.5;5;3.5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={service.x} cy={service.y} r={2} fill={hc.fill} fillOpacity={0.8} stroke={hc.stroke} strokeWidth={0.2} />
                <text x={service.x} y={service.y - 3.5} textAnchor="middle" fill="white" fontSize={1.3} fontWeight="600">{service.name}</text>
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
              className="absolute top-4 right-4 w-64 rounded-xl border border-white/10 backdrop-blur-md p-4"
              style={{ background: "rgba(10,14,20,0.95)" }}
            >
              <div className="flex justify-between mb-3">
                <h3 className="text-sm font-bold text-white">{selected.name}</h3>
                <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Health</span>
                  <span style={{ color: healthColors[selected.health].fill }} className="font-mono uppercase">{selected.health}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Latency</span><span className="text-white font-mono">{selected.latency}ms</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Requests/min</span><span className="text-white font-mono">{(selected.requests / 1000).toFixed(1)}K</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
