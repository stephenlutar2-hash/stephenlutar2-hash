import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Scan, Activity, ChevronDown } from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "threat" | "incident" | "scan";
  title: string;
  timestamp: string;
  severity: string;
  detail: string;
  source?: string;
}

const timelineEvents: TimelineEvent[] = [
  { id: "t1", type: "threat", title: "DDoS Attack Detected", timestamp: "2026-03-25 14:32:00", severity: "critical", detail: "Volumetric attack at 45Gbps from botnet cluster targeting API gateway", source: "192.168.x.x (RU)" },
  { id: "t2", type: "incident", title: "Incident #IR-2847 Opened", timestamp: "2026-03-25 14:32:15", severity: "critical", detail: "Auto-created incident for DDoS mitigation workflow", source: "ROSIE Auto-Triage" },
  { id: "t3", type: "scan", title: "Emergency Scan Triggered", timestamp: "2026-03-25 14:33:00", severity: "high", detail: "Full perimeter scan initiated across all edge nodes" },
  { id: "t4", type: "threat", title: "SQL Injection Attempt", timestamp: "2026-03-25 14:28:00", severity: "high", detail: "Attempted payload on /api/users endpoint blocked by WAF Rule #4521", source: "203.0.113.x (CN)" },
  { id: "t5", type: "incident", title: "Brute Force Containment", timestamp: "2026-03-25 13:45:00", severity: "high", detail: "2,847 failed login attempts detected. IP range auto-banned.", source: "Auth Gateway" },
  { id: "t6", type: "scan", title: "Scheduled Vuln Scan Complete", timestamp: "2026-03-25 12:00:00", severity: "medium", detail: "Weekly vulnerability scan completed. 3 new findings (0 critical)." },
  { id: "t7", type: "threat", title: "Anomalous DNS Queries", timestamp: "2026-03-25 11:15:00", severity: "medium", detail: "Pattern matches known C2 beacon framework. Under investigation.", source: "DNS Monitor" },
  { id: "t8", type: "incident", title: "SSL Certificate Renewed", timestamp: "2026-03-25 09:00:00", severity: "low", detail: "Wildcard cert for *.szlholdings.com renewed. Expires in 365 days.", source: "CertBot" },
];

const typeIcons = {
  threat: Shield,
  incident: AlertTriangle,
  scan: Scan,
};

const typeColors = {
  threat: "border-red-500/30 bg-red-500/10",
  incident: "border-amber-500/30 bg-amber-500/10",
  scan: "border-cyan-500/30 bg-cyan-500/10",
};

const typeIconColors = {
  threat: "text-red-400",
  incident: "text-amber-400",
  scan: "text-cyan-400",
};

const sevColors: Record<string, string> = {
  critical: "text-red-400 bg-red-500/20 border-red-500/30",
  high: "text-orange-400 bg-orange-500/20 border-orange-500/30",
  medium: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
  low: "text-blue-400 bg-blue-500/20 border-blue-500/30",
};

export default function IncidentTimeline() {
  const [filter, setFilter] = useState<"all" | "threat" | "incident" | "scan">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === "all" ? timelineEvents : timelineEvents.filter(e => e.type === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-white tracking-wide uppercase">
              Incident Timeline Correlation
            </h3>
            <p className="text-xs text-gray-500 mt-1">Unified view of threats, incidents, and scans</p>
          </div>
          <Activity className="w-5 h-5 text-gray-500" />
        </div>

        <div className="flex gap-2 mb-4">
          {(["all", "threat", "incident", "scan"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                filter === f ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10"
              }`}
            >
              {f === "all" ? "All Events" : f + "s"}
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/20 via-white/10 to-transparent" />

          <AnimatePresence mode="popLayout">
            {filtered.map((event, i) => {
              const Icon = typeIcons[event.type];
              const expanded = expandedId === event.id;
              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setExpandedId(expanded ? null : event.id)}
                  className="relative flex items-start gap-4 py-2 cursor-pointer group"
                >
                  <div className={`relative z-10 w-10 h-10 rounded-full border ${typeColors[event.type]} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${typeIconColors[event.type]}`} />
                  </div>

                  <div className="flex-1 min-w-0 p-2 rounded-lg hover:bg-white/[0.03] transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors truncate">{event.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border shrink-0 ${sevColors[event.severity]}`}>
                          {event.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-gray-500">{event.timestamp.split(" ")[1]}</span>
                        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-gray-400 mt-2">{event.detail}</p>
                          {event.source && (
                            <p className="text-[10px] text-gray-500 mt-1 font-mono">Source: {event.source}</p>
                          )}
                          <p className="text-[10px] text-gray-600 mt-1">{event.timestamp}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
