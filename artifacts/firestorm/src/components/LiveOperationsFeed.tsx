import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, Globe, Activity, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Operation {
  id: string;
  time: string;
  type: string;
  target: string;
  priority: "CRITICAL" | "HIGH" | "STANDARD";
  status: string;
}

const OP_TYPES = ["Recon Sweep", "Vulnerability Scan", "Penetration Test", "Exploit Validation", "Network Probe", "Credential Audit"];
const TARGETS = ["External Perimeter (US-East)", "Cloud Endpoint (EU-West)", "API Gateway (AP-South)", "DMZ Segment (US-West)", "Partner Network (EMEA)", "Legacy System (Internal)"];

export function LiveOperationsFeed() {
  const [operations, setOperations] = useState<Operation[]>([]);

  useEffect(() => {
    const initial: Operation[] = Array.from({ length: 6 }).map((_, i) => createRandomOp(i));
    setOperations(initial);

    const interval = setInterval(() => {
      setOperations(prev => {
        const newOp = createRandomOp(Date.now());
        return [newOp, ...prev.slice(0, 5)];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  function createRandomOp(id: string | number): Operation {
    const priorities: ("CRITICAL" | "HIGH" | "STANDARD")[] = ["CRITICAL", "HIGH", "STANDARD", "HIGH"];
    const statuses = ["EXECUTING", "COMPLETE", "COMPLETE", "COMPLETE"];
    const now = new Date();
    return {
      id: `op-${id}`,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().substring(0,2)}`,
      type: OP_TYPES[Math.floor(Math.random() * OP_TYPES.length)],
      target: TARGETS[Math.floor(Math.random() * TARGETS.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
  }

  return (
    <div className="w-full glass-panel rounded-xl overflow-hidden border border-primary/20">
      <div className="bg-background/80 border-b border-primary/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </div>
          <h3 className="font-display font-semibold tracking-widest text-sm text-muted-foreground">LIVE OPERATIONS FEED</h3>
        </div>
        <div className="text-xs text-primary font-mono bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          OFFENSIVE OPS ACTIVE
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium">Operation</th>
              <th className="px-6 py-4 font-medium">Target Zone</th>
              <th className="px-6 py-4 font-medium">Priority</th>
              <th className="px-6 py-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 font-mono">
            <AnimatePresence initial={false}>
              {operations.map((op) => (
                <motion.tr
                  key={op.id}
                  initial={{ opacity: 0, y: -20, backgroundColor: "hsl(15 90% 50% / 0.15)" }}
                  animate={{ opacity: 1, y: 0, backgroundColor: "transparent" }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 text-muted-foreground">{op.time}</td>
                  <td className="px-6 py-4 text-foreground flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-primary" />
                    {op.type}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 opacity-50" />
                      {op.target}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-bold tracking-wider",
                      op.priority === "CRITICAL" ? "bg-red-500/20 text-red-500 border border-red-500/30" :
                      op.priority === "HIGH" ? "bg-orange-500/20 text-orange-500 border border-orange-500/30" :
                      "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                    )}>
                      {op.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded border",
                      op.status === "EXECUTING"
                        ? "text-orange-400 bg-orange-400/10 border-orange-400/20"
                        : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                    )}>
                      {op.status === "EXECUTING" ? <Activity className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      {op.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
