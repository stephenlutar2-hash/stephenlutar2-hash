import { useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Cpu, Database, Shield, Network, Settings, ArrowRight, Layers, GitBranch, Server, Activity, Gauge, Timer, TrendingUp } from "lucide-react";

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

const modules = [
  { icon: Cpu, title: "Core Engine", desc: "High-performance processing core with adaptive load balancing and self-optimizing algorithms", status: "Active" },
  { icon: Database, title: "Data Nexus", desc: "Distributed data layer with real-time synchronization across all connected platforms", status: "Active" },
  { icon: Shield, title: "Shield Protocol", desc: "Multi-layered security framework with zero-trust architecture and quantum-resistant encryption", status: "Active" },
  { icon: Network, title: "Neural Mesh", desc: "Intelligent routing network that adapts to system load and optimizes data flow patterns", status: "Active" },
  { icon: Settings, title: "Config Matrix", desc: "Dynamic configuration management with hot-reload capabilities and version control", status: "Active" },
  { icon: GitBranch, title: "Versioning Layer", desc: "Atomic state management with rollback support and distributed consensus mechanisms", status: "Active" },
];

const architectureLayers = [
  { name: "Presentation Layer", color: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/30", modules: ["React Frontends", "REST API", "WebSocket"] },
  { name: "Application Layer", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", modules: ["Business Logic", "Auth Engine", "Orchestrator"] },
  { name: "Data Layer", color: "from-emerald-500/20 to-green-500/20", border: "border-emerald-500/30", modules: ["PostgreSQL", "Redis Cache", "Object Storage"] },
  { name: "Infrastructure", color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/30", modules: ["Container Runtime", "Load Balancer", "Monitor"] },
];

const benchmarks = [
  { icon: Activity, label: "Throughput", value: "2.4M", suffix: "req/s", desc: "Peak request processing capacity across all modules" },
  { icon: Timer, label: "Latency", value: "<2ms", suffix: "p99", desc: "99th percentile response time under load" },
  { icon: Gauge, label: "Uptime", value: "99.99%", suffix: "SLA", desc: "Guaranteed service availability with auto-failover" },
  { icon: TrendingUp, label: "Scalability", value: "∞", suffix: "horizontal", desc: "Infinite horizontal scaling with zero-downtime deploys" },
];

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="font-display font-bold tracking-wider text-lg">ZEUS</span>
          </div>
          <button
            onClick={() => setLocation("/login")}
            className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition"
          >
            Sign In
          </button>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-yellow-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/3 w-[350px] h-[350px] bg-blue-500/6 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(234,179,8,0.5) 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-8"
            >
              <Zap className="w-3.5 h-3.5" /> Modular Core Architecture
            </motion.div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black leading-[1.05] mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400">The Engine</span>
              <br />
              <span className="text-white">Behind Everything</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Zeus is the modular core architecture system powering SZL Holdings' entire platform ecosystem. Adaptive, resilient, and infinitely extensible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setLocation("/login")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold tracking-wider uppercase text-sm hover:opacity-90 transition shadow-lg shadow-yellow-500/25 flex items-center justify-center gap-2"
              >
                Access Architecture <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setLocation("/login")} className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold tracking-wider uppercase text-sm hover:bg-white/10 transition">
                View Documentation
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-6 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
          {[
            { label: "Platforms Powered", value: "15+" },
            { label: "Modules Active", value: "8" },
            { label: "Uptime", value: "99.99%" },
            { label: "Requests/sec", value: "2.4M" },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">{stat.value}</span>
              <span className="text-[11px] text-gray-500 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-yellow-400/70 mb-3">Architecture</p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">System Architecture</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Four interconnected layers forming a resilient, self-healing platform infrastructure.</p>
            </div>
          </AnimatedSection>
          <div className="space-y-4">
            {architectureLayers.map((layer, i) => (
              <AnimatedSection key={layer.name} delay={i * 0.1}>
                <div className={`p-6 rounded-2xl bg-gradient-to-r ${layer.color} border ${layer.border} hover:scale-[1.01] transition-all duration-300`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-white/60" />
                      <h3 className="font-display font-bold text-white">{layer.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {layer.modules.map(m => (
                        <span key={m} className="px-3 py-1 rounded-lg bg-white/10 text-xs text-white/70 font-mono">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-yellow-400/70 mb-3">Performance</p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">Engineering Benchmarks</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Battle-tested performance metrics from production workloads across the SZL platform suite.</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benchmarks.map((b, i) => (
              <AnimatedSection key={b.label} delay={i * 0.1}>
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-yellow-500/20 transition-all duration-300 text-center h-full">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400 mb-0.5">{b.value}</p>
                  <p className="text-[10px] text-yellow-400/60 uppercase tracking-widest font-bold mb-2">{b.suffix}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-yellow-400/70 mb-3">Modules</p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">Core Modules</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Each module is independently deployable, self-healing, and horizontally scalable.</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, i) => (
              <AnimatedSection key={m.title} delay={i * 0.08}>
                <div className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-yellow-500/20 transition-all duration-300">
                      <m.icon className="w-6 h-6 text-yellow-400" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{m.status}</span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">{m.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <Server className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl font-display font-bold text-white mb-4">Built for Scale</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Zeus handles millions of operations per second across every SZL Holdings platform. Access the architecture dashboard to monitor and configure the system.
              </p>
              <button
                onClick={() => setLocation("/login")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold tracking-wider uppercase text-sm hover:opacity-90 transition shadow-lg shadow-yellow-500/25"
              >
                Enter Architecture Console
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-500">Zeus — SZL Holdings</span>
          </div>
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} SZL Holdings. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
