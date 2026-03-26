import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Shield, Anchor, Heart, Gauge, Fuel, Settings, ArrowUpDown } from "lucide-react";

const FLEET = [
  { name: "MV Atlantic Pioneer", hull: 92, engine: 88, safety: 95, navigation: 90, cargo: 87, emissions: 82, overallScore: 89, lastInspection: "2026-01-18", nextDry: "2027-03-01", ciiRating: "B" },
  { name: "MV Pacific Star", hull: 85, engine: 91, safety: 88, navigation: 93, cargo: 90, emissions: 78, overallScore: 88, lastInspection: "2026-02-10", nextDry: "2026-11-15", ciiRating: "A" },
  { name: "MV Nordic Spirit", hull: 78, engine: 82, safety: 91, navigation: 85, cargo: 80, emissions: 91, overallScore: 85, lastInspection: "2026-01-22", nextDry: "2027-06-01", ciiRating: "A" },
  { name: "MV Southern Cross", hull: 90, engine: 76, safety: 93, navigation: 88, cargo: 85, emissions: 74, overallScore: 84, lastInspection: "2025-12-05", nextDry: "2026-08-20", ciiRating: "C" },
  { name: "MV Eastern Wind", hull: 88, engine: 94, safety: 86, navigation: 92, cargo: 91, emissions: 88, overallScore: 90, lastInspection: "2026-03-01", nextDry: "2027-01-10", ciiRating: "A" },
  { name: "MV Gulf Trader", hull: 72, engine: 79, safety: 84, navigation: 81, cargo: 77, emissions: 69, overallScore: 77, lastInspection: "2025-11-20", nextDry: "2026-06-15", ciiRating: "D" },
];

function getScoreColor(score: number) {
  if (score >= 90) return "text-emerald-400";
  if (score >= 80) return "text-cyan-400";
  if (score >= 70) return "text-amber-400";
  return "text-red-400";
}

function getCIIColor(rating: string) {
  if (rating === "A") return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  if (rating === "B") return { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" };
  if (rating === "C") return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
}

type SortField = "overallScore" | "ciiRating" | "lastInspection" | "name";

const CII_ORDER: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, E: 0 };

export default function FleetHealthScorecard() {
  const [sortField, setSortField] = useState<SortField>("overallScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedFleet = useMemo(() => {
    return [...FLEET].sort((a, b) => {
      let cmp = 0;
      if (sortField === "overallScore") cmp = a.overallScore - b.overallScore;
      else if (sortField === "ciiRating") cmp = (CII_ORDER[a.ciiRating] ?? 0) - (CII_ORDER[b.ciiRating] ?? 0);
      else if (sortField === "lastInspection") cmp = a.lastInspection.localeCompare(b.lastInspection);
      else cmp = a.name.localeCompare(b.name);
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
            <Heart className="w-5 h-5 text-rose-400" />
            Fleet Health Scorecard
          </h2>
          <p className="text-sm text-gray-500 mt-1">Vessel-level KPIs in a sortable card grid</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider mr-1">Sort:</span>
          {([
            { field: "overallScore" as SortField, label: "Score" },
            { field: "ciiRating" as SortField, label: "CII" },
            { field: "lastInspection" as SortField, label: "Inspection" },
            { field: "name" as SortField, label: "Name" },
          ]).map(opt => (
            <button key={opt.field} onClick={() => toggleSort(opt.field)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${sortField === opt.field ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400" : "text-gray-500 hover:text-gray-300 border border-transparent"}`}>
              {opt.label}
              {sortField === opt.field && <ArrowUpDown className="w-2.5 h-2.5" />}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFleet.map((vessel, vi) => {
          const radarData = [
            { metric: "Hull", value: vessel.hull },
            { metric: "Engine", value: vessel.engine },
            { metric: "Safety", value: vessel.safety },
            { metric: "Nav", value: vessel.navigation },
            { metric: "Cargo", value: vessel.cargo },
            { metric: "Emissions", value: vessel.emissions },
          ];
          const cii = getCIIColor(vessel.ciiRating);
          return (
            <motion.div
              key={vessel.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: vi * 0.06 }}
              className="rounded-xl border border-white/[0.06] overflow-hidden backdrop-blur-md"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-display font-bold text-white">{vessel.name.replace("MV ", "")}</h3>
                    <span className={`text-[10px] font-mono ${cii.text} ${cii.bg} ${cii.border} border px-1.5 py-0.5 rounded mt-1 inline-block`}>CII: {vessel.ciiRating}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-display font-bold ${getScoreColor(vessel.overallScore)}`}>{vessel.overallScore}</span>
                    <p className="text-[9px] text-gray-500 uppercase">HEALTH</p>
                  </div>
                </div>
                <div className="h-36 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={9} />
                      <Radar dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { label: "Hull", value: vessel.hull },
                    { label: "Engine", value: vessel.engine },
                    { label: "Safety", value: vessel.safety },
                    { label: "Nav", value: vessel.navigation },
                    { label: "Cargo", value: vessel.cargo },
                    { label: "Emissions", value: vessel.emissions },
                  ].map(kpi => (
                    <div key={kpi.label} className="text-center">
                      <p className="text-[9px] text-gray-500 uppercase">{kpi.label}</p>
                      <p className={`text-xs font-mono font-bold ${getScoreColor(kpi.value)}`}>{kpi.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-5 py-3 border-t border-white/5 flex justify-between text-[10px] text-gray-500">
                <span>Inspected: {vessel.lastInspection}</span>
                <span>Dry dock: {vessel.nextDry}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
