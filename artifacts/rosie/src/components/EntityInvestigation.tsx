import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, User, Server, Clock, Shield, AlertTriangle, Activity } from "lucide-react";

interface EntityEvent {
  time: string;
  type: string;
  detail: string;
  severity: string;
}

interface EntityData {
  entity: string;
  entityType: string;
  riskScore: number;
  firstSeen: string;
  lastSeen: string;
  totalEvents: number;
  location?: string;
  events: EntityEvent[];
}

const entityDatabase: Record<string, EntityData> = {
  "10.0.1.45": {
    entity: "10.0.1.45",
    entityType: "ip",
    riskScore: 87,
    firstSeen: "2026-03-20 08:14:00",
    lastSeen: "2026-03-25 14:32:00",
    totalEvents: 24,
    location: "Internal — Prod Subnet",
    events: [
      { time: "14:32:00", type: "Credential Dump", detail: "LSASS memory access on WS-PROD-04", severity: "critical" },
      { time: "14:28:00", type: "Process Create", detail: "powershell.exe with encoded command", severity: "high" },
      { time: "14:15:00", type: "Network Scan", detail: "Port scan on 10.0.1.0/24 subnet", severity: "medium" },
      { time: "13:45:00", type: "File Write", detail: "Suspicious DLL dropped to temp directory", severity: "high" },
    ],
  },
  "jsmith": {
    entity: "jsmith",
    entityType: "user",
    riskScore: 72,
    firstSeen: "2025-01-15 09:00:00",
    lastSeen: "2026-03-25 14:28:15",
    totalEvents: 156,
    events: [
      { time: "14:28:15", type: "Outbound C2", detail: "Connection to known malicious domain", severity: "critical" },
      { time: "14:20:00", type: "Auth Event", detail: "Login from unusual location", severity: "medium" },
      { time: "13:55:00", type: "Data Access", detail: "Accessed 47 sensitive files in 3 minutes", severity: "high" },
      { time: "13:30:00", type: "Privilege Use", detail: "Elevated permissions on prod DB", severity: "medium" },
    ],
  },
  "203.0.113.0/24": {
    entity: "203.0.113.0/24",
    entityType: "ip",
    riskScore: 95,
    firstSeen: "2026-03-25 14:10:00",
    lastSeen: "2026-03-25 14:15:00",
    totalEvents: 847,
    location: "External — CN ASN-4134",
    events: [
      { time: "14:15:00", type: "Brute Force", detail: "847 failed SSH login attempts", severity: "critical" },
      { time: "14:12:00", type: "Scan", detail: "Port enumeration across /24 range", severity: "high" },
      { time: "14:10:00", type: "DNS Query", detail: "Reverse DNS lookup on target range", severity: "low" },
    ],
  },
  "bwilson": {
    entity: "bwilson",
    entityType: "user",
    riskScore: 58,
    firstSeen: "2025-06-01 09:00:00",
    lastSeen: "2026-03-25 13:58:00",
    totalEvents: 89,
    events: [
      { time: "13:58:00", type: "Priv Escalation", detail: "Unauthorized sudo attempt on prod server", severity: "high" },
      { time: "13:50:00", type: "Auth Event", detail: "Login from new device", severity: "medium" },
      { time: "12:30:00", type: "File Access", detail: "Downloaded config files from repo", severity: "low" },
    ],
  },
  "mail-gw-01": {
    entity: "mail-gw-01",
    entityType: "asset",
    riskScore: 65,
    firstSeen: "2024-03-01 00:00:00",
    lastSeen: "2026-03-25 13:45:30",
    totalEvents: 312,
    events: [
      { time: "13:45:30", type: "Malware", detail: "Ransomware dropper detected in attachment", severity: "high" },
      { time: "12:00:00", type: "Scan Complete", detail: "AV signature update applied", severity: "low" },
      { time: "11:30:00", type: "Config Change", detail: "SPF record updated", severity: "low" },
    ],
  },
  "agarcia": {
    entity: "agarcia",
    entityType: "user",
    riskScore: 42,
    firstSeen: "2025-09-15 09:00:00",
    lastSeen: "2026-03-25 13:30:00",
    totalEvents: 45,
    events: [
      { time: "13:30:00", type: "Data Exfil", detail: "Large upload to external cloud storage", severity: "medium" },
      { time: "13:15:00", type: "File Access", detail: "Accessed financial reports folder", severity: "low" },
    ],
  },
  "staging-lb": {
    entity: "staging-lb",
    entityType: "asset",
    riskScore: 15,
    firstSeen: "2025-01-01 00:00:00",
    lastSeen: "2026-03-25 12:00:00",
    totalEvents: 12,
    events: [
      { time: "12:00:00", type: "Certificate", detail: "TLS cert expires in 14 days", severity: "low" },
    ],
  },
};

const typeIcons = {
  ip: Globe,
  user: User,
  asset: Server,
};

const sevColors: Record<string, string> = {
  critical: "text-red-400",
  high: "text-orange-400",
  medium: "text-yellow-400",
  low: "text-blue-400",
};

export default function EntityInvestigation({ entity, entityType, onClose }: { entity: string | null; entityType: string; onClose: () => void }) {
  if (!entity) return null;

  const data = entityDatabase[entity];
  if (!data) return null;

  const Icon = typeIcons[entityType as keyof typeof typeIcons] || Globe;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="p-5 rounded-2xl border border-cyan-500/20 bg-[#0a0f14]/95 backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.05] to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Entity Investigation</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{entityType}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 mb-4">
            <p className="font-mono text-cyan-400 text-sm font-bold">{data.entity}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
              <div>
                <span className="text-gray-500">Risk Score</span>
                <p className={`font-bold ${data.riskScore >= 80 ? "text-red-400" : data.riskScore >= 50 ? "text-amber-400" : "text-emerald-400"}`}>
                  {data.riskScore}/100
                </p>
              </div>
              <div>
                <span className="text-gray-500">Total Events</span>
                <p className="text-white font-bold">{data.totalEvents}</p>
              </div>
              <div>
                <span className="text-gray-500">First Seen</span>
                <p className="text-gray-300 font-mono">{data.firstSeen.split(" ")[0]}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Seen</span>
                <p className="text-gray-300 font-mono">{data.lastSeen.split(" ")[1]}</p>
              </div>
              {data.location && (
                <div className="col-span-2">
                  <span className="text-gray-500">Location</span>
                  <p className="text-gray-300">{data.location}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-gray-500" />
            <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Related Events</h4>
          </div>

          <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
            {data.events.map((evt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <Clock className="w-3 h-3 text-gray-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-gray-500">{evt.time}</span>
                    <span className={`text-[10px] font-bold ${sevColors[evt.severity]}`}>{evt.type}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{evt.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.riskScore}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${data.riskScore >= 80 ? "bg-red-500" : data.riskScore >= 50 ? "bg-amber-500" : "bg-emerald-500"}`}
            />
          </div>
          <div className="flex justify-between text-[9px] text-gray-500 mt-1">
            <span>Low Risk</span>
            <span>High Risk</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
