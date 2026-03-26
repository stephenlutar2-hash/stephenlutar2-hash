import { useState } from "react";
import { motion } from "framer-motion";

const tactics = [
  "Reconnaissance", "Resource Dev", "Initial Access", "Execution",
  "Persistence", "Priv Escalation", "Defense Evasion", "Credential Access",
  "Discovery", "Lateral Movement", "Collection", "C2", "Exfiltration", "Impact"
];

const techniques: Record<string, { id: string; name: string; coverage: number }[]> = {
  "Reconnaissance": [
    { id: "T1595", name: "Active Scanning", coverage: 92 },
    { id: "T1592", name: "Gather Host Info", coverage: 78 },
    { id: "T1589", name: "Gather ID Info", coverage: 85 },
    { id: "T1590", name: "Gather Network Info", coverage: 88 },
  ],
  "Resource Dev": [
    { id: "T1583", name: "Acquire Infra", coverage: 45 },
    { id: "T1586", name: "Compromise Acct", coverage: 72 },
    { id: "T1584", name: "Compromise Infra", coverage: 38 },
  ],
  "Initial Access": [
    { id: "T1566", name: "Phishing", coverage: 95 },
    { id: "T1190", name: "Exploit Public App", coverage: 89 },
    { id: "T1078", name: "Valid Accounts", coverage: 91 },
    { id: "T1199", name: "Trusted Relationship", coverage: 67 },
  ],
  "Execution": [
    { id: "T1059", name: "Command/Script", coverage: 94 },
    { id: "T1203", name: "Exploit for Exec", coverage: 82 },
    { id: "T1204", name: "User Execution", coverage: 76 },
  ],
  "Persistence": [
    { id: "T1547", name: "Boot Autostart", coverage: 88 },
    { id: "T1053", name: "Scheduled Task", coverage: 91 },
    { id: "T1136", name: "Create Account", coverage: 96 },
    { id: "T1543", name: "System Services", coverage: 84 },
  ],
  "Priv Escalation": [
    { id: "T1548", name: "Abuse Elevation", coverage: 87 },
    { id: "T1134", name: "Token Manipulation", coverage: 73 },
    { id: "T1068", name: "Exploit for Priv", coverage: 69 },
  ],
  "Defense Evasion": [
    { id: "T1070", name: "Indicator Removal", coverage: 81 },
    { id: "T1036", name: "Masquerading", coverage: 74 },
    { id: "T1027", name: "Obfuscated Files", coverage: 68 },
    { id: "T1562", name: "Impair Defenses", coverage: 92 },
  ],
  "Credential Access": [
    { id: "T1110", name: "Brute Force", coverage: 97 },
    { id: "T1003", name: "OS Credential Dump", coverage: 85 },
    { id: "T1557", name: "Adversary-in-Middle", coverage: 79 },
  ],
  "Discovery": [
    { id: "T1087", name: "Account Discovery", coverage: 90 },
    { id: "T1046", name: "Network Scan", coverage: 93 },
    { id: "T1057", name: "Process Discovery", coverage: 71 },
  ],
  "Lateral Movement": [
    { id: "T1021", name: "Remote Services", coverage: 86 },
    { id: "T1570", name: "Lateral Tool Transfer", coverage: 62 },
    { id: "T1080", name: "Taint Shared Content", coverage: 55 },
  ],
  "Collection": [
    { id: "T1560", name: "Archive Data", coverage: 77 },
    { id: "T1005", name: "Data from Local", coverage: 83 },
    { id: "T1114", name: "Email Collection", coverage: 91 },
  ],
  "C2": [
    { id: "T1071", name: "App Layer Protocol", coverage: 88 },
    { id: "T1573", name: "Encrypted Channel", coverage: 72 },
    { id: "T1105", name: "Ingress Tool Transfer", coverage: 81 },
  ],
  "Exfiltration": [
    { id: "T1041", name: "Exfil Over C2", coverage: 86 },
    { id: "T1048", name: "Exfil Over Alt Protocol", coverage: 64 },
    { id: "T1567", name: "Exfil to Cloud", coverage: 58 },
  ],
  "Impact": [
    { id: "T1486", name: "Data Encrypted", coverage: 94 },
    { id: "T1489", name: "Service Stop", coverage: 89 },
    { id: "T1529", name: "System Shutdown", coverage: 91 },
  ],
};

function getCoverageColor(coverage: number): string {
  if (coverage >= 90) return "bg-emerald-500/80";
  if (coverage >= 75) return "bg-emerald-500/50";
  if (coverage >= 60) return "bg-amber-500/60";
  if (coverage >= 40) return "bg-orange-500/50";
  return "bg-red-500/50";
}

function getCoverageBorder(coverage: number): string {
  if (coverage >= 90) return "border-emerald-500/40";
  if (coverage >= 75) return "border-emerald-500/20";
  if (coverage >= 60) return "border-amber-500/30";
  if (coverage >= 40) return "border-orange-500/30";
  return "border-red-500/30";
}

export default function MitreHeatmap() {
  const [hoveredTechnique, setHoveredTechnique] = useState<{ id: string; name: string; coverage: number; tactic: string } | null>(null);

  const totalTechniques = Object.values(techniques).flat().length;
  const covered = Object.values(techniques).flat().filter(t => t.coverage >= 75).length;
  const avgCoverage = Math.round(Object.values(techniques).flat().reduce((a, t) => a + t.coverage, 0) / totalTechniques);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-white tracking-wide uppercase">
              MITRE ATT&CK Coverage
            </h3>
            <p className="text-xs text-gray-500 mt-1">Detection coverage across {totalTechniques} techniques</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-emerald-400">{avgCoverage}%</p>
              <p className="text-[10px] text-gray-500">{covered}/{totalTechniques} covered</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-14 gap-px">
              {tactics.map((tactic, ti) => (
                <div key={tactic} className="space-y-px">
                  <div className="text-[8px] font-mono text-gray-500 uppercase tracking-wider text-center py-1.5 truncate px-0.5" title={tactic}>
                    {tactic.length > 10 ? tactic.slice(0, 8) + "…" : tactic}
                  </div>
                  {(techniques[tactic] || []).map((tech, i) => (
                    <motion.div
                      key={tech.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: ti * 0.03 + i * 0.02 }}
                      onMouseEnter={() => setHoveredTechnique({ ...tech, tactic })}
                      onMouseLeave={() => setHoveredTechnique(null)}
                      className={`h-8 rounded-sm ${getCoverageColor(tech.coverage)} border ${getCoverageBorder(tech.coverage)} cursor-pointer transition-all hover:scale-110 hover:z-10 relative group`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[7px] font-mono text-white/80 font-bold">{tech.coverage}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {hoveredTechnique && (
          <div className="mt-3 p-3 rounded-lg bg-black/60 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400">{hoveredTechnique.id}</span>
                <span className="text-xs text-gray-400 ml-2">{hoveredTechnique.name}</span>
                <span className="text-[10px] text-gray-500 ml-2">({hoveredTechnique.tactic})</span>
              </div>
              <span className={`text-sm font-bold ${hoveredTechnique.coverage >= 75 ? "text-emerald-400" : hoveredTechnique.coverage >= 50 ? "text-amber-400" : "text-red-400"}`}>
                {hoveredTechnique.coverage}% coverage
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 text-[10px] font-mono">
          <span className="text-gray-500">Coverage:</span>
          {[
            { label: "90%+", color: "bg-emerald-500/80" },
            { label: "75-89%", color: "bg-emerald-500/50" },
            { label: "60-74%", color: "bg-amber-500/60" },
            { label: "40-59%", color: "bg-orange-500/50" },
            { label: "<40%", color: "bg-red-500/50" },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-sm ${l.color}`} />
              <span className="text-gray-500">{l.label}</span>
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
