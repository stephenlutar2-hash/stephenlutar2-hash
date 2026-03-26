import { useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sparkles, BookOpen, Map, Layers, Wand2, ArrowRight, Star, Brain, Palette, PenTool, Lightbulb, Zap } from "lucide-react";

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

const features = [
  { icon: BookOpen, title: "Narrative Engine", desc: "AI-powered story generation that weaves complex narratives from your creative seeds" },
  { icon: Map, title: "Artifact Mapping", desc: "Visualize story arcs, character relationships, and world-building elements in real-time" },
  { icon: Layers, title: "Multi-Dimensional Stories", desc: "Build layered narratives with branching timelines and parallel storylines" },
  { icon: Wand2, title: "Creative Synthesis", desc: "Transform raw ideas into fully-realized story worlds with AI-assisted world-building" },
  { icon: Star, title: "Energy Breakthroughs", desc: "Discover hidden narrative connections and untapped story potential" },
  { icon: Brain, title: "Neural Rendering", desc: "Advanced AI renders your story elements into vivid, interconnected artifact maps" },
];

const processSteps = [
  { step: "01", title: "Seed Your Idea", desc: "Start with a concept, character, or world fragment. DreamEra's neural engine interprets your creative intent.", icon: Lightbulb, color: "from-violet-500 to-purple-600" },
  { step: "02", title: "Map the Narrative", desc: "Watch as AI weaves connections between story elements, building artifact maps of your narrative universe.", icon: PenTool, color: "from-blue-500 to-cyan-500" },
  { step: "03", title: "Render & Refine", desc: "Neural rendering brings your story to life with rich detail, branching paths, and interconnected world-building.", icon: Palette, color: "from-fuchsia-500 to-violet-500" },
  { step: "04", title: "Publish & Share", desc: "Export your completed narratives, share artifact maps, and collaborate with other storytellers.", icon: Zap, color: "from-amber-500 to-orange-500" },
];

const showcaseStories = [
  { title: "The Obsidian Chronicles", genre: "Sci-Fi / Consciousness", energy: 92, artifacts: 24, color: "from-violet-600 to-indigo-700" },
  { title: "Nebula's Whisper", genre: "Space Opera", energy: 67, artifacts: 16, color: "from-blue-600 to-cyan-700" },
  { title: "The Artifact Protocol", genre: "Mystery / Adventure", energy: 98, artifacts: 31, color: "from-emerald-600 to-teal-700" },
];

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold tracking-wider text-lg">DREAMERA</span>
          </div>
          <button
            onClick={() => setLocation("/login")}
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition touch-target"
          >
            Sign In
          </button>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-fuchsia-500/5 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" /> Neural Storytelling Platform
            </motion.div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black leading-[1.05] mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-violet-400">Stories That</span>
              <br />
              <span className="text-white">Dream Themselves</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              DreamEra is an AI-powered storytelling platform that renders artifact maps and discovers energy breakthroughs in narrative space. Transform your ideas into living, breathing story worlds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setLocation("/login")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-bold tracking-wider uppercase text-sm hover:opacity-90 transition shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
              >
                Enter DreamEra <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setLocation("/login")} className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold tracking-wider uppercase text-sm hover:bg-white/10 transition">
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-6 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
          {[
            { label: "Stories Created", value: "2,400+" },
            { label: "Artifact Maps", value: "18K+" },
            { label: "Neural Models", value: "6" },
            { label: "Avg Energy Score", value: "87%" },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{stat.value}</span>
              <span className="text-[11px] text-gray-500 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-violet-400/70 mb-3">Capabilities</p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">Narrative Intelligence</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Every great story is a map of connections. DreamEra renders those connections visible.</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.08}>
                <div className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300 h-full">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-violet-500/20 transition-all duration-300">
                    <f.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
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
              <p className="text-xs uppercase tracking-[0.25em] text-violet-400/70 mb-3">Workflow</p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">From Idea to Artifact</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Four seamless steps transform raw creative intent into fully-realized narrative universes.</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, i) => (
              <AnimatedSection key={step.step} delay={i * 0.12}>
                <div className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 transition-all duration-300 h-full">
                  <div className="text-[40px] font-display font-black text-white/[0.04] absolute top-3 right-4 leading-none">{step.step}</div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-display font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.25em] text-violet-400/70 mb-3">Showcase</p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">Featured Narratives</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Explore stories crafted with DreamEra's neural storytelling engine.</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {showcaseStories.map((story, i) => (
              <AnimatedSection key={story.title} delay={i * 0.1}>
                <div className="group rounded-2xl overflow-hidden border border-white/5 hover:border-violet-500/20 transition-all duration-300">
                  <div className={`h-36 bg-gradient-to-br ${story.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-4 left-4 right-4 h-2 rounded bg-white/30" />
                      <div className="absolute top-8 left-4 w-2/5 h-1.5 rounded bg-white/20" />
                      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-1.5">
                        {[...Array(8)].map((_, j) => <div key={j} className="h-6 rounded bg-white/10" />)}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur text-[10px] text-white/80 font-bold uppercase tracking-wider">
                      {story.genre}
                    </div>
                  </div>
                  <div className="p-5 bg-white/[0.02]">
                    <h3 className="font-display font-bold text-white text-lg mb-3">{story.title}</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Star className="w-3 h-3 text-violet-400" />
                        <span>{story.energy}% energy</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Map className="w-3 h-3 text-blue-400" />
                        <span>{story.artifacts} artifacts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 text-violet-400 mx-auto mb-6" />
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
