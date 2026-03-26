import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Milestone, RefreshCw, AlertCircle, CheckCircle, AlertTriangle,
  RotateCcw, GitCommit, Tag, ChevronDown, ChevronUp, Flag
} from "lucide-react";
import type { ReleaseIntelligenceData, ReleaseEvent } from "../types";

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

const statusConfig: Record<string, { text: string; bg: string; icon: typeof CheckCircle }> = {
  success: { text: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle },
  failed: { text: "text-red-400", bg: "bg-red-500/10", icon: AlertTriangle },
  "rolled-back": { text: "text-amber-400", bg: "bg-amber-500/10", icon: RotateCcw },
};

export default function ReleaseIntelligencePage() {
  const [data, setData] = useState<ReleaseIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRelease, setExpandedRelease] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/lyte/releases`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center py-12"><RefreshCw className="w-5 h-5 text-primary animate-spin" /><span className="ml-2 text-sm text-muted-foreground">Loading release data...</span></div>;
  if (error) return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="w-6 h-6 text-red-400" /><p className="text-sm text-muted-foreground">{error}</p><button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> Retry</button></div>;
  if (!data) return null;

  const successful = data.releases.filter(r => r.status === "success").length;
  const rolledBack = data.releases.filter(r => r.status === "rolled-back").length;
  const withErrors = data.releases.filter(r => r.firstSeenErrors.length > 0).length;

  return (
    <>
      <Section className="mb-6">
        <div className="glass-card rounded-2xl p-6 glow-blue border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Milestone className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-primary font-mono uppercase tracking-[0.25em]">Release Intelligence</span>
              </div>
              <h1 className="text-xl font-display font-bold mb-1">{data.releases.length} Recent Releases</h1>
              <p className="text-sm text-muted-foreground">Deploy timeline, version tracking, feature flags, and error correlation</p>
            </div>
            <button onClick={load} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5 self-start">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-center">
              <p className="text-lg font-bold font-mono text-emerald-400">{successful}</p>
              <p className="text-[10px] text-muted-foreground">Successful</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center">
              <p className="text-lg font-bold font-mono text-amber-400">{rolledBack}</p>
              <p className="text-[10px] text-muted-foreground">Rolled Back</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-center">
              <p className="text-lg font-bold font-mono text-red-400">{withErrors}</p>
              <p className="text-[10px] text-muted-foreground">With Errors</p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="mb-6" delay={0.05}>
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Tag className="w-4 h-4 text-purple-400" /> Current Versions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {Object.entries(data.currentVersions).map(([app, version]) => (
              <div key={app} className="p-2 rounded-lg bg-muted/20 border border-border/50 text-center">
                <p className="text-[10px] font-semibold truncate">{app}</p>
                <p className="text-[10px] font-mono text-primary">{version}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border/40" />
        <div className="space-y-4">
          {data.releases.map((rel, i) => {
            const cfg = statusConfig[rel.status] || statusConfig.success;
            const StatusIcon = cfg.icon;
            const expanded = expandedRelease === rel.id;
            const date = new Date(rel.timestamp);
            return (
              <Section key={rel.id} delay={0.1 + i * 0.04}>
                <div className="relative pl-12">
                  <div className={`absolute left-4 top-5 w-4 h-4 rounded-full border-2 ${cfg.text === "text-emerald-400" ? "border-emerald-400 bg-emerald-500/20" : cfg.text === "text-amber-400" ? "border-amber-400 bg-amber-500/20" : "border-red-400 bg-red-500/20"}`} />
                  <div className={`glass-card-hover rounded-xl overflow-hidden border ${rel.rollbackMarker ? "border-amber-500/20" : "border-border/50"}`}>
                    <button onClick={() => setExpandedRelease(expanded ? null : rel.id)} className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition text-left">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`w-4 h-4 ${cfg.text}`} />
                        <div>
                          <p className="text-xs font-semibold">{rel.app} <span className="font-mono text-muted-foreground">v{rel.version}</span></p>
                          <p className="text-[10px] text-muted-foreground">
                            {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {rel.deployer} · <GitCommit className="w-3 h-3 inline-block" /> <span className="font-mono">{rel.commitHash}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {rel.rollbackMarker && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-amber-400 bg-amber-500/10">ROLLED BACK</span>}
                        {rel.firstSeenErrors.length > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-red-400 bg-red-500/10">{rel.firstSeenErrors.length} ERROR{rel.firstSeenErrors.length > 1 ? "S" : ""}</span>}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${cfg.text} ${cfg.bg}`}>{rel.status}</span>
                        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                    </button>
                    {expanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-4 pb-4 border-t border-border/30">
                        <div className="pt-3 space-y-3">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Changelog</p>
                            <div className="space-y-1">
                              {rel.changelog.map((c, j) => (
                                <p key={j} className="text-[11px] text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">·</span> {c}</p>
                              ))}
                            </div>
                          </div>
                          {rel.featureFlags.length > 0 && (
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Feature Flags</p>
                              <div className="flex flex-wrap gap-2">
                                {rel.featureFlags.map((ff) => (
                                  <span key={ff.name} className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${ff.enabled ? "border-emerald-500/20 text-emerald-400" : "border-gray-500/20 text-gray-400"}`}>
                                    <Flag className="w-2.5 h-2.5" /> {ff.name}: {ff.enabled ? "ON" : "OFF"}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {rel.firstSeenErrors.length > 0 && (
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">First-Seen Errors After Release</p>
                              <div className="space-y-1">
                                {rel.firstSeenErrors.map((e, j) => (
                                  <p key={j} className="text-[11px] text-red-400 flex items-start gap-2"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {e}</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </Section>
            );
          })}
        </div>
      </div>
    </>
  );
}
