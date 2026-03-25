import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles, Compass, Grid3x3, GitBranch, Wand2, Clock,
  ArrowRight, Layers, Palette, Zap
} from "lucide-react";

const features = [
  { icon: Compass, title: "World Explorer", desc: "Navigate vast creative worlds and discover hidden realms of imagination across infinite dimensions" },
  { icon: Grid3x3, title: "Artifact Gallery", desc: "Browse stunning generated content in immersive gallery views with full lightbox experience" },
  { icon: GitBranch, title: "Hierarchy Maps", desc: "Visualize the relationships between worlds, projects, and artifacts in interactive maps" },
  { icon: Wand2, title: "Prompt Studio", desc: "Craft precise generation prompts and watch your vision materialize before your eyes" },
  { icon: Clock, title: "Generation Timeline", desc: "Track your creative journey with a complete history of prompts and their outputs" },
  { icon: Palette, title: "Export & Share", desc: "Download high-resolution artifacts and share your creations with the world" },
];

const stats = [
  { value: "6", label: "Creative Worlds" },
  { value: "120+", label: "Artifacts Generated" },
  { value: "17", label: "Active Projects" },
  { value: "∞", label: "Possibilities" },
];

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold tracking-wider text-lg">DREAMSCAPE</span>
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
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/6 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles className="w-3.5 h-3.5" /> Creative Systems Platform
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black leading-[0.9] mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Explore</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">Infinite Worlds</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Dreamscape is an immersive creative workspace for exploring worlds, crafting artifacts, and generating extraordinary content. Step into dimensions of pure imagination.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setLocation("/login")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold tracking-wider uppercase text-sm hover:opacity-90 transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
              >
                Enter Dreamscape <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold tracking-wider uppercase text-sm hover:bg-white/10 transition">
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/5"
              >
                <p className="text-3xl sm:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  {s.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">Creative Intelligence</h2>
            <p className="text-gray-400 max-w-xl mx-auto">A complete creative systems platform for world-building, artifact generation, and visual storytelling.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-6">
                <Zap className="w-6 h-6 text-cyan-400" />
                <Layers className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white mb-4">Ready to Create?</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Step into Dreamscape and begin your journey through infinite creative dimensions. Your worlds await.
              </p>
              <button
                onClick={() => setLocation("/login")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold tracking-wider uppercase text-sm hover:opacity-90 transition shadow-lg shadow-cyan-500/25"
              >
                Begin Exploring
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-500">Dreamscape — SZL Holdings</span>
          </div>
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} SZL Holdings. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
