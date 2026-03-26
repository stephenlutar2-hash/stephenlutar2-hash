import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Globe, Layers, Wand2, Clock, TrendingUp, ArrowRight,
  Image, Compass, GitBranch, Sparkles
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { worlds, artifacts, projects, generationHistory } from "@/data/demo";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const stats = [
    { label: "Worlds", value: worlds.length, icon: Globe, color: "from-cyan-500 to-blue-500", path: "/explore" },
    { label: "Projects", value: projects.length, icon: Layers, color: "from-blue-500 to-indigo-500", path: "/explore" },
    { label: "Artifacts", value: artifacts.length, icon: Image, color: "from-purple-500 to-violet-500", path: "/gallery" },
    { label: "Generations", value: generationHistory.length, icon: Wand2, color: "from-emerald-500 to-teal-500", path: "/history" },
  ];

  const recentArtifacts = [...artifacts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const recentHistory = [...generationHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const quickLinks = [
    { label: "Explore Worlds", icon: Compass, path: "/explore", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    { label: "Artifact Gallery", icon: Layers, path: "/gallery", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { label: "Hierarchy Map", icon: GitBranch, path: "/map", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { label: "Prompt Studio", icon: Wand2, path: "/studio", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Creative Command
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-mono text-gray-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full"><span className="w-1 h-1 rounded-full bg-emerald-400" />SZL Portfolio · Gen Latency 1.2s</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Welcome to your creative workspace</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setLocation(s.path)}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map(link => (
            <button
              key={link.path}
              onClick={() => setLocation(link.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${link.color} text-sm font-bold hover:opacity-80 transition`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-white">Recent Artifacts</h3>
              <button onClick={() => setLocation("/gallery")} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recentArtifacts.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setLocation("/gallery")}
                  className="group cursor-pointer rounded-xl overflow-hidden border border-white/5 hover:border-cyan-500/20 transition-all"
                >
                  <div className="aspect-video relative">
                    <img src={a.thumbnail} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-bold text-white truncate">{a.title}</p>
                      <p className="text-[10px] text-gray-400 truncate">{a.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-white">Recent Activity</h3>
              <button onClick={() => setLocation("/history")} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {recentHistory.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      h.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                      h.status === "processing" ? "bg-blue-500/10 text-blue-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>
                      {h.status === "completed" ? <Sparkles className="w-4 h-4" /> :
                       h.status === "processing" ? <Clock className="w-4 h-4" /> :
                       <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{h.prompt.slice(0, 60)}...</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{h.worldName} &middot; {h.projectName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      h.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      h.status === "processing" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {h.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-white">Active Worlds</h3>
            <button onClick={() => setLocation("/explore")} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {worlds.slice(0, 3).map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setLocation(`/explore/${w.id}`)}
                className="group rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer"
              >
                <div className="aspect-video relative">
                  <img src={w.thumbnail} alt={w.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="text-sm font-display font-bold text-white">{w.name}</h4>
                    <p className="text-[10px] text-gray-300 mt-0.5">{w.projectCount} projects &middot; {w.artifactCount} artifacts</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
