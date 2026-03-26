import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  AlertTriangle, Activity, Server, RefreshCw, AlertCircle, Clock,
  CheckCircle, Zap, Database, Radio, ChevronDown, ChevronUp, Shield
} from "lucide-react";
import type { OperatorCommandCenterData } from "../types";

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

const incidentStatusColors: Record<string, { text: string; bg: string }> = {
  active: { text: "text-red-400", bg: "bg-red-500/10" },
  investigating: { text: "text-amber-400", bg: "bg-amber-500/10" },
  mitigated: { text: "text-blue-400", bg: "bg-blue-500/10" },
  resolved: { text: "text-emerald-400", bg: "bg-emerald-500/10" },
};

const syncStatusColors: Record<string, { text: string; bg: string }> = {
  synced: { text: "text-emerald-400", bg: "bg-emerald-500/10" },
  syncing: { text: "text-blue-400", bg: "bg-blue-500/10" },
  failed: { text: "text-red-400", bg: "bg-red-500/10" },
  stale: { text: "text-amber-400", bg: "bg-amber-500/10" },
};

export default function OperatorCommandCenterPage() {
  const [data, setData] = useState<OperatorCommandCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/lyte/operator/command-center`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center py-12"><RefreshCw className="w-5 h-5 text-primary animate-spin" /><span className="ml-2 text-sm text-muted-foreground">Loading operator data...</span></div>;
  if (error) return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="w-6 h-6 text-red-400" /><p className="text-sm text-muted-foreground">{error}</p><button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> Retry</button></div>;
  if (!data) return null;

  const activeIncidents = data.incidents.filter(i => i.status !== "resolved").length;

  return (
    <>
      <Section className="mb-6">
        <div className="glass-card rounded-2xl p-6 border-primary/20" style={{ boxShadow: activeIncidents > 0 ? "0 0 30px rgba(239,68,68,0.08)" : "0 0 30px rgba(59,130,246,0.08)" }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-primary font-mono uppercase tracking-[0.25em]">Operator Command Center</span>
              </div>
              <h1 className="text-xl md:text-2xl font-display font-bold mb-1">
                {activeIncidents > 0 ? <><span className="text-red-400">{activeIncidents}</span> Active Incident{activeIncidents !== 1 ? "s" : ""}</> : <span className="text-emerald-400">All Clear</span>}
              </h1>
              <p className="text-sm text-muted-foreground">Live incident management, deployment tracking, job status, and system health</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Queue Lag</p>
                <span className={`text-xs font-mono ${data.queueLag > 500 ? "text-red-400" : data.queueLag > 200 ? "text-amber-400" : "text-emerald-400"}`}>{data.queueLag}ms</span>
              </div>
              <button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Section className="mb-6" delay={0.05}>
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><AlertTriangle className="w-4 h-4 text-red-400" /> Live Incidents</h2>
          <div className="space-y-3">
            {data.incidents.map((inc) => {
              const statusC = incidentStatusColors[inc.status] || incidentStatusColors.active;
              const expanded = expandedIncident === inc.id;
              return (
                <div key={inc.id} className="rounded-lg border border-border/50 overflow-hidden">
                  <button onClick={() => setExpandedIncident(expanded ? null : inc.id)} className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition text-left">
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${inc.severity === "high" ? "text-orange-400 bg-orange-500/10" : inc.severity === "critical" ? "text-red-400 bg-red-500/10" : "text-amber-400 bg-amber-500/10"}`}>{inc.severity}</span>
                      <div>
                        <p className="text-xs font-semibold">{inc.title}</p>
                        <p className="text-[10px] text-muted-foreground">{inc.assignee} · {inc.duration} · {inc.affectedServices.join(", ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusC.text} ${statusC.bg}`}>{inc.status}</span>
                      {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                  </button>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-4 pb-4 border-t border-border/30">
                      <div className="pt-3 space-y-2">
                        {inc.updates.map((update, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Clock className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-[11px] text-muted-foreground">{update}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Section delay={0.1}>
          <div className="glass-card rounded-xl p-5 h-full">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Server className="w-4 h-4 text-purple-400" /> Recent Deployments</h2>
            <div className="space-y-2">
              {data.deployments.map((dep) => (
                <div key={dep.id} className="p-3 rounded-lg bg-muted/20 border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{dep.app} <span className="text-muted-foreground font-mono">v{dep.version}</span></p>
                    <p className="text-[10px] text-muted-foreground">{dep.deployer} · <span className="font-mono">{dep.commitHash}</span></p>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${dep.status === "success" ? "text-emerald-400 bg-emerald-500/10" : dep.status === "failed" ? "text-red-400 bg-red-500/10" : dep.status === "in-progress" ? "text-blue-400 bg-blue-500/10" : "text-amber-400 bg-amber-500/10"}`}>{dep.status}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section delay={0.15}>
          <div className="glass-card rounded-xl p-5 h-full">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-blue-400" /> Job Status</h2>
            <div className="space-y-2">
              {data.jobs.map((job) => (
                <div key={job.id} className="p-3 rounded-lg bg-muted/20 border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{job.name}</p>
                    <p className="text-[10px] text-muted-foreground">Duration: {job.duration} · Next: {new Date(job.nextRun).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${job.status === "running" ? "text-blue-400 bg-blue-500/10" : job.status === "completed" ? "text-emerald-400 bg-emerald-500/10" : job.status === "failed" ? "text-red-400 bg-red-500/10" : "text-gray-400 bg-gray-500/10"}`}>{job.status}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Section delay={0.2}>
          <div className="glass-card rounded-xl p-5 h-full">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Database className="w-4 h-4 text-cyan-400" /> Connector Sync Status</h2>
            <div className="space-y-2">
              {data.connectorSyncs.map((cs) => {
                const sc = syncStatusColors[cs.status] || syncStatusColors.synced;
                return (
                  <div key={cs.id} className="p-3 rounded-lg bg-muted/20 border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">{cs.name}</p>
                      <p className="text-[10px] text-muted-foreground">Last: {cs.lastSync} · {cs.recordsProcessed.toLocaleString()} records · {cs.errorCount} errors</p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sc.text} ${sc.bg}`}>{cs.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        <Section delay={0.25}>
          <div className="glass-card rounded-xl p-5 h-full">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-amber-400" /> Data Freshness</h2>
            <div className="space-y-2">
              {Object.entries(data.dataFreshness).map(([source, freshness]) => {
                const isStale = freshness.includes("18") || freshness === "—";
                return (
                  <div key={source} className="p-3 rounded-lg bg-muted/20 border border-border/50 flex items-center justify-between">
                    <span className="text-xs font-semibold">{source}</span>
                    <span className={`text-xs font-mono ${isStale ? "text-amber-400" : "text-emerald-400"}`}>{freshness}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>
      </div>

      <Section delay={0.3}>
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Shield className="w-4 h-4 text-red-400" /> Blast Radius</h2>
          <p className="text-xs text-muted-foreground mb-4">Downstream systems affected by current incidents and degradations</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.blastRadius.map((item) => (
              <div key={item.service} className={`p-4 rounded-lg border ${item.status === "affected" ? "border-red-500/20 bg-red-500/5" : item.status === "at-risk" ? "border-amber-500/20 bg-amber-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold">{item.service}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.status === "affected" ? "text-red-400 bg-red-500/10" : item.status === "at-risk" ? "text-amber-400 bg-amber-500/10" : "text-emerald-400 bg-emerald-500/10"}`}>{item.status}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1">{item.impact} impact</p>
                {item.downstream.length > 0 && (
                  <p className="text-[10px] text-muted-foreground">Downstream: {item.downstream.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
