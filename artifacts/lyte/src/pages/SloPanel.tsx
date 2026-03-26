import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Target, RefreshCw, AlertCircle, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import type { SloData, SloTarget } from "../types";

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

function BudgetBar({ remaining, total, status }: { remaining: number; total: number; status: string }) {
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
  const color = status === "breached" ? "bg-red-500" : status === "warning" ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className={`h-full rounded-full ${color}`} />
    </div>
  );
}

export default function SloPanelPage() {
  const [data, setData] = useState<SloData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/lyte/slo`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center py-12"><RefreshCw className="w-5 h-5 text-primary animate-spin" /><span className="ml-2 text-sm text-muted-foreground">Loading SLO data...</span></div>;
  if (error) return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="w-6 h-6 text-red-400" /><p className="text-sm text-muted-foreground">{error}</p><button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> Retry</button></div>;
  if (!data) return null;

  const filtered = filterStatus === "all" ? data.targets : data.targets.filter(t => t.status === filterStatus);
  const breached = data.targets.filter(t => t.status === "breached").length;
  const warning = data.targets.filter(t => t.status === "warning").length;
  const healthy = data.targets.filter(t => t.status === "healthy").length;

  return (
    <>
      <Section className="mb-6">
        <div className="glass-card rounded-2xl p-6 glow-blue border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-primary font-mono uppercase tracking-[0.25em]">SLO / Error Budget</span>
              </div>
              <h1 className="text-xl font-display font-bold mb-1">{data.targets.length} SLO Targets Tracked</h1>
              <p className="text-sm text-muted-foreground">Per-service SLO tracking with burn rate, error budget, and business impact analysis</p>
            </div>
            <button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5 self-start">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-center">
              <p className="text-lg font-bold font-mono text-emerald-400">{healthy}</p>
              <p className="text-[10px] text-muted-foreground">Healthy</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center">
              <p className="text-lg font-bold font-mono text-amber-400">{warning}</p>
              <p className="text-[10px] text-muted-foreground">Warning</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-center">
              <p className="text-lg font-bold font-mono text-red-400">{breached}</p>
              <p className="text-[10px] text-muted-foreground">Breached</p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="mb-4" delay={0.05}>
        <div className="flex items-center gap-2">
          {["all", "breached", "warning", "healthy"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterStatus === s ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted text-muted-foreground border border-border hover:text-foreground"}`}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} {s !== "all" && `(${s === "breached" ? breached : s === "warning" ? warning : healthy})`}
            </button>
          ))}
        </div>
      </Section>

      <div className="space-y-3">
        {filtered.map((slo, i) => {
          const statusIcon = slo.status === "breached" ? AlertTriangle : slo.status === "warning" ? AlertCircle : CheckCircle;
          const StatusIcon = statusIcon;
          const statusColor = slo.status === "breached" ? "text-red-400" : slo.status === "warning" ? "text-amber-400" : "text-emerald-400";
          return (
            <Section key={slo.id} delay={0.08 + i * 0.03}>
              <div className={`glass-card-hover rounded-xl p-5 border ${slo.status === "breached" ? "border-red-500/15" : slo.status === "warning" ? "border-amber-500/15" : "border-border/50"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                    <div>
                      <h3 className="text-sm font-semibold">{slo.service}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase">{slo.metric} · {slo.window} window</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded ${statusColor} ${slo.status === "breached" ? "bg-red-500/10" : slo.status === "warning" ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>{slo.status}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Target</p>
                    <p className="text-xs font-mono font-semibold">{slo.target} {slo.unit}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Current</p>
                    <p className={`text-xs font-mono font-semibold ${statusColor}`}>{slo.current} {slo.unit}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Burn Rate</p>
                    <p className={`text-xs font-mono font-semibold ${slo.burnRate > 2 ? "text-red-400" : slo.burnRate > 1 ? "text-amber-400" : "text-emerald-400"}`}>{slo.burnRate}x</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Budget Remaining</p>
                    <p className={`text-xs font-mono font-semibold ${slo.budgetRemaining < 20 ? "text-red-400" : slo.budgetRemaining < 50 ? "text-amber-400" : "text-emerald-400"}`}>{slo.budgetRemaining}%</p>
                  </div>
                </div>

                <BudgetBar remaining={slo.budgetRemaining} total={slo.budgetTotal} status={slo.status} />

                {slo.status !== "healthy" && (
                  <div className="mt-3 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-[10px] text-muted-foreground"><span className="font-semibold text-red-400">Impact if breached:</span> {slo.impactIfBreached}</p>
                  </div>
                )}
              </div>
            </Section>
          );
        })}
      </div>
    </>
  );
}
