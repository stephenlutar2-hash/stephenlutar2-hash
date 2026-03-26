import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Clock, Shield, Target, AlertTriangle } from "lucide-react";

interface SimResult {
  id: string;
  name: string;
  date: string;
  detectionRate: number;
  avgResponseTime: string;
  falsePositives: number;
  falseNegatives: number;
  techniques: number;
  techniquesDetected: number;
  score: number;
}

const simResults: SimResult[] = [
  { id: "sim-1", name: "APT29 Run #3", date: "2026-03-25", detectionRate: 87, avgResponseTime: "3.2 min", falsePositives: 2, falseNegatives: 1, techniques: 8, techniquesDetected: 7, score: 84 },
  { id: "sim-2", name: "APT29 Run #2", date: "2026-03-18", detectionRate: 72, avgResponseTime: "5.1 min", falsePositives: 5, falseNegatives: 3, techniques: 8, techniquesDetected: 6, score: 68 },
  { id: "sim-3", name: "APT29 Run #1", date: "2026-03-10", detectionRate: 64, avgResponseTime: "7.8 min", falsePositives: 8, falseNegatives: 4, techniques: 8, techniquesDetected: 5, score: 55 },
  { id: "sim-4", name: "Ransomware Run #2", date: "2026-03-22", detectionRate: 92, avgResponseTime: "2.1 min", falsePositives: 1, falseNegatives: 0, techniques: 6, techniquesDetected: 6, score: 95 },
];

function MetricBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-2 bg-white/5 rounded-full overflow-hidden w-full">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8 }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

export default function ScenarioComparison() {
  const [selected, setSelected] = useState<string[]>([simResults[0].id, simResults[1].id]);

  function toggle(id: string) {
    if (selected.includes(id)) {
      if (selected.length > 1) setSelected(selected.filter(s => s !== id));
    } else {
      if (selected.length < 3) setSelected([...selected, id]);
    }
  }

  const compared = simResults.filter(s => selected.includes(s.id));

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
              Scenario Comparison
            </h3>
            <p className="text-xs text-gray-500 mt-1">Compare simulation run results side-by-side</p>
          </div>
          <BarChart3 className="w-5 h-5 text-gray-500" />
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {simResults.map(s => (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all border ${
                selected.includes(s.id)
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className={`grid gap-4 ${compared.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {compared.map((sim, i) => (
            <motion.div
              key={sim.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-4"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{sim.name}</h4>
                <p className="text-[10px] text-gray-500 font-mono">{sim.date}</p>
              </div>

              <div className="text-center">
                <p className={`text-3xl font-display font-bold ${sim.score >= 80 ? "text-emerald-400" : sim.score >= 60 ? "text-amber-400" : "text-red-400"}`}>
                  {sim.score}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Overall Score</p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-500 flex items-center gap-1"><Shield className="w-3 h-3" /> Detection Rate</span>
                    <span className="text-emerald-400 font-mono">{sim.detectionRate}%</span>
                  </div>
                  <MetricBar value={sim.detectionRate} max={100} color="bg-emerald-500" />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Response Time</span>
                    <span className="text-cyan-400 font-mono">{sim.avgResponseTime}</span>
                  </div>
                  <MetricBar value={10 - parseFloat(sim.avgResponseTime)} max={10} color="bg-cyan-500" />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-500 flex items-center gap-1"><Target className="w-3 h-3" /> Techniques</span>
                    <span className="text-violet-400 font-mono">{sim.techniquesDetected}/{sim.techniques}</span>
                  </div>
                  <MetricBar value={sim.techniquesDetected} max={sim.techniques} color="bg-violet-500" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2 rounded-lg bg-white/[0.03] text-center">
                    <p className="text-sm font-bold text-amber-400">{sim.falsePositives}</p>
                    <p className="text-[9px] text-gray-500">False +</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.03] text-center">
                    <p className="text-sm font-bold text-red-400">{sim.falseNegatives}</p>
                    <p className="text-[9px] text-gray-500">False −</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
