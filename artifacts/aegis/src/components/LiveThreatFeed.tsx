import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@szl-holdings/ui";
import { aegisFetch } from "@/lib/api";

interface Threat {
  id: string;
  time: string;
  type: string;
  origin: string;
  severity: "CRITICAL" | "HIGH" | "ELEVATED";
  status: string;
}

const THREAT_TYPES = ["DDoS Attack", "SQL Injection", "Brute Force", "Zero-Day Exploit", "Malware Payload", "Cross-Site Scripting"];
const ORIGINS = ["192.168.x.x (RU)", "10.0.x.x (CN)", "172.16.x.x (IR)", "Unknown Proxy", "Botnet Node (KP)", "Compromised Server (BR)"];

function createRandomThreat(id: string | number): Threat {
  const severities: ("CRITICAL" | "HIGH" | "ELEVATED")[] = ["CRITICAL", "HIGH", "ELEVATED", "HIGH"];
  const now = new Date();
  return {
    id: `thr-${id}`,
    time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().substring(0,2)}`,
    type: THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)],
    origin: ORIGINS[Math.floor(Math.random() * ORIGINS.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    status: "BLOCKED"
  };
}

export function LiveThreatFeed() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    aegisFetch<{ threats: Threat[] }>("threat-feed")
      .then(data => {
        setThreats(data.threats);
        setLoading(false);
        interval = setInterval(() => {
          aegisFetch<{ threats: Threat[] }>("threat-feed")
            .then(d => setThreats(d.threats))
            .catch(() => {});
        }, 15000);
      })
      .catch(() => {
        const initial: Threat[] = Array.from({ length: 6 }).map((_, i) => createRandomThreat(i));
        setThreats(initial);
        setIsSimulated(true);
        setLoading(false);
        interval = setInterval(() => {
          setThreats(prev => {
            const newThreat = createRandomThreat(Date.now());
            return [newThreat, ...prev.slice(0, 5)];
          });
        }, 3500);
      });

    return () => { if (interval) clearInterval(interval); };
  }, []);

  return (
    <div className="w-full glass-panel rounded-xl overflow-hidden border border-primary/20">
      <div className="bg-background/80 border-b border-primary/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </div>
          <h3 className="font-display font-semibold tracking-widest text-sm text-muted-foreground">
            {isSimulated ? "SIMULATED THREAT TELEMETRY" : "THREAT TELEMETRY"}
          </h3>
        </div>
        <div className={cn(
          "text-xs font-mono px-3 py-1 rounded-full border",
          isSimulated
            ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
            : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        )}>
          {isSimulated ? "DEMO DATA" : "LIVE"}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium">Threat Vector</th>
              <th className="px-6 py-4 font-medium">Origin Node</th>
              <th className="px-6 py-4 font-medium">Severity</th>
              <th className="px-6 py-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 font-mono">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-20" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-28" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-24" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-16" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 bg-white/5 rounded w-16 ml-auto" /></td>
                </tr>
              ))
            ) : threats.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No threats detected. Telemetry feed idle.</p>
                </td>
              </tr>
            ) : (
            <AnimatePresence initial={false}>
              {threats.map((threat) => (
                <motion.tr
                  key={threat.id}
                  initial={{ opacity: 0, y: -20, backgroundColor: "hsl(var(--destructive)/0.2)" }}
                  animate={{ opacity: 1, y: 0, backgroundColor: "transparent" }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 text-muted-foreground">{threat.time}</td>
                  <td className="px-6 py-4 text-foreground flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-destructive" />
                    {threat.type}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 opacity-50" />
                    {threat.origin}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-bold tracking-wider",
                      threat.severity === "CRITICAL" ? "bg-destructive/20 text-destructive border border-destructive/30" :
                      threat.severity === "HIGH" ? "bg-orange-500/20 text-orange-500 border border-orange-500/30" :
                      "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                    )}>
                      {threat.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded border border-emerald-400/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {threat.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
