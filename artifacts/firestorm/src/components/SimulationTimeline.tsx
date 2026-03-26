import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Shield, AlertTriangle, CheckCircle, Clock, Target } from "lucide-react";

interface AttackPhase {
  id: string;
  name: string;
  tactic: string;
  duration: string;
  status: "completed" | "running" | "pending";
  detected: boolean;
  detail: string;
  timestamp: string;
}

const samplePhases: AttackPhase[] = [
  { id: "p1", name: "Reconnaissance Scan", tactic: "Reconnaissance", duration: "2m 30s", status: "completed", detected: true, detail: "Network discovery via Nmap-style scanning on target subnet", timestamp: "14:32:00" },
  { id: "p2", name: "Spear Phishing Email", tactic: "Initial Access", duration: "1m 45s", status: "completed", detected: true, detail: "Crafted email with malicious attachment sent to target user", timestamp: "14:34:30" },
  { id: "p3", name: "Payload Execution", tactic: "Execution", duration: "0m 45s", status: "completed", detected: true, detail: "PowerShell-based dropper executed via macro in document", timestamp: "14:36:15" },
  { id: "p4", name: "Registry Persistence", tactic: "Persistence", duration: "0m 30s", status: "completed", detected: false, detail: "Run key added to HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", timestamp: "14:37:00" },
  { id: "p5", name: "Token Impersonation", tactic: "Privilege Escalation", duration: "1m 15s", status: "running", detected: false, detail: "Attempting to impersonate SYSTEM token via named pipe", timestamp: "14:37:30" },
  { id: "p6", name: "Credential Dumping", tactic: "Credential Access", duration: "2m 00s", status: "pending", detected: false, detail: "LSASS memory dump via MiniDumpWriteDump", timestamp: "—" },
  { id: "p7", name: "Lateral Movement", tactic: "Lateral Movement", duration: "3m 00s", status: "pending", detected: false, detail: "PSExec-style remote execution to secondary host", timestamp: "—" },
  { id: "p8", name: "Data Exfiltration", tactic: "Exfiltration", duration: "1m 30s", status: "pending", detected: false, detail: "Staged data exfiltrated over DNS tunneling", timestamp: "—" },
];

const statusIcon = {
  completed: CheckCircle,
  running: Zap,
  pending: Clock,
};

const statusColor = {
  completed: "text-emerald-400 border-emerald-500/30",
  running: "text-orange-400 border-orange-500/30",
  pending: "text-gray-500 border-white/10",
};

export default function SimulationTimeline() {
  const [selectedPhase, setSelectedPhase] = useState<AttackPhase | null>(null);
  const completedCount = samplePhases.filter(p => p.status === "completed").length;
  const detectedCount = samplePhases.filter(p => p.detected).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.03] to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-white tracking-wide uppercase">
              Attack Chain Timeline
            </h3>
            <p className="text-xs text-gray-500 mt-1">APT29 Simulation — Phase {completedCount}/{samplePhases.length}</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Shield className="w-3.5 h-3.5" /> {detectedCount} Detected
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" /> {completedCount - detectedCount} Missed
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/30 via-white/10 to-transparent" />

          <div className="space-y-1">
            {samplePhases.map((phase, i) => {
              const Icon = statusIcon[phase.status];
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedPhase(selectedPhase?.id === phase.id ? null : phase)}
                  className={`relative flex items-start gap-4 p-3 rounded-lg cursor-pointer transition-all group ${
                    selectedPhase?.id === phase.id ? "bg-white/[0.05] border border-white/10" : "hover:bg-white/[0.03] border border-transparent"
                  }`}
                >
                  <div className={`relative z-10 w-10 h-10 rounded-full border-2 ${statusColor[phase.status]} bg-[#0c0c0c] flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${phase.status === "running" ? "animate-pulse" : ""}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{phase.name}</span>
                        {phase.detected && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">DETECTED</span>
                        )}
                        {phase.status === "completed" && !phase.detected && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">MISSED</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 shrink-0">{phase.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-orange-400/70 uppercase tracking-wider">{phase.tactic}</span>
                      <span className="text-[10px] text-gray-600">·</span>
                      <span className="text-[10px] text-gray-500">{phase.duration}</span>
                    </div>
                    {selectedPhase?.id === phase.id && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-gray-400 mt-2 font-mono"
                      >
                        {phase.detail}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" /> Running</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-600" /> Pending</span>
          </div>
          <div className="text-[10px] font-mono text-gray-500">
            Detection Rate: <span className={`font-bold ${detectedCount / completedCount >= 0.75 ? "text-emerald-400" : "text-amber-400"}`}>
              {completedCount > 0 ? Math.round((detectedCount / completedCount) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
