import { useState } from "react";
import { motion } from "framer-motion";
import {
  Newspaper, Shield, CloudRain, Anchor, DollarSign, AlertTriangle,
  TrendingUp, Clock, Sparkles, FileText, Globe
} from "lucide-react";

const intelCategories = ["all", "regulatory", "port", "weather", "market"] as const;

const categoryConfig: Record<string, { icon: typeof Shield; color: string; label: string }> = {
  regulatory: { icon: Shield, color: "text-red-400", label: "Regulatory Update" },
  port: { icon: Anchor, color: "text-cyan-400", label: "Port Condition" },
  weather: { icon: CloudRain, color: "text-blue-400", label: "Weather Alert" },
  market: { icon: DollarSign, color: "text-emerald-400", label: "Market Rate" },
};

const intelItems = [
  { id: 1, category: "regulatory", title: "IMO MEPC 83 — New CII Rating Thresholds Effective Q3 2026", date: "2026-03-25", severity: "high", summary: "The Maritime Environment Protection Committee has tightened CII thresholds by 2% across all vessel categories. Ships rated D or E will face mandatory operational improvement plans. Fleet-wide impact assessment shows 3 vessels requiring immediate speed reduction protocols." },
  { id: 2, category: "port", title: "Port of Rotterdam — Berth Congestion Alert (72h Forecast)", date: "2026-03-25", severity: "medium", summary: "Terminal congestion expected at Europort and Maasvlakte 2 from March 27-29. Average berth waiting time projected at 18 hours (normal: 6h). Recommend diverting MV Pacific Horizon to Antwerp alternative berth." },
  { id: 3, category: "weather", title: "Tropical Storm Warning — South China Sea (Cat. 2 Developing)", date: "2026-03-24", severity: "high", summary: "Tropical depression strengthening to Category 2 storm expected by March 27. Affected zone: 15°N-22°N, 112°E-120°E. Three fleet vessels currently in projected path. Route deviation recommendations generated for MV Coral Seas and MV Jade Venture." },
  { id: 4, category: "market", title: "Capesize TCE Rates Surge to $28,400/day — 18-Month High", date: "2026-03-24", severity: "low", summary: "Capesize time charter equivalent rates reached $28,400/day driven by Brazilian iron ore export surge and Australian coal demand. Panamax rates stable at $14,200/day. Handymax showing early signs of uptick at $12,800/day. Favorable conditions for spot market positioning." },
  { id: 5, category: "regulatory", title: "EU ETS Maritime — Phase 2 Carbon Credit Pricing at €92/tonne", date: "2026-03-23", severity: "medium", summary: "EU Emissions Trading System carbon credit prices have reached €92/tonne, up 15% from Q4 2025. Fleet carbon exposure estimated at €2.4M annually under current operational profile. Recommend accelerating slow-steaming protocols on EU routes." },
  { id: 6, category: "port", title: "Singapore MPA — New Digital Port Clearance System Go-Live", date: "2026-03-22", severity: "low", summary: "Maritime Port Authority of Singapore launching new digital port clearance system effective April 1. All vessel arrivals must submit e-documentation 48 hours prior to ETA. System integration with fleet management platform completed — no action required." },
  { id: 7, category: "market", title: "Bunker Fuel Prices — VLSFO Singapore Down 4.2% This Week", date: "2026-03-22", severity: "low", summary: "VLSFO prices at Singapore hub trading at $582/mt, down from $607/mt last week. Rotterdam VLSFO at $568/mt. LNG bunker prices stable at $14.2/mmBtu. Current hedging positions remain favorable against market." },
];

const dailySummary = {
  generated: "2026-03-25T08:00:00Z",
  headline: "Fleet operations nominally healthy. Two weather-related route deviations recommended. Regulatory pressure increasing on CII compliance — 3 vessels flagged for Q3 threshold changes.",
  riskLevel: "Moderate",
  actionItems: [
    "Initiate route deviation planning for MV Coral Seas and MV Jade Venture (tropical storm avoidance)",
    "Review CII improvement plans for 3 flagged vessels before Q3 deadline",
    "Evaluate Capesize spot market opportunities — favorable rate environment for fleet positioning",
    "Complete EU ETS Phase 2 carbon exposure analysis and update hedging strategy",
  ],
};

export default function MaritimeIntel() {
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? intelItems : intelItems.filter(i => i.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Intelligence Aggregation & Analysis</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Maritime Intel</h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 bg-white/[0.03] px-3 py-1.5 rounded border border-white/5">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          AI-SYNTHESIZED BRIEFING
        </div>
      </div>

      <div className="bg-white/[0.02] border border-cyan-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display font-semibold text-sm text-white">Daily Intelligence Summary</h3>
          <span className="text-[10px] font-mono text-gray-500 ml-auto">{new Date(dailySummary.generated).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${dailySummary.riskLevel === "Low" ? "bg-emerald-500/15 text-emerald-400" : dailySummary.riskLevel === "Moderate" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>
            Risk: {dailySummary.riskLevel}
          </span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed mb-4">{dailySummary.headline}</p>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Priority Actions</p>
          <ul className="space-y-1.5">
            {dailySummary.actionItems.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="w-5 h-5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(["all", ...Object.keys(categoryConfig)] as const).map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === c ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "bg-white/[0.03] text-gray-500 border border-white/5 hover:text-white"}`}>
            {c === "all" ? "All Intel" : categoryConfig[c].label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item, idx) => {
          const cfg = categoryConfig[item.category];
          const Icon = cfg.icon;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.03] transition-all">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h4 className="text-sm font-semibold text-white leading-snug">{item.title}</h4>
                    <span className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${item.severity === "high" ? "bg-red-500/15 text-red-400" : item.severity === "medium" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{cfg.label} · {new Date(item.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{item.summary}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
