import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Globe, Layers, Wand2, Clock, TrendingUp, ArrowRight,
  Image, Compass, GitBranch, Sparkles, BarChart3, Zap, Eye,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import { worlds, artifacts, projects, generationHistory } from "@/data/demo";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Dashboard() {
  const loading = useSimulatedLoading();
  const [, setLocation] = useLocation();

  if (loading) return <AppShell><PageLoadingSkeleton /></AppShell>;

  const stats = [
    { label: "Worlds", value: worlds.length, icon: Globe, color: "from-cyan-500 to-blue-500", path: "/explore", trend: "+2" },
    { label: "Projects", value: projects.length, icon: Layers, color: "from-blue-500 to-indigo-500", path: "/explore", trend: "+5" },
    { label: "Artifacts", value: artifacts.length, icon: Image, color: "from-purple-500 to-violet-500", path: "/gallery", trend: "+12" },
    { label: "Generations", value: generationHistory.length, icon: Wand2, color: "from-emerald-500 to-teal-500", path: "/history", trend: "+3" },
  ];

  const recentArtifacts = [...artifacts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const recentHistory = [...generationHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const quickLinks = [
    { label: "Explore Worlds", icon: Compass, path: "/explore", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    { label: "Artifact Gallery", icon: Layers, path: "/gallery", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { label: "Hierarchy Map", icon: GitBranch, path: "/map", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { label: "Prompt Studio", icon: Wand2, path: "/studio", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  ];

  const completedCount = generationHistory.filter(g => g.status === "completed").length;
  const processingCount = generationHistory.filter(g => g.status === "processing").length;
  const failedCount = generationHistory.filter(g => g.status === "failed").length;
  const totalLikes = artifacts.reduce((sum, a) => sum + a.likes, 0);
  const avgDuration = Math.round(generationHistory.filter(g => g.duration).reduce((sum, g) => sum + (g.duration || 0), 0) / Math.max(generationHistory.filter(g => g.duration).length, 1));

  const activeProjects = projects.filter(p => p.status === "active").length;
  const draftProjects = projects.filter(p => p.status === "draft").length;

  return (
    <AppShell>
      <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Creative Command
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-mono text-gray-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full"><span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />SZL Portfolio · Gen Latency 1.2s</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Welcome to your creative workspace</p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={itemVariants}
              whileHover={{ scale: 1.03, borderColor: "rgba(6,182,212,0.3)" }}
              onClick={() => setLocation(s.path)}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-emerald-400/70 font-medium">{s.trend}</span>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Creative Activity</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] text-center">
              <p className="text-lg font-bold text-emerald-400">{completedCount}</p>
              <p className="text-[10px] text-gray-500">Completed</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] text-center">
              <p className="text-lg font-bold text-blue-400">{processingCount}</p>
              <p className="text-[10px] text-gray-500">Processing</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] text-center">
              <p className="text-lg font-bold text-red-400">{failedCount}</p>
              <p className="text-[10px] text-gray-500">Failed</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] text-center">
              <p className="text-lg font-bold text-pink-400">{totalLikes.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500">Total Likes</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] text-center">
              <p className="text-lg font-bold text-amber-400">{avgDuration}s</p>
              <p className="text-[10px] text-gray-500">Avg Duration</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] text-center">
              <p className="text-lg font-bold text-cyan-400">{activeProjects}/{projects.length}</p>
              <p className="text-[10px] text-gray-500">Active Projects</p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden flex">
            <motion.div className="bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${(completedCount / Math.max(generationHistory.length, 1)) * 100}%` }} transition={{ duration: 0.8 }} />
            <motion.div className="bg-blue-500" initial={{ width: 0 }} animate={{ width: `${(processingCount / Math.max(generationHistory.length, 1)) * 100}%` }} transition={{ duration: 0.8, delay: 0.1 }} />
            <motion.div className="bg-red-500" initial={{ width: 0 }} animate={{ width: `${(failedCount / Math.max(generationHistory.length, 1)) * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
          </div>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link, i) => (
            <motion.button
              key={link.path}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation(link.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${link.color} text-sm font-bold hover:opacity-80 transition`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </motion.button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
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
                  transition={{ delay: 0.3 + i * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setLocation("/gallery")}
                  className="group cursor-pointer rounded-xl overflow-hidden border border-white/5 hover:border-cyan-500/20 transition-all"
                >
                  <div className="aspect-video relative">
                    <img src={a.thumbnail} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-gray-300">
                        <Eye className="w-2.5 h-2.5" /> {a.likes}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-bold text-white truncate">{a.title}</p>
                      <p className="text-[10px] text-gray-400 truncate">{a.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
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
                  transition={{ delay: 0.3 + i * 0.05 }}
                  whileHover={{ x: 4 }}
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
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-gray-500">{h.worldName} &middot; {h.projectName}</p>
                        {h.duration && (
                          <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" /> {h.duration}s
                          </span>
                        )}
                      </div>
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
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-white">Active Worlds</h3>
            <button onClick={() => setLocation("/explore")} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {worlds.slice(0, 3).map((w, i) => {
              const worldProjects = projects.filter(p => p.worldId === w.id);
              const worldActiveProjects = worldProjects.filter(p => p.status === "active").length;
              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setLocation(`/explore/${w.id}`)}
                  className="group rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer"
                >
                  <div className="aspect-video relative">
                    <img src={w.thumbnail} alt={w.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="text-sm font-display font-bold text-white">{w.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] text-gray-300">{w.projectCount} projects &middot; {w.artifactCount} artifacts</p>
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-cyan-500/60 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(worldActiveProjects / Math.max(worldProjects.length, 1)) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
