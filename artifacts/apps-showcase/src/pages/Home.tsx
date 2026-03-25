import { motion } from "framer-motion";
import {
  Shield, Flame, Satellite, Leaf, Cloud, Zap, Sparkles, Eye,
  ArrowRight, Check, Crown, Star, Rocket, Globe
} from "lucide-react";

const platforms = [
  {
    name: "ROSIE",
    tagline: "AI Security Monitoring",
    description: "Real-time threat detection and incident response powered by the Nuro AI Engine. Monitor your entire security landscape from a single command center.",
    icon: Shield,
    color: "from-cyan-500 to-violet-600",
    accent: "cyan",
    features: ["Threat Intelligence", "Incident Response", "AI Chat (Alloy)", "Real-time Scanning"],
    path: "/",
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
  },
  {
    name: "PSEM",
    tagline: "Platform Security Event Manager",
    description: "Centralized security event management aggregating signals from every SZL platform into a unified threat intelligence feed.",
    icon: Globe,
    color: "from-indigo-500 to-purple-600",
    accent: "indigo",
    features: ["Event Aggregation", "Threat Correlation", "Cross-Platform Alerts", "Forensic Analysis"],
    path: "#",
    comingSoon: true,
  },
];

const tiers = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "Essential tools for small teams getting started with security and analytics.",
    features: ["ROSIE Basic Monitoring", "Beacon KPI Dashboard", "Lutar Command Center", "Email Support", "5 Team Members"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "$199",
    period: "/mo",
    description: "Full platform access with advanced AI features and priority support.",
    features: ["All Starter Features", "Aegis Security Suite", "Nimbus Predictions", "Firestorm Simulation Lab", "Alloy AI Assistant", "Priority Support", "25 Team Members", "API Access"],
    cta: "Get Professional",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Unlimited access with dedicated infrastructure, custom integrations, and SLA guarantees.",
    features: ["All Professional Features", "DreamEra Storytelling", "Zeus Architecture Access", "PSEM Event Manager", "Dedicated Support", "Unlimited Team Members", "Custom Integrations", "99.99% SLA", "On-Premise Option"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Home() {
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
              <p className="text-[10px] text-gray-500 tracking-widest uppercase -mt-0.5">Platform Showcase</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <a href="#platforms" className="text-sm text-gray-400 hover:text-white transition">Platforms</a>
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">Nine Platforms.</span>
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

      <section id="platforms" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">The Platform Suite</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Nine specialized platforms working in concert to power your digital operations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((p, i) => (
              <motion.a
                key={p.name}
                href={p.path}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group block rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all duration-300 overflow-hidden"
              >
                <div className={`relative h-32 bg-gradient-to-br ${p.color} overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-3 left-4 right-4 h-2.5 rounded bg-white/30" />
                    <div className="absolute top-8 left-4 w-2/5 h-2 rounded bg-white/20" />
                    <div className="absolute top-14 left-4 right-4 grid grid-cols-3 gap-2">
                      <div className="h-10 rounded bg-white/15" />
                      <div className="h-10 rounded bg-white/15" />
                      <div className="h-10 rounded bg-white/15" />
                    </div>
                    <div className="absolute bottom-3 left-4 w-1/3 h-2 rounded bg-white/20" />
                  </div>
                  <div className="absolute bottom-3 right-3 w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                    <p.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <p.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-gray-500">{p.tagline}</p>
                  </div>
                  {(p as Record<string, unknown>).comingSoon && (
                    <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{p.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.features.map(f => (
                    <span key={f} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/5">
                      {f}
                    </span>
                  ))}
                </div>
                </div>
              </motion.a>
            ))}
          </div>
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

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 p-12 text-center">
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
