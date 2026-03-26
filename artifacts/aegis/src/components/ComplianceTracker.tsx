import { motion } from "framer-motion";

const frameworks = [
  {
    name: "ISO 27001",
    score: 100,
    controls: 114,
    passing: 114,
    color: "#10b981",
    lastAudit: "2026-02-15",
    status: "Certified",
  },
  {
    name: "SOC 2 Type II",
    score: 98,
    controls: 64,
    passing: 63,
    color: "#06b6d4",
    lastAudit: "2026-01-28",
    status: "Compliant",
  },
  {
    name: "NIST CSF",
    score: 94,
    controls: 108,
    passing: 102,
    color: "#8b5cf6",
    lastAudit: "2026-03-01",
    status: "In Progress",
  },
  {
    name: "PCI DSS",
    score: 100,
    controls: 78,
    passing: 78,
    color: "#f59e0b",
    lastAudit: "2025-12-10",
    status: "Certified",
  },
  {
    name: "HIPAA",
    score: 95,
    controls: 54,
    passing: 51,
    color: "#ec4899",
    lastAudit: "2026-02-20",
    status: "Compliant",
  },
  {
    name: "GDPR",
    score: 97,
    controls: 42,
    passing: 41,
    color: "#3b82f6",
    lastAudit: "2026-03-10",
    status: "Compliant",
  },
];

function ProgressRing({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-display font-bold text-white">{score}</span>
        <span className="text-[8px] text-gray-500">%</span>
      </div>
    </div>
  );
}

export default function ComplianceTracker() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-white tracking-wide uppercase">
              Compliance Framework Tracker
            </h3>
            <p className="text-xs text-gray-500 mt-1">Real-time compliance status across {frameworks.length} frameworks</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-400">5/6 Fully Compliant</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {frameworks.map((fw, i) => (
            <motion.div
              key={fw.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all group cursor-pointer"
            >
              <ProgressRing score={fw.score} color={fw.color} />
              <p className="text-xs font-bold text-white mt-3 text-center group-hover:text-cyan-400 transition-colors">{fw.name}</p>
              <p className="text-[10px] text-gray-500 mt-1">{fw.passing}/{fw.controls} controls</p>
              <span
                className="mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border"
                style={{
                  color: fw.color,
                  backgroundColor: `${fw.color}15`,
                  borderColor: `${fw.color}30`,
                }}
              >
                {fw.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
