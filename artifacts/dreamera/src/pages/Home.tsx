import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Map, Layers, Wand2, ArrowRight, Star, Brain } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Narrative Engine", desc: "AI-powered story generation that weaves complex narratives from your creative seeds" },
  { icon: Map, title: "Artifact Mapping", desc: "Visualize story arcs, character relationships, and world-building elements in real-time" },
  { icon: Layers, title: "Multi-Dimensional Stories", desc: "Build layered narratives with branching timelines and parallel storylines" },
  { icon: Wand2, title: "Creative Synthesis", desc: "Transform raw ideas into fully-realized story worlds with AI-assisted world-building" },
  { icon: Star, title: "Energy Breakthroughs", desc: "Discover hidden narrative connections and untapped story potential" },
  { icon: Brain, title: "Neural Rendering", desc: "Advanced AI renders your story elements into vivid, interconnected artifact maps" },
];

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold tracking-wider text-lg">DREAMERA</span>
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles className="w-3.5 h-3.5" /> Neural Storytelling Platform
            </div>
            <h1 className="text-5xl sm:text-7xl font-display font-black leading-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-violet-400">Stories That</span>
              <br />
              <span className="text-white">Dream Themselves</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              DreamEra is an AI-powered storytelling platform that renders artifact maps and discovers energy breakthroughs in narrative space. Transform your ideas into living, breathing story worlds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setLocation("/login")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-bold tracking-wider uppercase text-sm hover:opacity-90 transition shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
              >
                Enter DreamEra <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold tracking-wider uppercase text-sm hover:bg-white/10 transition">
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">Narrative Intelligence</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Every great story is a map of connections. DreamEra renders those connections visible.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-violet-400" />
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
          <div className="rounded-3xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20 p-12 text-center">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Ready to Dream?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Join the next generation of storytellers. Let DreamEra render your imagination into artifact maps that reveal the true structure of your stories.
            </p>
            <button
              onClick={() => setLocation("/login")}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-bold tracking-wider uppercase text-sm hover:opacity-90 transition shadow-lg shadow-violet-500/25"
            >
              Begin Your Story
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-gray-500">DreamEra — SZL Holdings</span>
          </div>
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} SZL Holdings. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
