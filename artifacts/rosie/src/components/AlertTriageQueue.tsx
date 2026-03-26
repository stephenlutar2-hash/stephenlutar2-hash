import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, ArrowUpRight, Clock, X, Eye } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  source: string;
  timestamp: string;
  status: "new" | "acknowledged" | "escalated" | "resolved";
  description: string;
  entity: string;
  entityType: "ip" | "user" | "asset";
}

const initialAlerts: Alert[] = [
  { id: "ALT-001", title: "Credential Dumping Detected", severity: "critical", source: "EDR Agent", timestamp: "14:32:00", status: "new", description: "LSASS memory access detected on endpoint WS-PROD-04", entity: "10.0.1.45", entityType: "ip" },
  { id: "ALT-002", title: "Suspicious Outbound Connection", severity: "critical", source: "Network Monitor", timestamp: "14:28:15", status: "new", description: "Connection to known C2 domain detected from internal host", entity: "jsmith", entityType: "user" },
  { id: "ALT-003", title: "Failed Login Spike", severity: "high", source: "Auth Gateway", timestamp: "14:15:00", status: "acknowledged", description: "847 failed login attempts in 5 minutes from single IP range", entity: "203.0.113.0/24", entityType: "ip" },
  { id: "ALT-004", title: "Privilege Escalation Attempt", severity: "high", source: "SIEM Correlation", timestamp: "13:58:00", status: "new", description: "User attempted sudo on production server without authorization", entity: "bwilson", entityType: "user" },
  { id: "ALT-005", title: "Malware Signature Match", severity: "high", source: "AV Engine", timestamp: "13:45:30", status: "escalated", description: "Known ransomware dropper detected in email attachment", entity: "mail-gw-01", entityType: "asset" },
  { id: "ALT-006", title: "Unusual Data Transfer", severity: "medium", source: "DLP Agent", timestamp: "13:30:00", status: "new", description: "Large file transfer to external cloud storage detected", entity: "agarcia", entityType: "user" },
  { id: "ALT-007", title: "Certificate Expiry Warning", severity: "low", source: "CertBot", timestamp: "12:00:00", status: "acknowledged", description: "TLS certificate for staging.szl.com expires in 14 days", entity: "staging-lb", entityType: "asset" },
];

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  high: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  low: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
};

const statusColors: Record<string, string> = {
  new: "bg-red-500/20 text-red-400 border-red-500/30",
  acknowledged: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  escalated: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function AlertTriageQueue({ onEntityClick }: { onEntityClick?: (entity: string, type: string) => void }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  function updateStatus(id: string, status: Alert["status"]) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  const filtered = filterStatus === "all" ? alerts : alerts.filter(a => a.status === filterStatus);
  const newCount = alerts.filter(a => a.status === "new").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.02] to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h3 className="font-display font-bold text-white tracking-wide uppercase">
              Alert Triage Queue
            </h3>
            {newCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                {newCount} NEW
              </span>
            )}
          </div>
          <AlertTriangle className="w-5 h-5 text-gray-500" />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {["all", "new", "acknowledged", "escalated", "resolved"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                filterStatus === s ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filtered.map((alert, i) => {
              const sev = severityColors[alert.severity];
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${sev.bg} ${sev.text} ${sev.border}`}>
                        {alert.severity}
                      </span>
                      <span className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">{alert.title}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border shrink-0 ${statusColors[alert.status]}`}>
                      {alert.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-2">{alert.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      <span className="font-mono">{alert.timestamp}</span>
                      <span>·</span>
                      <span>{alert.source}</span>
                      <span>·</span>
                      <button
                        onClick={() => onEntityClick?.(alert.entity, alert.entityType)}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
                      >
                        <Eye className="w-3 h-3" /> {alert.entity}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {alert.status === "new" && (
                        <button
                          onClick={() => updateStatus(alert.id, "acknowledged")}
                          className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition flex items-center gap-0.5"
                        >
                          <CheckCircle className="w-3 h-3" /> ACK
                        </button>
                      )}
                      {(alert.status === "new" || alert.status === "acknowledged") && (
                        <button
                          onClick={() => updateStatus(alert.id, "escalated")}
                          className="px-2 py-0.5 rounded text-[9px] font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30 transition flex items-center gap-0.5"
                        >
                          <ArrowUpRight className="w-3 h-3" /> ESC
                        </button>
                      )}
                      {alert.status !== "resolved" && (
                        <button
                          onClick={() => updateStatus(alert.id, "resolved")}
                          className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition flex items-center gap-0.5"
                        >
                          <X className="w-3 h-3" /> RESOLVE
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
