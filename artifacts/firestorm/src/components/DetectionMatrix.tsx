import { motion } from "framer-motion";

const mitreTactics = [
  "Recon", "Initial Access", "Execution", "Persistence",
  "Priv Esc", "Defense Evasion", "Credential Access", "Discovery",
  "Lateral Mov", "Collection", "C2", "Exfiltration", "Impact"
];

interface ScenarioRow {
  name: string;
  coverage: number[];
}

const scenarios: ScenarioRow[] = [
  { name: "APT29 Cozy Bear", coverage: [1, 1, 1, 1, 0.5, 0.5, 1, 1, 0.5, 1, 1, 0.5, 0] },
  { name: "APT28 Fancy Bear", coverage: [1, 1, 1, 0.5, 1, 1, 1, 0.5, 1, 0.5, 1, 1, 1] },
  { name: "Ransomware Chain", coverage: [0, 1, 1, 1, 1, 0.5, 0, 0.5, 1, 1, 0.5, 0, 1] },
  { name: "Insider Threat", coverage: [0, 0, 0.5, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0.5] },
  { name: "Supply Chain", coverage: [1, 1, 0.5, 1, 0.5, 1, 0, 1, 0.5, 0.5, 1, 1, 0.5] },
  { name: "Phishing Campaign", coverage: [1, 1, 1, 0.5, 0, 0, 1, 0.5, 0, 0, 0.5, 0, 0] },
];

function getCellColor(val: number) {
  if (val >= 1) return "bg-emerald-500/70 border-emerald-500/40";
  if (val >= 0.5) return "bg-amber-500/50 border-amber-500/30";
  return "bg-white/[0.03] border-white/5";
}

function getCellText(val: number) {
  if (val >= 1) return "text-emerald-300";
  if (val >= 0.5) return "text-amber-300";
  return "text-gray-600";
}

export default function DetectionMatrix() {
  const totalCells = scenarios.length * mitreTactics.length;
  const coveredCells = scenarios.reduce((acc, s) => acc + s.coverage.filter(c => c >= 0.5).length, 0);
  const fullCoveredCells = scenarios.reduce((acc, s) => acc + s.coverage.filter(c => c >= 1).length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-white tracking-wide uppercase">
              Detection Coverage Matrix
            </h3>
            <p className="text-xs text-gray-500 mt-1">MITRE techniques tested per scenario</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-emerald-400">{fullCoveredCells} full</span>
            <span className="text-amber-400">{coveredCells - fullCoveredCells} partial</span>
            <span className="text-gray-500">{totalCells - coveredCells} none</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="text-left text-[9px] text-gray-500 uppercase tracking-wider px-2 py-1.5 w-36">Scenario</th>
                {mitreTactics.map(t => (
                  <th key={t} className="text-center text-[7px] text-gray-500 uppercase tracking-wider px-0.5 py-1.5" style={{ writingMode: "vertical-lr", transform: "rotate(180deg)", height: "60px" }}>
                    {t}
                  </th>
                ))}
                <th className="text-center text-[9px] text-gray-500 uppercase tracking-wider px-2 py-1.5 w-16">Score</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, si) => {
                const score = Math.round((s.coverage.reduce((a, b) => a + b, 0) / s.coverage.length) * 100);
                return (
                  <motion.tr
                    key={s.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: si * 0.05 }}
                    className="group"
                  >
                    <td className="text-xs text-gray-300 px-2 py-1 font-medium group-hover:text-orange-400 transition-colors">{s.name}</td>
                    {s.coverage.map((val, ci) => (
                      <td key={ci} className="px-0.5 py-0.5">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: si * 0.03 + ci * 0.02 }}
                          className={`w-full h-6 rounded-sm border ${getCellColor(val)} flex items-center justify-center`}
                        >
                          <span className={`text-[8px] font-bold ${getCellText(val)}`}>
                            {val >= 1 ? "●" : val >= 0.5 ? "◐" : "○"}
                          </span>
                        </motion.div>
                      </td>
                    ))}
                    <td className="text-center">
                      <span className={`text-xs font-bold font-mono ${score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400"}`}>
                        {score}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-4 mt-4 text-[10px] font-mono text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500/70" /> Full Coverage</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500/50" /> Partial</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-white/[0.03] border border-white/5" /> None</span>
        </div>
      </div>
    </motion.div>
  );
}
