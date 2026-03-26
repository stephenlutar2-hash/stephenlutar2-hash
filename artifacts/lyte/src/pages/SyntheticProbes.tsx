import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Wifi, RefreshCw, AlertCircle, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import type { SyntheticProbeData, SyntheticProbe } from "../types";

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

const probeStatusConfig: Record<string, { text: string; bg: string; icon: typeof CheckCircle }> = {
  passing: { text: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle },
  failing: { text: "text-red-400", bg: "bg-red-500/10", icon: AlertTriangle },
  degraded: { text: "text-amber-400", bg: "bg-amber-500/10", icon: AlertCircle },
  unknown: { text: "text-gray-400", bg: "bg-gray-500/10", icon: Clock },
};

function MiniSparkline({ history }: { history: SyntheticProbe["history"] }) {
  if (history.length === 0) return null;
  const maxVal = Math.max(...history.map(h => h.responseTime));
  const minVal = Math.min(...history.map(h => h.responseTime));
  const range = maxVal - minVal || 1;
  const width = 120;
  const height = 28;
  const points = history.map((h, i) => {
    const x = (i / (history.length - 1)) * width;
    const y = height - ((h.responseTime - minVal) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline points={points} fill="none" stroke="hsl(210 100% 60%)" strokeWidth="1.5" strokeLinejoin="round" />
      {history.map((h, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - ((h.responseTime - minVal) / range) * (height - 4) - 2;
        const color = h.status === "passing" ? "#34d399" : h.status === "degraded" ? "#fbbf24" : "#f87171";
        return <circle key={i} cx={x} cy={y} r={2} fill={color} />;
      })}
    </svg>
  );
}

export default function SyntheticProbesPage() {
  const [data, setData] = useState<SyntheticProbeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/lyte/probes`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center py-12"><RefreshCw className="w-5 h-5 text-primary animate-spin" /><span className="ml-2 text-sm text-muted-foreground">Loading probe results...</span></div>;
  if (error) return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="w-6 h-6 text-red-400" /><p className="text-sm text-muted-foreground">{error}</p><button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> Retry</button></div>;
  if (!data) return null;

  const passing = data.probes.filter(p => p.status === "passing").length;
  const failing = data.probes.filter(p => p.status === "failing").length;
  const degraded = data.probes.filter(p => p.status === "degraded").length;

  return (
    <>
      <Section className="mb-6">
        <div className="glass-card rounded-2xl p-6 glow-blue border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-primary font-mono uppercase tracking-[0.25em]">Synthetic Probes</span>
              </div>
              <h1 className="text-xl font-display font-bold mb-1">Overall Health: <span className={data.overallHealth >= 90 ? "text-emerald-400" : data.overallHealth >= 70 ? "text-amber-400" : "text-red-400"}>{data.overallHealth}%</span></h1>
              <p className="text-sm text-muted-foreground">Automated health checks — homepage, login flow, API latency, connector handshakes</p>
            </div>
            <button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5 self-start">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-center">
              <p className="text-lg font-bold font-mono text-emerald-400">{passing}</p>
              <p className="text-[10px] text-muted-foreground">Passing</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center">
              <p className="text-lg font-bold font-mono text-amber-400">{degraded}</p>
              <p className="text-[10px] text-muted-foreground">Degraded</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-center">
              <p className="text-lg font-bold font-mono text-red-400">{failing}</p>
              <p className="text-[10px] text-muted-foreground">Failing</p>
            </div>
          </div>
        </div>
      </Section>

      <div className="space-y-3">
        {data.probes.map((probe, i) => {
          const cfg = probeStatusConfig[probe.status] || probeStatusConfig.unknown;
          const StatusIcon = cfg.icon;
          return (
            <Section key={probe.id} delay={0.05 + i * 0.03}>
              <div className={`glass-card-hover rounded-xl p-5 border ${probe.status === "failing" ? "border-red-500/15" : probe.status === "degraded" ? "border-amber-500/15" : "border-border/50"}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`w-5 h-5 ${cfg.text}`} />
                    <div>
                      <h3 className="text-sm font-semibold">{probe.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{probe.type} · {probe.target} · Last: {probe.lastCheck}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MiniSparkline history={probe.history} />
                    <div className="text-right">
                      <p className={`text-sm font-bold font-mono ${probe.responseTime > 1000 ? "text-red-400" : probe.responseTime > 200 ? "text-amber-400" : "text-emerald-400"}`}>{probe.responseTime < 1000 ? `${probe.responseTime}ms` : `${(probe.responseTime / 1000).toFixed(1)}s`}</p>
                      <p className="text-[10px] text-muted-foreground">{probe.successRate}% success</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded ${cfg.text} ${cfg.bg}`}>{probe.status}</span>
                  </div>
                </div>
              </div>
            </Section>
          );
        })}
      </div>
    </>
  );
}
