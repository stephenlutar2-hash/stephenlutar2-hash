import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Monitor, Zap, Users, Star, ArrowRight, Activity, Brain, Shield, Ship, BarChart3, Eye } from "lucide-react";
import { Link } from "wouter";

function AnimatedPreview({ gradient, icon: Icon, metrics }: { gradient: string; icon: React.ElementType; metrics: { label: string; value: number; max: number }[] }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`h-44 rounded-lg bg-gradient-to-br ${gradient} relative overflow-hidden p-4`}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <Icon className="w-5 h-5 text-white/60" />
          <motion.div key={tick} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            <span className="text-[9px] font-mono text-emerald-400">LIVE</span>
          </motion.div>
        </div>
        <div className="space-y-2">
          {metrics.map((m, i) => {
            const currentValue = Math.min(m.max, m.value + Math.sin(tick * 0.5 + i) * (m.max * 0.05));
            const pct = (currentValue / m.max) * 100;
            return (
              <div key={m.label}>
                <div className="flex items-center justify-between text-[9px] mb-0.5">
                  <span className="text-white/50">{m.label}</span>
                  <motion.span key={`${tick}-${i}`} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="text-white/80 font-mono">{Math.round(currentValue)}</motion.span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className="h-full bg-white/40 rounded-full" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const demos = [
  {
    id: 1, name: "Vessels Maritime Intelligence", category: "Maritime", status: "Live",
    description: "Real-time fleet monitoring with AI-powered route optimization, emissions tracking, and predictive maintenance across global maritime operations.",
    features: ["Signal Intelligence Dashboard", "Maritime Intel Feed", "Document Processing Engine", "CII Compliance Monitoring"],
    metrics: { users: "1,200+", uptime: "99.97%", dataPoints: "2.4M/day" },
    techStack: ["React", "TypeScript", "Recharts", "WebSocket", "PostgreSQL"],
    gradient: "from-cyan-500/30 to-blue-600/30",
    icon: Ship,
    previewMetrics: [
      { label: "Fleet Vessels", value: 142, max: 200 },
      { label: "Emissions Score", value: 87, max: 100 },
      { label: "Active Routes", value: 38, max: 50 },
    ],
    recommendation: null,
  },
  {
    id: 2, name: "Beacon Observability", category: "Infrastructure", status: "Live",
    description: "Full-stack observability platform with anomaly correlation engine, trend forecasting, and cross-platform signal analysis.",
    features: ["Anomaly Correlation Engine", "Trend Forecasting", "Cross-Platform Monitoring", "Daily Intelligence Brief"],
    metrics: { users: "800+", uptime: "99.99%", dataPoints: "14M/day" },
    techStack: ["React", "TypeScript", "Recharts", "Prometheus", "Grafana"],
    gradient: "from-emerald-500/30 to-teal-600/30",
    icon: Activity,
    previewMetrics: [
      { label: "Services Healthy", value: 94, max: 100 },
      { label: "P99 Latency (ms)", value: 45, max: 200 },
      { label: "Active Alerts", value: 3, max: 50 },
    ],
    recommendation: "If you use Vessels, Beacon can monitor your entire maritime infrastructure stack",
  },
  {
    id: 3, name: "INCA Intelligence Platform", category: "AI/Research", status: "Live",
    description: "Research intelligence platform with multi-source feed aggregation, document intelligence extraction, and discovery radar.",
    features: ["Research Feed", "Document Intelligence", "Discovery Radar", "Experiment Tracking"],
    metrics: { users: "600+", uptime: "99.94%", dataPoints: "847K/day" },
    techStack: ["React", "TypeScript", "Framer Motion", "TanStack Query"],
    gradient: "from-violet-500/30 to-purple-600/30",
    icon: Brain,
    previewMetrics: [
      { label: "Research Sources", value: 247, max: 300 },
      { label: "Discovery Score", value: 91, max: 100 },
      { label: "Active Experiments", value: 12, max: 20 },
    ],
    recommendation: "Pairs with AlloyScape for automated research pipeline orchestration",
  },
  {
    id: 4, name: "Rosie Security Engine", category: "Security", status: "Live",
    description: "Behavioral security engine with real-time threat intelligence feed, MITRE ATT&CK mapping, and automated incident response.",
    features: ["Threat Intel Feed", "Behavioral Analysis", "MITRE ATT&CK Integration", "Automated Response"],
    metrics: { users: "900+", uptime: "99.98%", dataPoints: "5.2M/day" },
    techStack: ["React", "TypeScript", "WebSocket", "Redis", "ML Pipeline"],
    gradient: "from-red-500/30 to-orange-600/30",
    icon: Shield,
    previewMetrics: [
      { label: "Threats Blocked", value: 2847, max: 5000 },
      { label: "Response Time (s)", value: 2, max: 10 },
      { label: "Coverage (%)", value: 98, max: 100 },
    ],
    recommendation: "Essential for any enterprise deployment — integrates with Aegis compliance",
  },
  {
    id: 5, name: "AlloyScape Orchestrator", category: "AI Platform", status: "Live",
    description: "Multi-agent AI orchestration platform with agent leaderboard, task routing, and performance analytics across specialized AI agents.",
    features: ["Agent Leaderboard", "Multi-Agent Orchestration", "Workflow Templates", "Execution Analytics"],
    metrics: { users: "500+", uptime: "99.96%", dataPoints: "1.8M/day" },
    techStack: ["React", "TypeScript", "Agent Framework", "PostgreSQL"],
    gradient: "from-amber-500/30 to-yellow-600/30",
    icon: Zap,
    previewMetrics: [
      { label: "Active Agents", value: 8, max: 12 },
      { label: "Tasks/Hour", value: 1247, max: 2000 },
      { label: "Success Rate (%)", value: 96, max: 100 },
    ],
    recommendation: "Recommended if you use 3+ SZL platforms — automates cross-platform workflows",
  },
  {
    id: 6, name: "Nimbus Weather Intelligence", category: "Predictions", status: "Live",
    description: "Multi-model weather prediction ensemble with dynamic model weighting, regional accuracy tracking, and prediction audit trails.",
    features: ["Ensemble Studio", "Prediction Audit Trail", "Multi-Model Comparison", "Regional Accuracy"],
    metrics: { users: "700+", uptime: "99.93%", dataPoints: "3.1M/day" },
    techStack: ["React", "TypeScript", "Recharts", "ML Models", "GFS Bridge"],
    gradient: "from-blue-500/30 to-indigo-600/30",
    icon: Eye,
    previewMetrics: [
      { label: "Ensemble Accuracy", value: 97, max: 100 },
      { label: "Active Models", value: 5, max: 8 },
      { label: "Predictions/Day", value: 14847, max: 20000 },
    ],
    recommendation: "Critical for Vessels customers — maritime weather directly impacts fleet operations",
  },
];

export default function LiveDemos() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            <span className="font-bold">Live Demos</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="/catalog" className="text-sm text-muted-foreground hover:text-foreground">Catalog</Link>
          </nav>
        </div>
      </header>

      <main className="pt-20 pb-16 max-w-6xl mx-auto px-6 space-y-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Live Platform Demos</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Interactive live previews of the SZL Holdings ecosystem with real-time metrics and intelligent recommendations</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Active Platforms", value: `${demos.length}`, icon: Monitor, color: "text-cyan-400" },
            { label: "Total Users", value: "4,700+", icon: Users, color: "text-emerald-400" },
            { label: "Data Points / Day", value: "27M+", icon: Zap, color: "text-amber-400" },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-5 rounded-xl bg-card border border-border text-center">
              <m.icon className={`w-6 h-6 mx-auto mb-2 ${m.color}`} />
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-8">
          {demos.map((demo, idx) => (
            <motion.div key={demo.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.08 }} className="rounded-xl border border-border overflow-hidden group hover:border-primary/20 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="p-3">
                  <AnimatedPreview gradient={demo.gradient} icon={demo.icon} metrics={demo.previewMetrics} />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold">{demo.name}</h3>
                      <p className="text-xs text-muted-foreground">{demo.category}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{demo.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{demo.description}</p>
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {demo.features.map(f => <span key={f} className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/10">{f}</span>)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {Object.entries(demo.metrics).map(([k, v]) => (
                      <div key={k} className="text-center p-2 rounded bg-card border border-border">
                        <p className="text-sm font-bold">{v}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">{k.replace(/([A-Z])/g, " $1").trim()}</p>
                      </div>
                    ))}
                  </div>
                  {demo.recommendation && (
                    <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-2">
                      <Star className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-[11px] text-primary/80">{demo.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
