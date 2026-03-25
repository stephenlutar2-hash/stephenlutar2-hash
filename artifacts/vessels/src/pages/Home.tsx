import { useLocation } from "wouter";
import { Anchor, BarChart3, Globe2, Shield, Navigation, Bell, ChevronRight, Waves } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Navigation, title: "Fleet Operations", desc: "Real-time visibility into vessel positions, speed, heading, and operational status across your entire fleet." },
  { icon: Globe2, title: "Route Intelligence", desc: "Track active routes with origin-destination pairs, ETA calculations, progress monitoring, and waypoint management." },
  { icon: BarChart3, title: "Asset Management", desc: "Comprehensive equipment tracking with condition monitoring, maintenance scheduling, and lifecycle management." },
  { icon: Bell, title: "Alert Systems", desc: "Priority-sorted intelligence feeds for weather advisories, route deviations, compliance flags, and security alerts." },
  { icon: Shield, title: "Compliance Monitoring", desc: "MARPOL, IMO CII, EU ETS, and ballast water convention tracking to keep your fleet regulation-ready." },
  { icon: Anchor, title: "Port Intelligence", desc: "Congestion reports, anchorage wait times, and berth availability across major global ports." },
];

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
              <Anchor className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-wide">VESSELS</span>
          </div>
          <button
            onClick={() => setLocation("/login")}
            className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition"
          >
            Sign In
          </button>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium uppercase tracking-wider mb-8">
              <Waves className="w-3.5 h-3.5" />
              Maritime Intelligence Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Complete Visibility
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Across Your Fleet
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Command-center intelligence for maritime operations. Monitor vessels, track routes, manage assets, and respond to alerts — all from a single operational dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setLocation("/login")}
                className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center gap-2 text-sm"
              >
                Enter Command Center
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-3.5 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition text-sm">
                View Documentation
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Operational Intelligence, <span className="text-cyan-400">Unified</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything your operations team needs to maintain fleet readiness and respond to emerging situations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass-panel rounded-xl p-6 hover:border-cyan-500/20 transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition">
                  <f.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-2xl p-10 md:p-14 text-center border border-cyan-500/10"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Take Command?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Access your fleet operations dashboard and start monitoring vessel movements, routes, and intelligence in real time.
            </p>
            <button
              onClick={() => setLocation("/login")}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-xl hover:opacity-90 transition text-sm inline-flex items-center gap-2"
            >
              <Anchor className="w-4 h-4" />
              Launch Vessels Platform
            </button>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Anchor className="w-4 h-4 text-cyan-500" />
            <span className="font-display font-semibold text-foreground">VESSELS</span>
            <span>— SZL Holdings Maritime Intelligence</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 SZL Holdings. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
