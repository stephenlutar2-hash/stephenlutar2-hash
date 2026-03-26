import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  DollarSign, RefreshCw, AlertCircle, TrendingUp, TrendingDown, Minus,
  Cpu, HardDrive, Clock, Plug, Radio, Zap
} from "lucide-react";
import type { CostEfficiencyData, CostItem } from "../types";

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

const categoryConfig: Record<string, { icon: typeof Cpu; color: string; label: string }> = {
  compute: { icon: Cpu, color: "text-blue-400", label: "Compute" },
  storage: { icon: HardDrive, color: "text-purple-400", label: "Storage" },
  jobs: { icon: Clock, color: "text-cyan-400", label: "Scheduled Jobs" },
  connectors: { icon: Plug, color: "text-pink-400", label: "Connectors" },
  events: { icon: Radio, color: "text-amber-400", label: "Event Ingestion" },
};

const efficiencyColors: Record<string, { text: string; bg: string }> = {
  optimal: { text: "text-emerald-400", bg: "bg-emerald-500/10" },
  moderate: { text: "text-amber-400", bg: "bg-amber-500/10" },
  wasteful: { text: "text-red-400", bg: "bg-red-500/10" },
};

export default function CostEfficiencyPage() {
  const [data, setData] = useState<CostEfficiencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/lyte/cost-efficiency`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center py-12"><RefreshCw className="w-5 h-5 text-primary animate-spin" /><span className="ml-2 text-sm text-muted-foreground">Loading cost data...</span></div>;
  if (error) return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="w-6 h-6 text-red-400" /><p className="text-sm text-muted-foreground">{error}</p><button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> Retry</button></div>;
  if (!data) return null;

  const filtered = filterCategory === "all" ? data.items : data.items.filter(i => i.category === filterCategory);
  const optimal = data.items.filter(i => i.efficiency === "optimal").length;
  const moderate = data.items.filter(i => i.efficiency === "moderate").length;
  const wasteful = data.items.filter(i => i.efficiency === "wasteful").length;

  return (
    <>
      <Section className="mb-6">
        <div className="glass-card rounded-2xl p-6 glow-blue border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-primary font-mono uppercase tracking-[0.25em]">Cost & Efficiency</span>
              </div>
              <h1 className="text-xl font-display font-bold mb-1">Estimated Monthly: <span className="text-primary">{data.totalEstimatedMonthly}</span></h1>
              <p className="text-sm text-muted-foreground">Compute, storage, job, connector, and event cost estimates with optimization suggestions</p>
            </div>
            <button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5 self-start">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-center">
              <p className="text-lg font-bold font-mono text-emerald-400">{optimal}</p>
              <p className="text-[10px] text-muted-foreground">Optimal</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center">
              <p className="text-lg font-bold font-mono text-amber-400">{moderate}</p>
              <p className="text-[10px] text-muted-foreground">Moderate</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-center">
              <p className="text-lg font-bold font-mono text-red-400">{wasteful}</p>
              <p className="text-[10px] text-muted-foreground">Wasteful</p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="mb-4" delay={0.05}>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilterCategory("all")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterCategory === "all" ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted text-muted-foreground border border-border hover:text-foreground"}`}>All</button>
          {Object.entries(categoryConfig).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilterCategory(key)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${filterCategory === key ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted text-muted-foreground border border-border hover:text-foreground"}`}>
              <cfg.icon className="w-3 h-3" /> {cfg.label}
            </button>
          ))}
        </div>
      </Section>

      <div className="space-y-3 mb-6">
        {filtered.map((item, i) => {
          const cat = categoryConfig[item.category];
          const CatIcon = cat.icon;
          const eff = efficiencyColors[item.efficiency];
          const TrendIcon = item.trend === "up" ? TrendingUp : item.trend === "down" ? TrendingDown : Minus;
          return (
            <Section key={item.id} delay={0.08 + i * 0.03}>
              <div className="glass-card-hover rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${cat.color === "text-blue-400" ? "bg-blue-500/10" : cat.color === "text-purple-400" ? "bg-purple-500/10" : cat.color === "text-cyan-400" ? "bg-cyan-500/10" : cat.color === "text-pink-400" ? "bg-pink-500/10" : "bg-amber-500/10"} flex items-center justify-center`}>
                      <CatIcon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{item.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{cat.label} · {item.usage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono text-foreground">{item.estimatedCost}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <TrendIcon className={`w-3 h-3 ${item.trend === "up" ? "text-red-400" : item.trend === "down" ? "text-emerald-400" : "text-gray-400"}`} />
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${eff.text} ${eff.bg}`}>{item.efficiency}</span>
                    </div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 flex items-start gap-2">
                  <Zap className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground">{item.suggestion}</p>
                </div>
              </div>
            </Section>
          );
        })}
      </div>

      <Section delay={0.3}>
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Radio className="w-4 h-4 text-amber-400" /> Top Noisy Event Sources</h2>
          <p className="text-xs text-muted-foreground mb-4">Highest event volume sources — candidates for filtering, sampling, or aggregation</p>
          <div className="space-y-2">
            {data.topNoisySources.map((source, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">{source.name}</p>
                  <p className="text-[10px] text-muted-foreground">{source.eventsPerHour.toLocaleString()} events/hour</p>
                </div>
                <p className="text-xs font-mono text-amber-400">{source.cost}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
