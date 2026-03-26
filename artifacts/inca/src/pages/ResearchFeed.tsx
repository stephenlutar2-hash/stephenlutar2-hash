import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, FileText, FlaskConical, Globe, BookOpen, Filter,
  TrendingUp, Clock, Zap, Brain, ArrowRight, ExternalLink, Sparkles
} from "lucide-react";

const SOURCE_TYPES = ["all", "academic", "patent", "industry", "competitor"] as const;

const sourceConfig: Record<string, { icon: typeof FileText; color: string; label: string; bg: string }> = {
  academic: { icon: BookOpen, color: "text-violet", label: "Academic Paper", bg: "bg-violet/10 border-violet/20" },
  patent: { icon: FileText, color: "text-cyan", label: "Patent Filing", bg: "bg-cyan/10 border-cyan/20" },
  industry: { icon: Globe, color: "text-emerald", label: "Industry Report", bg: "bg-emerald/10 border-emerald/20" },
  competitor: { icon: FlaskConical, color: "text-amber-400", label: "Competitor Analysis", bg: "bg-amber-500/10 border-amber-500/20" },
};

const feedItems = [
  { id: 1, source: "academic", title: "Transformer-Based Anomaly Detection in Multi-Modal Time Series", authors: "Chen et al., MIT CSAIL", date: "2026-03-24", summary: "Novel architecture achieving 96.3% detection accuracy on industrial IoT datasets using cross-attention between sensor modalities. Outperforms prior SOTA by 4.2% on the WADI benchmark.", relevance: 94, trending: true, tags: ["anomaly-detection", "transformers", "time-series"] },
  { id: 2, source: "patent", title: "System and Method for Predictive Maritime Route Optimization", authors: "Maersk Digital — Patent App. US2026/0412893", date: "2026-03-22", summary: "Filed patent covering ML-driven route optimization incorporating real-time weather, port congestion, and fuel efficiency models. Claims priority on ensemble approach combining GNN + reinforcement learning.", relevance: 88, trending: false, tags: ["maritime", "route-optimization", "reinforcement-learning"] },
  { id: 3, source: "industry", title: "Q1 2026 Enterprise AI Adoption Report — Gartner", authors: "Gartner Research", date: "2026-03-20", summary: "67% of enterprises now deploying AI in production (up from 48% in 2025). Security and observability identified as top adoption accelerators. Multi-agent systems emerging as fastest-growing category.", relevance: 91, trending: true, tags: ["enterprise-ai", "market-trends", "multi-agent"] },
  { id: 4, source: "competitor", title: "Datadog Launches Real-Time Cost Attribution Engine", authors: "Competitive Intelligence", date: "2026-03-19", summary: "Datadog announced cost attribution capabilities that correlate infrastructure spend with business metrics in real-time. Direct overlap with Lyte cost efficiency module — evaluate feature parity.", relevance: 96, trending: true, tags: ["observability", "cost-optimization", "competitive"] },
  { id: 5, source: "academic", title: "Self-Healing Microservice Architectures: A Systematic Review", authors: "Patel & Rivera, Stanford", date: "2026-03-18", summary: "Comprehensive review of 127 papers on autonomous remediation in distributed systems. Key finding: event-driven architectures with circuit breaker patterns reduce MTTR by 73% compared to manual intervention.", relevance: 87, trending: false, tags: ["self-healing", "microservices", "reliability"] },
  { id: 6, source: "industry", title: "Maritime Decarbonization Technology Outlook 2026", authors: "DNV Maritime Advisory", date: "2026-03-17", summary: "CII ratings becoming primary driver for fleet modernization investment. AI-powered emissions monitoring projected to reduce compliance costs by 40%. Wind-assisted propulsion gaining commercial traction.", relevance: 82, trending: false, tags: ["maritime", "emissions", "decarbonization"] },
  { id: 7, source: "patent", title: "Behavioral Biometric Authentication Using Keystroke Dynamics", authors: "CrowdStrike — Patent App. US2026/0398214", date: "2026-03-15", summary: "Patent covering continuous authentication via keystroke pattern analysis combined with mouse movement profiling. Potential implications for Rosie and Aegis behavioral detection capabilities.", relevance: 79, trending: false, tags: ["security", "biometrics", "authentication"] },
  { id: 8, source: "competitor", title: "Palantir AIP Platform — New Agent Orchestration Features", authors: "Competitive Intelligence", date: "2026-03-14", summary: "Palantir's AIP now supports multi-agent orchestration with visual workflow builder. Pricing at $150K+/year enterprise tier. AlloyScape competitive positioning remains strong on integration depth.", relevance: 85, trending: true, tags: ["ai-platform", "orchestration", "competitive"] },
];

const trendSummary = {
  generated: new Date().toISOString(),
  keyThemes: [
    { theme: "Multi-Agent AI Systems", momentum: 92, direction: "up" as const },
    { theme: "Maritime Decarbonization Tech", momentum: 78, direction: "up" as const },
    { theme: "Cost-Aware Observability", momentum: 85, direction: "up" as const },
    { theme: "Self-Healing Architectures", momentum: 71, direction: "stable" as const },
  ],
  aiSummary: "This week's intelligence signals a strong convergence around multi-agent AI systems and cost-aware observability — both areas where SZL Holdings has significant competitive advantage through AlloyScape and Lyte. Maritime decarbonization continues to accelerate regulatory pressure, reinforcing Vessels' strategic positioning. Two competitor moves (Datadog cost attribution, Palantir agent orchestration) warrant immediate feature-gap analysis.",
};

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export default function ResearchFeed() {
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (sourceFilter === "all") return feedItems;
    return feedItems.filter(i => i.source === sourceFilter);
  }, [sourceFilter]);

  return (
    <motion.div {...pageTransition} className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Research Feed</h2>
          <p className="text-muted-foreground mt-1 text-sm">Multi-source intelligence synthesis with AI-generated trend detection</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
          <motion.div className="w-2 h-2 rounded-full bg-emerald" animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className="text-xs font-mono text-muted-foreground">LIVE FEED</span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-xl p-6 border border-violet/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-violet" />
          <h3 className="font-display font-bold text-white text-sm">AI-Synthesized Weekly Brief</h3>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">Generated {new Date(trendSummary.generated).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed mb-4">{trendSummary.aiSummary}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {trendSummary.keyThemes.map(t => (
            <div key={t.theme} className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="text-xs text-muted-foreground mb-1">{t.theme}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-violet to-cyan" initial={{ width: 0 }} animate={{ width: `${t.momentum}%` }} transition={{ delay: 0.5, duration: 0.8 }} />
                </div>
                <span className="text-xs font-mono text-white">{t.momentum}</span>
                {t.direction === "up" && <TrendingUp className="w-3 h-3 text-emerald" />}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {SOURCE_TYPES.map(s => (
          <button key={s} onClick={() => setSourceFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sourceFilter === s ? "bg-cyan/15 text-cyan border border-cyan/30" : "bg-white/[0.03] text-muted-foreground border border-white/5 hover:text-white"}`}>
            {s === "all" ? "All Sources" : sourceConfig[s].label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, idx) => {
            const cfg = sourceConfig[item.source];
            const Icon = cfg.icon;
            return (
              <motion.div key={item.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ delay: idx * 0.04 }} layout className="glass-panel rounded-xl p-5 hover:bg-white/[0.02] transition-all group">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${cfg.bg} border flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className="text-sm font-semibold text-white leading-snug">{item.title}</h4>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.trending && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            <Zap className="w-3 h-3" /> TRENDING
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-1.5 py-0.5 rounded border border-cyan/20">{item.relevance}% relevant</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{item.authors} · {new Date(item.date).toLocaleDateString()}</p>
                    <p className="text-sm text-foreground/70 leading-relaxed">{item.summary}</p>
                    <div className="flex items-center gap-2 mt-3">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-mono text-muted-foreground bg-white/[0.03] px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
