import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Radar, TrendingUp, Zap, Eye, Filter } from "lucide-react";

interface ResearchTheme {
  id: number;
  name: string;
  category: string;
  momentum: number;
  relevance: number;
  papers: number;
  trend: "rising" | "stable" | "declining";
  description: string;
}

const themes: ResearchTheme[] = [
  { id: 1, name: "Multi-Agent Orchestration", category: "AI", momentum: 95, relevance: 98, papers: 47, trend: "rising", description: "Frameworks for coordinating multiple specialized AI agents on complex enterprise workflows" },
  { id: 2, name: "Self-Healing Systems", category: "Infrastructure", momentum: 82, relevance: 91, papers: 34, trend: "rising", description: "Autonomous detection and remediation of system failures without human intervention" },
  { id: 3, name: "Maritime Decarbonization", category: "Maritime", momentum: 78, relevance: 86, papers: 28, trend: "rising", description: "ML-driven emissions monitoring and CII compliance optimization for commercial fleets" },
  { id: 4, name: "Behavioral Biometrics", category: "Security", momentum: 71, relevance: 84, papers: 22, trend: "stable", description: "Continuous authentication through keystroke dynamics, mouse patterns, and device interaction" },
  { id: 5, name: "Cost-Aware Observability", category: "Infrastructure", momentum: 88, relevance: 93, papers: 31, trend: "rising", description: "Observability platforms that correlate infrastructure costs with business outcomes in real-time" },
  { id: 6, name: "Transformer Anomaly Detection", category: "AI", momentum: 84, relevance: 89, papers: 39, trend: "rising", description: "Attention-based architectures for detecting anomalies in multi-modal time series data" },
  { id: 7, name: "Prompt Engineering Science", category: "AI", momentum: 67, relevance: 76, papers: 18, trend: "stable", description: "Systematic approaches to prompt optimization including A/B testing and quality scoring" },
  { id: 8, name: "Predictive Maintenance", category: "Maritime", momentum: 73, relevance: 81, papers: 25, trend: "stable", description: "ML models predicting equipment failure windows with confidence intervals for proactive scheduling" },
  { id: 9, name: "Zero-Trust Architecture", category: "Security", momentum: 69, relevance: 88, papers: 32, trend: "stable", description: "Network security paradigm eliminating implicit trust with continuous verification" },
  { id: 10, name: "Federated Learning", category: "AI", momentum: 62, relevance: 72, papers: 21, trend: "declining", description: "Privacy-preserving ML training across distributed datasets without centralized data collection" },
  { id: 11, name: "Digital Twin Simulation", category: "Infrastructure", momentum: 76, relevance: 79, papers: 19, trend: "rising", description: "Virtual replicas of physical systems for testing, prediction, and optimization" },
  { id: 12, name: "Narrative AI", category: "Creative", momentum: 58, relevance: 68, papers: 14, trend: "stable", description: "AI systems for generating and analyzing story structures, character arcs, and thematic coherence" },
];

const categories = ["All", "AI", "Security", "Infrastructure", "Maritime", "Creative"];

const categoryColors: Record<string, { dot: string; text: string; bg: string }> = {
  AI: { dot: "bg-violet", text: "text-violet", bg: "bg-violet/10" },
  Security: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-400/10" },
  Infrastructure: { dot: "bg-cyan", text: "text-cyan", bg: "bg-cyan/10" },
  Maritime: { dot: "bg-emerald", text: "text-emerald", bg: "bg-emerald/10" },
  Creative: { dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-400/10" },
};

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export default function DiscoveryRadar() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredTheme, setHoveredTheme] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return themes;
    return themes.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => b.momentum - a.momentum), [filtered]);

  return (
    <motion.div {...pageTransition} className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Discovery Radar</h2>
          <p className="text-muted-foreground mt-1 text-sm">Emerging research themes, their momentum, and relevance to active projects</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
          <Radar className="w-4 h-4 text-cyan" />
          <span className="text-xs font-mono text-muted-foreground">{themes.length} THEMES TRACKED</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {categories.map(c => (
          <button key={c} onClick={() => setSelectedCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === c ? "bg-cyan/15 text-cyan border border-cyan/30" : "bg-white/[0.03] text-muted-foreground border border-white/5 hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-xl p-6">
        <h3 className="font-display font-bold text-white text-sm mb-6 flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan" /> Radar Visualization
        </h3>
        <div className="relative h-[400px] flex items-center justify-center">
          {[100, 75, 50, 25].map(r => (
            <div key={r} className="absolute rounded-full border border-white/5" style={{ width: `${r * 3.5}px`, height: `${r * 3.5}px` }} />
          ))}
          <div className="absolute w-px h-full bg-white/5" />
          <div className="absolute w-full h-px bg-white/5" />

          {sorted.map((theme, i) => {
            const angle = (i / sorted.length) * 2 * Math.PI - Math.PI / 2;
            const distance = ((100 - theme.relevance) / 100) * 150 + 20;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const size = Math.max(24, (theme.momentum / 100) * 56);
            const colors = categoryColors[theme.category] || categoryColors.AI;
            const isHovered = hoveredTheme === theme.id;

            return (
              <motion.div
                key={theme.id}
                className="absolute cursor-pointer"
                style={{ left: `calc(50% + ${x}px - ${size / 2}px)`, top: `calc(50% + ${y}px - ${size / 2}px)` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.05, type: "spring" }}
                onMouseEnter={() => setHoveredTheme(theme.id)}
                onMouseLeave={() => setHoveredTheme(null)}
                whileHover={{ scale: 1.15 }}
              >
                <div className={`rounded-full ${colors.bg} border ${isHovered ? "border-white/30" : "border-white/10"} flex items-center justify-center transition-all relative`} style={{ width: size, height: size }}>
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  {theme.trend === "rising" && (
                    <motion.div className="absolute -top-1 -right-1" animate={{ y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <TrendingUp className={`w-3 h-3 ${colors.text}`} />
                    </motion.div>
                  )}
                </div>
                {isHovered && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="absolute z-20 top-full mt-2 left-1/2 -translate-x-1/2 w-48 p-3 rounded-lg bg-[#0f0f23] border border-white/10 shadow-xl">
                    <p className="text-xs font-semibold text-white mb-1">{theme.name}</p>
                    <p className="text-[10px] text-muted-foreground mb-2">{theme.description}</p>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span className={colors.text}>M:{theme.momentum}</span>
                      <span className="text-cyan">R:{theme.relevance}</span>
                      <span className="text-muted-foreground">{theme.papers} papers</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          <div className="absolute bottom-2 right-2 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>Center = High Relevance</span>
            <span>Size = Momentum</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((theme, idx) => {
          const colors = categoryColors[theme.category] || categoryColors.AI;
          return (
            <motion.div key={theme.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + idx * 0.04 }} className="glass-panel rounded-xl p-4 hover:bg-white/[0.02] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <span className={`text-[10px] font-mono uppercase ${colors.text}`}>{theme.category}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${theme.trend === "rising" ? "text-emerald bg-emerald/10" : theme.trend === "declining" ? "text-red-400 bg-red-400/10" : "text-muted-foreground bg-white/[0.03]"}`}>
                  {theme.trend === "rising" ? "↑" : theme.trend === "declining" ? "↓" : "→"} {theme.trend}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">{theme.name}</h4>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{theme.description}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded bg-white/[0.02]">
                  <p className="text-sm font-bold text-white">{theme.momentum}</p>
                  <p className="text-[9px] text-muted-foreground">Momentum</p>
                </div>
                <div className="text-center p-2 rounded bg-white/[0.02]">
                  <p className="text-sm font-bold text-cyan">{theme.relevance}</p>
                  <p className="text-[9px] text-muted-foreground">Relevance</p>
                </div>
                <div className="text-center p-2 rounded bg-white/[0.02]">
                  <p className="text-sm font-bold text-violet">{theme.papers}</p>
                  <p className="text-[9px] text-muted-foreground">Papers</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
