import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, AlertTriangle, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";

const ALERT_GROUPS = [
  {
    rootCause: "Database Connection Pool Exhaustion",
    severity: "critical",
    alerts: [
      { id: "A-001", name: "Query timeout exceeded 5s", source: "PostgreSQL", time: "14:22", status: "active" },
      { id: "A-002", name: "Connection pool 95% utilized", source: "pgBouncer", time: "14:23", status: "active" },
      { id: "A-003", name: "API response time degraded", source: "API Gateway", time: "14:25", status: "active" },
      { id: "A-004", name: "Prediction batch queue growing", source: "Queue Manager", time: "14:27", status: "acknowledged" },
    ],
  },
  {
    rootCause: "GPU Memory Pressure",
    severity: "high",
    alerts: [
      { id: "A-005", name: "GPU utilization >95% for 10 min", source: "GPU Cluster", time: "10:15", status: "resolved" },
      { id: "A-006", name: "Model inference latency 2x baseline", source: "Model Server", time: "10:18", status: "resolved" },
      { id: "A-007", name: "OOM warning on node gpu-03", source: "Kubernetes", time: "10:20", status: "resolved" },
    ],
  },
  {
    rootCause: "Data Pipeline Stale Input",
    severity: "medium",
    alerts: [
      { id: "A-008", name: "Feature staleness >1 hour", source: "Feature Store", time: "08:45", status: "active" },
      { id: "A-009", name: "Prediction confidence drop 12%", source: "Confidence Monitor", time: "09:00", status: "active" },
    ],
  },
  {
    rootCause: "Certificate Renewal Warning",
    severity: "low",
    alerts: [
      { id: "A-010", name: "TLS cert expires in 14 days", source: "Cert Manager", time: "00:00", status: "acknowledged" },
    ],
  },
];

const severityStyles: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  low: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

const statusStyles: Record<string, { color: string; bg: string }> = {
  active: { color: "text-red-400", bg: "bg-red-500/10" },
  acknowledged: { color: "text-amber-400", bg: "bg-amber-500/10" },
  resolved: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

export default function AlertCorrelation() {
  const [expanded, setExpanded] = useState<string[]>([ALERT_GROUPS[0].rootCause]);

  const toggleExpand = (rootCause: string) => {
    setExpanded(prev => prev.includes(rootCause) ? prev.filter(e => e !== rootCause) : [...prev, rootCause]);
  };

  const totalAlerts = ALERT_GROUPS.reduce((s, g) => s + g.alerts.length, 0);
  const activeAlerts = ALERT_GROUPS.reduce((s, g) => s + g.alerts.filter(a => a.status === "active").length, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <Link2 className="w-6 h-6 text-violet-400" />
          Alert Correlation Panel
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Related alerts grouped by root cause</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Alerts", value: totalAlerts, color: "text-white" },
          { label: "Active", value: activeAlerts, color: "text-red-400" },
          { label: "Root Causes", value: ALERT_GROUPS.length, color: "text-violet-400" },
          { label: "Resolved", value: ALERT_GROUPS.reduce((s, g) => s + g.alerts.filter(a => a.status === "resolved").length, 0), color: "text-emerald-400" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl border border-white/[0.06] backdrop-blur-md"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
            <p className={`text-2xl font-display font-bold ${m.color}`}>{m.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        {ALERT_GROUPS.map((group, gi) => {
          const sev = severityStyles[group.severity];
          const isExpanded = expanded.includes(group.rootCause);
          return (
            <motion.div
              key={group.rootCause}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06 }}
              className="rounded-xl border border-white/[0.06] overflow-hidden backdrop-blur-md"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
            >
              <button
                onClick={() => toggleExpand(group.rootCause)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <AlertTriangle className={`w-4 h-4 ${sev.color}`} />
                  <span className="text-sm font-medium text-white">{group.rootCause}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${sev.bg} ${sev.color} ${sev.border}`}>{group.severity.toUpperCase()}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{group.alerts.length} alerts</span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {group.alerts.map((alert, ai) => {
                        const st = statusStyles[alert.status];
                        return (
                          <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: ai * 0.03 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono text-muted-foreground">{alert.id}</span>
                              <span className="text-sm text-white">{alert.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-muted-foreground">{alert.source}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{alert.time}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${st.bg} ${st.color}`}>{alert.status}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
