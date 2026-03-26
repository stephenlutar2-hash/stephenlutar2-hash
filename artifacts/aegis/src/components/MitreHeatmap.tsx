import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { aegisFetch } from "@/lib/api";

interface MitreData {
  tactics: string[];
  techniques: Record<string, { id: string; name: string; coverage: number }[]>;
  stats: { totalTechniques: number; covered: number; avgCoverage: number };
}

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
  const [data, setData] = useState<MitreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredTechnique, setHoveredTechnique] = useState<{ id: string; name: string; coverage: number; tactic: string } | null>(null);

  useEffect(() => {
    aegisFetch<MitreData>("mitre-coverage")
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch MITRE coverage:", err);
        setError("Failed to load MITRE coverage data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-48" />
          <div className="grid grid-cols-14 gap-1">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-8 bg-white/5 rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
        <p className="text-red-400 text-sm">{error || "Failed to load data"}</p>
      </div>
    );
  }

  const { tactics, techniques, stats } = data;

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
            <p className="text-xs text-gray-500 mt-1">Detection coverage across {stats.totalTechniques} techniques</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-emerald-400">{stats.avgCoverage}%</p>
              <p className="text-[10px] text-gray-500">{stats.covered}/{stats.totalTechniques} covered</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-14 gap-px">
              {tactics.map((tactic, ti) => (
                <div key={tactic} className="space-y-px">
                  <div className="text-[8px] font-mono text-gray-500 uppercase tracking-wider text-center py-1.5 truncate px-0.5" title={tactic}>
                    {tactic.length > 10 ? tactic.slice(0, 8) + "\u2026" : tactic}
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
