import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { aegisFetch } from "@/lib/api";

interface Framework {
  id: number;
  name: string;
  score: number;
  controls: number;
  passing: number;
  color: string;
  lastAudit: string;
  status: string;
}

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
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    aegisFetch<{ frameworks: Framework[] }>("compliance-frameworks")
      .then(data => {
        setFrameworks(data.frameworks);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch compliance frameworks:", err);
        setError("Failed to load compliance data");
        setLoading(false);
      });
  }, []);

  const compliantCount = frameworks.filter(fw => fw.score >= 95).length;

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-64" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="w-20 h-20 rounded-full bg-white/5" />
                <div className="h-4 bg-white/5 rounded w-16 mt-3" />
                <div className="h-3 bg-white/5 rounded w-20 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

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
            <span className="text-emerald-400">{compliantCount}/{frameworks.length} Fully Compliant</span>
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
