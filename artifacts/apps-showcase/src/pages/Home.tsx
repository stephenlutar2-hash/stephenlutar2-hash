import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Flame, Satellite, Leaf, Cloud, Zap, Sparkles, Eye,
  ArrowRight, Check, Crown, Star, Rocket, Globe, Layers, BarChart3,
  Briefcase, Ship, Coffee, Monitor, Cpu, Activity, Search, X,
} from "lucide-react";

type Platform = {
  name: string;
  tagline: string;
  description: string;
  icon: typeof Shield;
  color: string;
  accent: string;
  features: string[];
  path: string;
  category: string;
  status: "live" | "beta" | "building";
};

const platforms: Platform[] = [
  {
    name: "ROSIE",
    tagline: "AI Security Monitoring",
    description: "Real-time threat detection and incident response powered by the Nuro AI Engine. Monitor your entire security landscape from a single command center.",
    icon: Shield,
    color: "from-cyan-500 to-violet-600",
    accent: "cyan",
    features: ["Threat Intelligence", "Incident Response", "AI Chat (Alloy)", "Real-time Scanning"],
    path: "/",
    category: "Security",
    status: "live",
  },
  {
    name: "Aegis",
    tagline: "Defensive Security Platform",
    description: "Enterprise-grade defensive security suite with threat assessment, vulnerability scanning, and compliance monitoring for critical infrastructure.",
    icon: Eye,
    color: "from-amber-500 to-yellow-600",
    accent: "amber",
    features: ["Threat Assessment", "Vulnerability Scanning", "Compliance Monitoring", "Security Auditing"],
    path: "/aegis/",
    category: "Security",
    status: "live",
  },
  {
    name: "Beacon",
    tagline: "Telemetry & Analytics",
    description: "Centralized telemetry dashboard for tracking KPIs, project initiatives, and organizational metrics across the entire SZL Holdings portfolio.",
    icon: Satellite,
    color: "from-cyan-400 to-blue-600",
    accent: "cyan",
    features: ["KPI Tracking", "Project Management", "Zeus Integration", "DreamEra Insights"],
    path: "/beacon/",
    category: "Analytics",
    status: "live",
  },
  {
    name: "Lutar",
    tagline: "Empire Command Center",
    description: "Personal command center for SZL Holdings. Track projects, assets, financial KPIs, and strategic initiatives across every division from a single pane of glass.",
    icon: Leaf,
    color: "from-emerald-500 to-green-600",
    accent: "emerald",
    features: ["Financial KPIs", "Strategic Planning", "Portfolio Oversight", "Division Analytics"],
    path: "/lutar/",
    category: "Operations",
    status: "live",
  },
  {
    name: "Nimbus",
    tagline: "Predictive Intelligence",
    description: "AI-powered predictive analytics platform with confidence-scored forecasting, system alerts, and neural network anomaly detection.",
    icon: Cloud,
    color: "from-cyan-500 to-violet-600",
    accent: "violet",
    features: ["AI Predictions", "System Alerts", "Anomaly Detection", "Confidence Scoring"],
    path: "/nimbus/",
    category: "AI & Intelligence",
    status: "live",
  },
  {
    name: "Firestorm",
    tagline: "Security Simulation Lab",
    description: "Controlled security simulation environment for testing defensive strategies, validating incident response playbooks, and training security teams.",
    icon: Flame,
    color: "from-orange-500 to-red-600",
    accent: "orange",
    features: ["Defense Simulation", "Incident Response", "Security Training", "Playbook Validation"],
    path: "/firestorm/",
    category: "Security",
    status: "live",
  },
  {
    name: "DreamEra",
    tagline: "AI Storytelling Platform",
    description: "Neural storytelling engine that renders artifact maps and discovers energy breakthroughs. Transform ideas into living, breathing story worlds.",
    icon: Sparkles,
    color: "from-violet-500 to-blue-600",
    accent: "violet",
    features: ["Narrative Engine", "Artifact Mapping", "Creative Synthesis", "Neural Rendering"],
    path: "/dreamera/",
    category: "Creative",
    status: "live",
  },
  {
    name: "Zeus",
    tagline: "Modular Core Architecture",
    description: "The backbone engine powering every SZL platform. Adaptive, resilient infrastructure with modular design and horizontal scalability.",
    icon: Zap,
    color: "from-yellow-500 to-amber-600",
    accent: "yellow",
    features: ["Core Engine", "Module Management", "Auto-Scaling", "Health Monitoring"],
    path: "/zeus/",
    category: "Infrastructure",
    status: "live",
  },
  {
    name: "Lyte",
    tagline: "Executive Observability",
    description: "Unified command center for portfolio-wide signals, AI-driven recommendations, and ecosystem health monitoring across all SZL platforms.",
    icon: Activity,
    color: "from-emerald-400 to-teal-600",
    accent: "emerald",
    features: ["Signal Intelligence", "AI Recommendations", "Portfolio Health", "Impact Analysis"],
    path: "/lyte/",
    category: "Analytics",
    status: "live",
  },
  {
    name: "AlloyScape",
    tagline: "Infrastructure Operations",
    description: "Cloud and on-premise infrastructure management with orchestration, monitoring, service health, and execution log analytics.",
    icon: Layers,
    color: "from-slate-400 to-zinc-600",
    accent: "gray",
    features: ["Cloud Operations", "Service Health", "Workflow Orchestration", "Execution Logs"],
    path: "/alloyscape/",
    category: "Infrastructure",
    status: "live",
  },
  {
    name: "Dreamscape",
    tagline: "Creative Systems",
    description: "Creative systems platform for ideation workflows, content pipelines, and design-driven project management.",
    icon: Globe,
    color: "from-indigo-500 to-purple-600",
    accent: "indigo",
    features: ["Ideation Workflows", "Content Pipelines", "Design Management", "Creative AI"],
    path: "/dreamscape/",
    category: "Creative",
    status: "live",
  },
  {
    name: "Vessels",
    tagline: "Maritime Intelligence",
    description: "Fleet intelligence platform for VLGC carriers — voyage tracking, emissions monitoring, compliance analytics, and commercial operations.",
    icon: Ship,
    color: "from-blue-600 to-cyan-500",
    accent: "blue",
    features: ["Fleet Tracking", "Voyage Analytics", "Emissions Monitoring", "Compliance"],
    path: "/vessels/",
    category: "Operations",
    status: "live",
  },
  {
    name: "INCA",
    tagline: "AI Research Platform",
    description: "AI research and experimentation platform for managing projects, model training, experiment pipelines, and accuracy tracking.",
    icon: Cpu,
    color: "from-violet-500 to-purple-600",
    accent: "violet",
    features: ["Project Management", "Experiment Tracking", "Model Training", "Accuracy Analysis"],
    path: "/inca/",
    category: "AI & Intelligence",
    status: "live",
  },
  {
    name: "Carlota Jo",
    tagline: "Strategic Consulting",
    description: "Strategic advisory firm with six practice areas — digital transformation, AI strategy, cybersecurity, data intelligence, executive coaching, and custom solutions.",
    icon: Coffee,
    color: "from-rose-500 to-pink-600",
    accent: "pink",
    features: ["Digital Transformation", "AI Strategy", "Cybersecurity Advisory", "Executive Coaching"],
    path: "/carlota-jo/",
    category: "Operations",
    status: "live",
  },
  {
    name: "Readiness Report",
    tagline: "Project Assessment",
    description: "Comprehensive project readiness assessments with scoring, risk matrices, and go/no-go decision support for enterprise launches.",
    icon: BarChart3,
    color: "from-teal-500 to-cyan-600",
    accent: "teal",
    features: ["Risk Assessment", "Readiness Scoring", "Launch Checklists", "Decision Support"],
    path: "/readiness-report/",
    category: "Analytics",
    status: "live",
  },
  {
    name: "Career",
    tagline: "Professional Portfolio",
    description: "Professional portfolio and career showcase for SZL Holdings leadership, achievements, and technology vision.",
    icon: Briefcase,
    color: "from-blue-500 to-indigo-600",
    accent: "blue",
    features: ["Leadership Profile", "Achievements", "Technology Vision", "Career Timeline"],
    path: "/career/",
    category: "Operations",
    status: "live",
  },
  {
    name: "SZL Holdings",
    tagline: "Corporate Portfolio",
    description: "Corporate portfolio hub showcasing all SZL Holdings ventures, ecosystem health, and strategic overview of the entire enterprise.",
    icon: Crown,
    color: "from-cyan-500 to-blue-600",
    accent: "cyan",
    features: ["Portfolio Overview", "Ecosystem Health", "Strategic Dashboard", "Division Analytics"],
    path: "/szl-holdings/",
    category: "Operations",
    status: "live",
  },
];

const categories = ["All", "Security", "AI & Intelligence", "Analytics", "Infrastructure", "Creative", "Operations"];

const tiers = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "Essential tools for small teams getting started with security and analytics.",
    features: ["ROSIE Basic Monitoring", "Beacon KPI Dashboard", "Lutar Command Center", "Career Portfolio", "Email Support", "5 Team Members"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "$199",
    period: "/mo",
    description: "Full platform access with advanced AI features and priority support.",
    features: ["All Starter Features", "Aegis Security Suite", "Nimbus Predictions", "Firestorm Simulation Lab", "Vessels Maritime Intel", "INCA Research Platform", "Alloy AI Assistant", "Priority Support", "25 Team Members", "API Access"],
    cta: "Get Professional",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Unlimited access with dedicated infrastructure, custom integrations, and SLA guarantees.",
    features: ["All Professional Features", "All 18 Platforms", "DreamEra Storytelling", "Zeus Architecture Access", "Lyte Command Center", "Carlota Jo Consulting", "Dedicated Support", "Unlimited Team Members", "Custom Integrations", "99.99% SLA", "On-Premise Option"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const filteredPlatforms = useMemo(() => {
    return platforms.filter(p => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesSearch = searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const featured = [platforms[0], platforms[4], platforms[6]];

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-cyan-600 focus:text-white focus:outline-none">
        Skip to content
      </a>
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold tracking-wider text-lg">SZL HOLDINGS</span>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase -mt-0.5">Platform Showcase · <span className="inline-flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" />SZL Portfolio · Catalog Fresh</span></p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <a href="#platforms" className="text-sm text-gray-400 hover:text-white transition">Platforms</a>
            <a href="#spotlight" className="text-sm text-gray-400 hover:text-white transition">Spotlight</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Pricing</a>
            <a href="/" className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition">
              Go to ROSIE
            </a>
          </div>
        </div>
      </nav>

      <section id="main-content" className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-violet-500/6 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Rocket className="w-3.5 h-3.5" /> SZL Holdings Platform Suite
            </div>
            <h1 className="text-5xl sm:text-7xl font-display font-black leading-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">Eighteen Platforms.</span>
              <br />
              <span className="text-white">One Vision.</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              From AI security monitoring to predictive intelligence, SZL Holdings delivers a comprehensive suite of enterprise platforms designed for the next generation of digital infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#platforms" className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold tracking-wider uppercase text-sm hover:opacity-90 transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2">
                Explore Platforms <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#pricing" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold tracking-wider uppercase text-sm hover:bg-white/10 transition text-center">
                View Pricing
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="spotlight" className="py-16 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Featured Spotlight</h2>
              <p className="text-sm text-gray-500 mt-1">Flagship platforms powering the SZL ecosystem</p>
            </div>
            <div className="flex gap-2">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeaturedIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === featuredIndex ? "bg-cyan-400 w-6" : "bg-white/20 hover:bg-white/40"}`}
                />
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.a
              key={featuredIndex}
              href={featured[featuredIndex].path}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="block rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all group"
            >
              <div className={`relative p-8 sm:p-12 bg-gradient-to-br ${featured[featuredIndex].color} overflow-hidden`}>
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start gap-8">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {(() => { const Icon = featured[featuredIndex].icon; return <Icon className="w-10 h-10 text-white" />; })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">{featured[featuredIndex].name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Live</span>
                    </div>
                    <p className="text-white/60 text-sm mb-1">{featured[featuredIndex].tagline}</p>
                    <p className="text-white/80 leading-relaxed mb-6 max-w-2xl">{featured[featuredIndex].description}</p>
                    <div className="flex flex-wrap gap-2">
                      {featured[featuredIndex].features.map(f => (
                        <span key={f} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/10">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 hidden sm:flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                    <span className="text-sm font-semibold">Launch</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.a>
          </AnimatePresence>
        </div>
      </section>

      <section id="platforms" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">The Platform Suite</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Eighteen specialized platforms working in concert to power your digital operations.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setHighlightedIndex(-1); }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setSearchQuery(""); setHighlightedIndex(-1); }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlightedIndex(prev => Math.min(prev + 1, filteredPlatforms.length - 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightedIndex(prev => Math.max(prev - 1, -1));
                  }
                  if (e.key === "Enter") {
                    const idx = highlightedIndex >= 0 ? highlightedIndex : (filteredPlatforms.length === 1 ? 0 : -1);
                    if (idx >= 0 && filteredPlatforms[idx]) {
                      window.location.href = filteredPlatforms[idx].path;
                    }
                  }
                }}
                placeholder="Search platforms..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/40 transition"
                aria-label="Search platforms"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    activeCategory === cat
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-white/5 text-gray-400 border border-white/5 hover:border-white/15 hover:text-white"
                  }`}
                >
                  {cat}
                  {cat !== "All" && (
                    <span className="ml-1.5 text-[10px] opacity-60">
                      {platforms.filter(p => p.category === cat).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-500">
            {filteredPlatforms.length} platform{filteredPlatforms.length !== 1 ? "s" : ""} found
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPlatforms.map((p, idx) => (
                <motion.a
                  key={p.name}
                  href={p.path}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`group block rounded-2xl bg-white/[0.03] border transition-all duration-300 overflow-hidden ${
                    highlightedIndex === idx ? "border-cyan-500/50 ring-1 ring-cyan-500/20" : "border-white/5 hover:border-white/15"
                  }`}
                >
                  <div className={`relative h-28 bg-gradient-to-br ${p.color} overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-3 left-4 right-4 h-2 rounded bg-white/30" />
                      <div className="absolute top-7 left-4 w-2/5 h-1.5 rounded bg-white/20" />
                      <div className="absolute top-12 left-4 right-4 grid grid-cols-3 gap-2">
                        <div className="h-8 rounded bg-white/15" />
                        <div className="h-8 rounded bg-white/15" />
                        <div className="h-8 rounded bg-white/15" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur">
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === "live" ? "bg-emerald-400" : p.status === "beta" ? "bg-amber-400" : "bg-blue-400"}`} />
                      <span className="text-[10px] font-bold text-white/80 uppercase">{p.status}</span>
                    </div>
                    <div className="absolute bottom-3 right-3 w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                      <p.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-white">{p.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/5 text-gray-500">{p.category}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{p.tagline}</p>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2">{p.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.features.slice(0, 3).map(f => (
                        <span key={f} className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/5">
                          {f}
                        </span>
                      ))}
                      {p.features.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500">
                          +{p.features.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.a>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredPlatforms.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-semibold mb-1">No platforms found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or category filter</p>
              <button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} className="mt-4 px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">Subscription Tiers</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Choose the plan that fits your organization's needs. All plans include core infrastructure and updates.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                  tier.popular
                    ? "bg-gradient-to-b from-cyan-500/10 to-transparent border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                    : "bg-white/[0.03] border-white/5 hover:border-white/15"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Star className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-display font-bold text-white mb-1">{tier.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{tier.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display font-black text-white">{tier.price}</span>
                    <span className="text-gray-500 text-sm">{tier.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition ${
                  tier.popular
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-cyan-500/25"
                    : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                }`}>
                  {tier.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: `${platforms.length}`, label: "Active Platforms" },
              { value: "99.99%", label: "Avg Uptime" },
              { value: "200+", label: "Enterprise Clients" },
              { value: "50M+", label: "Daily Events" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{s.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <Crown className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-3xl font-display font-bold text-white mb-4">Ready to Transform Your Operations?</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Join hundreds of enterprises already powered by SZL Holdings' platform suite. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/" className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold tracking-wider uppercase text-sm hover:opacity-90 transition shadow-lg shadow-cyan-500/25">
                  Get Started with ROSIE
                </a>
                <a href="#pricing" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold tracking-wider uppercase text-sm hover:bg-white/10 transition text-center">
                  Compare Plans
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-500">SZL Holdings — Platform Showcase</span>
          </div>
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} SZL Holdings. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
