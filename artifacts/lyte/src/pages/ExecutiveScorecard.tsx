import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shield, TrendingUp, TrendingDown, Minus, AlertTriangle, DollarSign,
  Activity, Users, Target, Zap, RefreshCw, AlertCircle, Link2, Server,
  ChevronRight, ArrowUpRight
} from "lucide-react";
import type { ExecutiveScorecard as ScorecardType } from "../types";

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

const severityColors = {
  healthy: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/5" },
  warning: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/5" },
  critical: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", glow: "shadow-red-500/5" },
};

const metricIcons: Record<string, typeof Activity> = {
  "Revenue at Risk": DollarSign,
  "Pipeline Exposure": Link2,
  "Deployment Risk": Server,
  "Connector Health": Activity,
  "Customer Impact": Users,
  "SLA/SLO Health": Target,
  "Operational Savings": Zap,
  "Security Posture": Shield,
};

export default function ExecutiveScorecardPage() {
  const [data, setData] = useState<ScorecardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/lyte/executive/scorecard`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const d = await res.json();
      setData(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center py-12"><RefreshCw className="w-5 h-5 text-primary animate-spin" /><span className="ml-2 text-sm text-muted-foreground">Loading scorecard...</span></div>;
  if (error) return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="w-6 h-6 text-red-400" /><p className="text-sm text-muted-foreground">{error}</p><button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> Retry</button></div>;
  if (!data) return null;

  const confidenceColor = data.overallConfidence >= 80 ? "text-emerald-400" : data.overallConfidence >= 60 ? "text-amber-400" : "text-red-400";

  return (
    <>
      <Section className="mb-6">
        <div className="glass-card rounded-2xl p-6 glow-blue border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-primary font-mono uppercase tracking-[0.25em]">Executive Scorecard</span>
              </div>
              <h1 className="text-xl md:text-2xl font-display font-bold mb-1">Operator Confidence: <span className={confidenceColor}>{data.overallConfidence}/100</span></h1>
              <p className="text-sm text-muted-foreground">Business-outcome view tying platform health to revenue, risk, and operational efficiency</p>
            </div>
            <button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5 self-start">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Revenue at Risk", value: data.revenueAtRisk, severity: "warning" as const },
              { label: "SLA Health", value: data.slaHealth, severity: "warning" as const },
              { label: "Connector Health", value: data.connectorHealth, severity: "healthy" as const },
              { label: "Customer Impact", value: data.customerImpact, severity: "critical" as const },
            ].map((item) => (
              <div key={item.label} className={`p-3 rounded-xl border ${severityColors[item.severity].border} ${severityColors[item.severity].bg}`}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                <p className={`text-sm font-bold font-mono ${severityColors[item.severity].text}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {data.metrics.map((metric, i) => {
          const colors = severityColors[metric.severity];
          const Icon = metricIcons[metric.label] || Activity;
          const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus;
          return (
            <Section key={metric.id} delay={i * 0.04}>
              <div className={`glass-card-hover rounded-xl p-5 border ${colors.border}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{metric.label}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${colors.text} ${colors.bg}`}>{metric.severity}</span>
                        <div className="flex items-center gap-0.5">
                          <TrendIcon className={`w-3 h-3 ${metric.trend === "up" && metric.severity !== "healthy" ? "text-red-400" : metric.trend === "up" ? "text-emerald-400" : "text-gray-400"}`} />
                          <span className="text-[10px] text-muted-foreground">{metric.trend}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className={`text-lg font-bold font-mono ${colors.text}`}>{metric.value}</p>
                </div>
                <p className="text-xs text-muted-foreground">{metric.detail}</p>
              </div>
            </Section>
          );
        })}
      </div>

      <Section delay={0.3}>
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><AlertTriangle className="w-4 h-4 text-amber-400" /> Risk Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/15">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Pipeline Exposure</p>
              <p className="text-sm font-bold text-red-400 mb-2">{data.pipelineExposure}</p>
              <p className="text-[10px] text-muted-foreground">Logistics Hub and AI Engine adapters operating below capacity</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Deployment Risk</p>
              <p className="text-sm font-bold text-amber-400 mb-2">{data.deploymentRisk}</p>
              <p className="text-[10px] text-muted-foreground">Firestorm in staging with 2 active blockers preventing promotion</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Revenue Pipeline</p>
              <p className="text-sm font-bold text-emerald-400 mb-2">$84K/qtr</p>
              <p className="text-[10px] text-muted-foreground">Carlota Jo bookings healthy. Stripe integration 100% operational</p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
