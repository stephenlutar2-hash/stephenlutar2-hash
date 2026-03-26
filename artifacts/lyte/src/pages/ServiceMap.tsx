import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import {
  RefreshCw, AlertCircle, Globe, Server, Database, HardDrive,
  Clock, Cloud, Plug, Cpu
} from "lucide-react";
import type { ServiceMapData, ServiceNode } from "../types";

const API_BASE = `${import.meta.env.BASE_URL}../api`;

function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45, delay }} className={className}>
      {children}
    </motion.div>
  );
}

const statusColors: Record<string, { fill: string; stroke: string; text: string; bg: string }> = {
  healthy: { fill: "#059669", stroke: "#34d399", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  degraded: { fill: "#d97706", stroke: "#fbbf24", text: "text-amber-400", bg: "bg-amber-500/10" },
  down: { fill: "#dc2626", stroke: "#f87171", text: "text-red-400", bg: "bg-red-500/10" },
  unknown: { fill: "#6b7280", stroke: "#9ca3af", text: "text-gray-400", bg: "bg-gray-500/10" },
};

const typeIcons: Record<string, typeof Server> = {
  app: Globe,
  api: Server,
  database: Database,
  storage: HardDrive,
  job: Clock,
  connector: Plug,
  external: Cloud,
};

interface NodePosition {
  x: number;
  y: number;
}

function computeLayout(nodes: ServiceNode[]): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const byType: Record<string, ServiceNode[]> = {};
  nodes.forEach(n => {
    if (!byType[n.type]) byType[n.type] = [];
    byType[n.type].push(n);
  });

  const typeOrder = ["external", "app", "api", "database", "storage", "job", "connector"];
  const layerMap: Record<string, number> = { external: 0, app: 1, api: 2, database: 3, storage: 3, job: 4, connector: 4 };

  const layers: Record<number, ServiceNode[]> = {};
  typeOrder.forEach(type => {
    const layer = layerMap[type] ?? 2;
    if (!layers[layer]) layers[layer] = [];
    if (byType[type]) layers[layer].push(...byType[type]);
  });

  const svgWidth = 1200;
  const layerKeys = Object.keys(layers).map(Number).sort((a, b) => a - b);
  const layerSpacing = 140;
  const startY = 60;

  layerKeys.forEach((layerIdx) => {
    const layerNodes = layers[layerIdx];
    const y = startY + layerIdx * layerSpacing;
    const spacing = svgWidth / (layerNodes.length + 1);
    layerNodes.forEach((node, i) => {
      positions.set(node.id, { x: spacing * (i + 1), y });
    });
  });

  return positions;
}

export default function ServiceMapPage() {
  const [data, setData] = useState<ServiceMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/lyte/service-map`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const positions = useMemo(() => data ? computeLayout(data.nodes) : new Map(), [data]);
  const nodeMap = useMemo(() => {
    const m = new Map<string, ServiceNode>();
    data?.nodes.forEach(n => m.set(n.id, n));
    return m;
  }, [data]);

  if (loading) return <div className="flex items-center justify-center py-12"><RefreshCw className="w-5 h-5 text-primary animate-spin" /><span className="ml-2 text-sm text-muted-foreground">Loading service map...</span></div>;
  if (error) return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="w-6 h-6 text-red-400" /><p className="text-sm text-muted-foreground">{error}</p><button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> Retry</button></div>;
  if (!data) return null;

  const healthy = data.nodes.filter(n => n.status === "healthy").length;
  const degraded = data.nodes.filter(n => n.status === "degraded").length;
  const down = data.nodes.filter(n => n.status === "down").length;
  const selNode = selectedNode ? nodeMap.get(selectedNode) : null;
  const connectedEdges = selectedNode ? data.edges.filter(e => e.source === selectedNode || e.target === selectedNode) : [];

  return (
    <>
      <Section className="mb-6">
        <div className="glass-card rounded-2xl p-6 glow-blue border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-primary font-mono uppercase tracking-[0.25em]">Service Dependency Map</span>
              </div>
              <h1 className="text-xl font-display font-bold mb-1">{data.nodes.length} Services · {data.edges.length} Dependencies</h1>
              <p className="text-sm text-muted-foreground">Interactive dependency graph — click any node to inspect connections and health</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> <span className="text-[10px] text-muted-foreground">{healthy} healthy</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" /> <span className="text-[10px] text-muted-foreground">{degraded} degraded</span>
                {down > 0 && <><span className="w-2 h-2 rounded-full bg-red-400" /> <span className="text-[10px] text-muted-foreground">{down} down</span></>}
              </div>
              <button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Section delay={0.05} className="mb-6">
        <div className="glass-card rounded-xl p-4 overflow-x-auto">
          <svg width="1200" height={Math.max(700, (Object.keys(new Set(data.nodes.map(n => n.type))).length) * 160)} viewBox="0 0 1200 700" className="w-full" style={{ minWidth: 800 }}>
            <defs>
              <filter id="glow-green"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="glow-amber"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="glow-red"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>

            {data.edges.map((edge) => {
              const sPos = positions.get(edge.source);
              const tPos = positions.get(edge.target);
              if (!sPos || !tPos) return null;
              const eColor = edge.status === "healthy" ? "#34d39966" : edge.status === "degraded" ? "#fbbf2466" : "#f8717166";
              const highlighted = selectedNode && (edge.source === selectedNode || edge.target === selectedNode);
              return (
                <line key={`${edge.source}-${edge.target}`} x1={sPos.x} y1={sPos.y} x2={tPos.x} y2={tPos.y} stroke={highlighted ? (edge.status === "healthy" ? "#34d399" : edge.status === "degraded" ? "#fbbf24" : "#f87171") : eColor} strokeWidth={highlighted ? 2 : 1} strokeDasharray={edge.status === "degraded" ? "4 2" : edge.status === "down" ? "2 2" : "none"} opacity={selectedNode && !highlighted ? 0.15 : 1} />
              );
            })}

            {data.nodes.map((node) => {
              const pos = positions.get(node.id);
              if (!pos) return null;
              const sc = statusColors[node.status] || statusColors.unknown;
              const isSelected = selectedNode === node.id;
              const isHovered = hoveredNode === node.id;
              const dimmed = selectedNode && !isSelected && !connectedEdges.some(e => e.source === node.id || e.target === node.id);
              return (
                <g key={node.id} onClick={() => setSelectedNode(isSelected ? null : node.id)} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)} style={{ cursor: "pointer" }} opacity={dimmed ? 0.2 : 1}>
                  <circle cx={pos.x} cy={pos.y} r={isSelected ? 26 : isHovered ? 24 : 20} fill="hsl(225 25% 8%)" stroke={sc.stroke} strokeWidth={isSelected ? 2.5 : 1.5} filter={node.status === "degraded" ? "url(#glow-amber)" : node.status === "down" ? "url(#glow-red)" : undefined} />
                  <circle cx={pos.x} cy={pos.y} r={4} fill={sc.fill} />
                  <text x={pos.x} y={pos.y + 34} textAnchor="middle" fill="hsl(225 10% 70%)" fontSize="9" fontFamily="monospace">{node.name}</text>
                  <text x={pos.x} y={pos.y + 46} textAnchor="middle" fill="hsl(225 10% 45%)" fontSize="8" fontFamily="monospace">{node.type}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </Section>

      {selNode && (
        <Section delay={0}>
          <div className="glass-card rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {(() => { const Icon = typeIcons[selNode.type] || Cpu; return <div className={`w-10 h-10 rounded-lg ${statusColors[selNode.status].bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${statusColors[selNode.status].text}`} /></div>; })()}
                <div>
                  <h3 className="text-sm font-semibold">{selNode.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{selNode.type} · Last check: {selNode.lastCheck}</p>
                </div>
              </div>
              <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded ${statusColors[selNode.status].text} ${statusColors[selNode.status].bg}`}>{selNode.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Uptime</p>
                <p className="text-sm font-bold font-mono text-emerald-400">{selNode.uptime}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Latency</p>
                <p className={`text-sm font-bold font-mono ${selNode.latency > 200 ? "text-red-400" : selNode.latency > 100 ? "text-amber-400" : "text-emerald-400"}`}>{selNode.latency}ms</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Connections</p>
                <p className="text-sm font-bold font-mono text-blue-400">{connectedEdges.length}</p>
              </div>
            </div>
            {connectedEdges.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Connected Services</p>
                <div className="flex flex-wrap gap-2">
                  {connectedEdges.map((e) => {
                    const other = e.source === selectedNode ? e.target : e.source;
                    const otherNode = nodeMap.get(other);
                    return (
                      <span key={`${e.source}-${e.target}`} className={`text-[10px] px-2 py-1 rounded-full border ${e.status === "healthy" ? "border-emerald-500/20 text-emerald-400" : e.status === "degraded" ? "border-amber-500/20 text-amber-400" : "border-red-500/20 text-red-400"}`}>
                        {otherNode?.name || other} ({e.latency}ms)
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      <Section delay={0.15}>
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">All Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.nodes.map((node) => {
              const sc = statusColors[node.status];
              const Icon = typeIcons[node.type] || Cpu;
              return (
                <button key={node.id} onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)} className={`p-3 rounded-lg border transition text-left flex items-center gap-3 ${node.id === selectedNode ? "border-primary/40 bg-primary/5" : "border-border/50 bg-muted/20 hover:bg-muted/30"}`}>
                  <Icon className={`w-4 h-4 ${sc.text} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{node.name}</p>
                    <p className="text-[10px] text-muted-foreground">{node.latency}ms · {node.uptime}%</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${node.status === "healthy" ? "bg-emerald-400" : node.status === "degraded" ? "bg-amber-400" : "bg-red-400"}`} />
                </button>
              );
            })}
          </div>
        </div>
      </Section>
    </>
  );
}
