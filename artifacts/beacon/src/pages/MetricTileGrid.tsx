import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useMetrics } from "@/hooks/use-beacon";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { LayoutGrid, GripVertical, TrendingUp, TrendingDown } from "lucide-react";

function generateChartData(value: number, change: number, points = 20) {
  const data = [];
  const startVal = value / (1 + change / 100);
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const noise = Math.sin(i * 1.5 + value) * 0.08 + Math.cos(i * 0.9 + change) * 0.05;
    data.push({ x: i, v: Math.max(0, startVal + (value - startVal) * progress + value * noise) });
  }
  return data;
}

const TILE_COLORS = ["#22d3ee", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6", "#14b8a6"];

const CHART_TYPES = ["area", "line", "bar"] as const;

export default function MetricTileGrid() {
  const { data: metrics } = useMetrics();
  const [order, setOrder] = useState<number[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const orderedMetrics = useMemo(() => {
    if (!metrics) return [];
    if (order.length === 0) return metrics;
    return order.map(i => metrics[i]).filter(Boolean);
  }, [metrics, order]);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
    if (order.length === 0 && metrics) {
      setOrder(metrics.map((_, i) => i));
    }
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx || order.length === 0) return;
    setOrder(prev => {
      const newOrder = [...prev];
      if (draggedIdx >= newOrder.length || idx >= newOrder.length) return prev;
      const [moved] = newOrder.splice(draggedIdx, 1);
      newOrder.splice(idx, 0, moved);
      return newOrder;
    });
    setDraggedIdx(idx);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <LayoutGrid className="w-6 h-6 text-primary" />
          Metric Tile Grid
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Drag to reorder dashboard widgets</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {(orderedMetrics.length > 0 ? orderedMetrics : metrics || []).map((metric, i) => {
          const chartData = generateChartData(metric.value, metric.change);
          const color = TILE_COLORS[i % TILE_COLORS.length];
          const chartType = CHART_TYPES[i % CHART_TYPES.length];
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={() => setDraggedIdx(null)}
              className="glass-panel rounded-xl p-5 border border-white/[0.06] cursor-grab active:cursor-grabbing group relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
              whileHover={{ y: -2 }}
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-40 transition-opacity">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{metric.category}</span>
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{metric.name}</p>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-2xl font-display font-bold text-white">{metric.value.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">{metric.unit}</span>
              </div>
              <div className="h-16 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "area" ? (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id={`tile-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={color} fill={`url(#tile-${metric.id})`} strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  ) : chartType === "line" ? (
                    <LineChart data={chartData}>
                      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  ) : (
                    <BarChart data={chartData}>
                      <Bar dataKey="v" fill={color} fillOpacity={0.6} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {metric.change >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                <span className={`text-xs font-mono ${metric.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {metric.change >= 0 ? "+" : ""}{metric.change}%
                </span>
              </div>
            </motion.div>
          );
        })}
        {(!metrics || metrics.length === 0) && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No metrics to display. Add metrics from the dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}
