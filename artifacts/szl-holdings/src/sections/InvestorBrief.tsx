import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, BarChart3, Shield, Globe, DollarSign, Users,
  ArrowUp, ArrowDown, Brain, Activity, Sparkles, Calendar, RefreshCw
} from "lucide-react";

function generateMetrics() {
  const baseRevenue = 14.2;
  const jitter = () => (Math.random() - 0.5) * 0.4;
  return [
    { label: "Revenue (ARR)", value: `$${(baseRevenue + jitter()).toFixed(1)}M`, change: `+${(34 + Math.floor(Math.random() * 3 - 1))}%`, direction: "up" as const },
    { label: "Gross Margin", value: `${(82.4 + jitter()).toFixed(1)}%`, change: `+${(3.1 + Math.random() * 0.4 - 0.2).toFixed(1)}pp`, direction: "up" as const },
    { label: "Net Revenue Retention", value: `${Math.round(142 + Math.random() * 4 - 2)}%`, change: `+${Math.round(8 + Math.random() * 2)}%`, direction: "up" as const },
    { label: "Enterprise Clients", value: `${Math.round(47 + Math.random() * 3)}`, change: `+${Math.round(12 + Math.random() * 2)}`, direction: "up" as const },
    { label: "Monthly Burn", value: `$${Math.round(680 + Math.random() * 20 - 10)}K`, change: `-${Math.round(14 + Math.random() * 3)}%`, direction: "up" as const },
    { label: "Runway", value: `${Math.round(28 + Math.random() * 2)} months`, change: `+${Math.round(4 + Math.random() * 2)}mo`, direction: "up" as const },
  ];
}

function generatePortfolio() {
  const jitter = (base: number, range: number) => (base + (Math.random() - 0.5) * range).toFixed(1);
  return [
    { platform: "Vessels", revenue: `$${jitter(4.8, 0.3)}M`, growth: `+${Math.round(42 + Math.random() * 4 - 2)}%`, clients: Math.round(12 + Math.random() * 2), status: "Accelerating" },
    { platform: "Beacon", revenue: `$${jitter(2.9, 0.2)}M`, growth: `+${Math.round(28 + Math.random() * 3 - 1)}%`, clients: Math.round(8 + Math.random() * 2), status: "Steady Growth" },
    { platform: "INCA", revenue: `$${jitter(2.1, 0.2)}M`, growth: `+${Math.round(56 + Math.random() * 5 - 2)}%`, clients: Math.round(6 + Math.random() * 2), status: "Breakout" },
    { platform: "Rosie", revenue: `$${jitter(1.8, 0.15)}M`, growth: `+${Math.round(31 + Math.random() * 3)}%`, clients: Math.round(9 + Math.random() * 2), status: "Steady Growth" },
    { platform: "AlloyScape", revenue: `$${jitter(1.4, 0.15)}M`, growth: `+${Math.round(67 + Math.random() * 6 - 3)}%`, clients: Math.round(5 + Math.random() * 2), status: "Early Traction" },
    { platform: "Nimbus", revenue: `$${jitter(1.2, 0.1)}M`, growth: `+${Math.round(23 + Math.random() * 3)}%`, clients: Math.round(7 + Math.random() * 2), status: "Maturing" },
  ];
}

const investorNarrative = {
  summary: "SZL Holdings is executing a land-and-expand strategy across the maritime, security, and enterprise AI verticals. The ecosystem approach — where each platform cross-sells into the installed base — is driving 142% net revenue retention, significantly above the SaaS benchmark of 110-120%. Three platforms (Vessels, INCA, AlloyScape) are showing acceleration patterns consistent with product-market fit inflection.",
  keyHighlights: [
    "Maritime vertical (Vessels + Beacon) represents 54% of revenue with the strongest unit economics — LTV:CAC ratio of 8.2x",
    "AI platforms (INCA, AlloyScape, Nimbus) growing at 49% blended rate, outpacing overall portfolio growth",
    "Security suite (Rosie, Aegis, Firestorm) achieving 92% logo retention — highest in portfolio",
    "Cross-sell revenue now represents 34% of new ACV, up from 18% in 2025",
    "Platform consolidation strategy reducing infrastructure costs by $1.2M annually through shared services",
  ],
  risks: [
    "Customer concentration: Top 3 clients represent 28% of ARR — actively diversifying",
    "Maritime regulatory changes could accelerate or delay Vessels adoption cycles",
    "AI talent market remains competitive — 2 senior ML engineering positions open >90 days",
  ],
};

const statusColor = (s: string) => {
  if (s === "Accelerating" || s === "Breakout") return "text-emerald-400 bg-emerald-500/10";
  if (s === "Steady Growth" || s === "Maturing") return "text-cyan-400 bg-cyan-500/10";
  return "text-amber-400 bg-amber-500/10";
};

export default function InvestorBrief() {
  const [showRisks, setShowRisks] = useState(false);
  const [metrics, setMetrics] = useState(generateMetrics);
  const [portfolio, setPortfolio] = useState(generatePortfolio);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMetrics(generateMetrics());
      setPortfolio(generatePortfolio());
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 800);
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <section id="investor-brief" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-xs font-mono tracking-[0.3em] text-emerald-400/80 uppercase">Investor Intelligence</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 mb-4">
            <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">Portfolio Performance Brief</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">Live portfolio analytics with AI-generated strategic narrative — auto-refreshes every 30 seconds</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-[10px] font-mono text-gray-500">Last updated: {lastRefresh.toLocaleTimeString()}</span>
            <button onClick={refresh} disabled={isRefreshing} className="text-xs text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1 disabled:opacity-50">
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.05 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center hover:border-emerald-500/20 transition-colors">
              <p className="text-2xl font-display font-bold text-white mb-1">{m.value}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{m.label}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-mono ${m.direction === "up" ? "text-emerald-400" : "text-red-400"}`}>
                {m.direction === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {m.change}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/10 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="font-display font-bold text-white">AI-Generated Narrative</h3>
            <span className="text-[10px] font-mono text-gray-500 ml-auto">{lastRefresh.toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-5">{investorNarrative.summary}</p>
          <div className="space-y-2 mb-5">
            {investorNarrative.keyHighlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {h}
              </div>
            ))}
          </div>
          <button onClick={() => setShowRisks(!showRisks)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
            <Shield className="w-3 h-3" /> {showRisks ? "Hide" : "Show"} Risk Factors
          </button>
          {showRisks && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2">
              {investorNarrative.risks.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-amber-400/80">
                  <Shield className="w-3 h-3 shrink-0 mt-0.5" /> {r}
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Platform-Level Performance
          </h3>
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Platform</th>
                  <th className="px-5 py-3">Revenue (ARR)</th>
                  <th className="px-5 py-3">Growth</th>
                  <th className="px-5 py-3">Clients</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {portfolio.map(p => (
                  <tr key={p.platform} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold text-white">{p.platform}</td>
                    <td className="px-5 py-3 text-sm font-mono text-emerald-400">{p.revenue}</td>
                    <td className="px-5 py-3 text-sm font-mono text-cyan-400">{p.growth}</td>
                    <td className="px-5 py-3 text-sm text-gray-400">{p.clients}</td>
                    <td className="px-5 py-3"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusColor(p.status)}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
