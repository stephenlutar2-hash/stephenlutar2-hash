import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, ChevronRight, Layers, Image, ArrowLeft,
  Search, Filter, Tag, BarChart3, Sparkles,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import { worlds, projects, getProjectsByWorld, getWorldById, getArtifactsByProject } from "@/data/demo";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function Explorer() {
  const loading = useSimulatedLoading();
  const params = useParams<{ worldId?: string }>();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  if (loading) return <AppShell><PageLoadingSkeleton /></AppShell>;

  const selectedWorld = params.worldId ? getWorldById(params.worldId) : null;
  const worldProjects = selectedWorld ? getProjectsByWorld(selectedWorld.id) : [];

  const allTags = Array.from(new Set(worlds.flatMap(w => w.tags)));
  const filteredWorlds = worlds.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || w.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (selectedWorld) {
    const activeCount = worldProjects.filter(p => p.status === "active").length;
    const totalArtifacts = worldProjects.reduce((sum, p) => sum + p.artifactCount, 0);

    return (
      <AppShell>
        <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setLocation("/explore")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Worlds
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden"
          >
            <img src={selectedWorld.thumbnail} alt={selectedWorld.name} className="w-full h-48 sm:h-64 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedWorld.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">{selectedWorld.name}</h2>
              <p className="text-sm text-gray-300 mt-1 max-w-2xl">{selectedWorld.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {selectedWorld.projectCount} projects</span>
                <span className="flex items-center gap-1"><Image className="w-3 h-3" /> {selectedWorld.artifactCount} artifacts</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <p className="text-lg font-bold text-cyan-400">{activeCount}</p>
              <p className="text-[10px] text-gray-500">Active</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <p className="text-lg font-bold text-purple-400">{totalArtifacts}</p>
              <p className="text-[10px] text-gray-500">Artifacts</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <p className="text-lg font-bold text-emerald-400">{worldProjects.length}</p>
              <p className="text-[10px] text-gray-500">Projects</p>
            </div>
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Projects</h3>
            {worldProjects.length === 0 ? (
              <div className="text-center py-16">
                <Layers className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">No projects in this world yet</p>
              </div>
            ) : (
              <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={containerVariants} initial="hidden" animate="visible">
                {worldProjects.map((p) => {
                  const projArtifacts = getArtifactsByProject(p.id);
                  return (
                    <motion.div
                      key={p.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                      className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-base font-display font-bold text-white">{p.name}</h4>
                          <p className="text-sm text-gray-400 mt-0.5">{p.description}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          p.status === "active" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                          p.status === "draft" ? "text-gray-400 bg-gray-500/10 border-gray-500/20" :
                          "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      {projArtifacts.length > 0 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto">
                          {projArtifacts.slice(0, 3).map(a => (
                            <img key={a.id} src={a.thumbnail} alt={a.title} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/10 hover:border-cyan-500/30 transition" />
                          ))}
                          {projArtifacts.length > 3 && (
                            <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              <span className="text-xs text-gray-400">+{projArtifacts.length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{p.artifactCount} artifacts</span>
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-cyan-500/40 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((projArtifacts.length / Math.max(p.artifactCount, 1)) * 100, 100)}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            World Explorer
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Navigate creative worlds and discover their projects</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-lg font-bold text-cyan-400">{worlds.length}</p>
            <p className="text-[10px] text-gray-500">Worlds</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-lg font-bold text-purple-400">{worlds.reduce((s, w) => s + w.projectCount, 0)}</p>
            <p className="text-[10px] text-gray-500">Total Projects</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-lg font-bold text-emerald-400">{worlds.reduce((s, w) => s + w.artifactCount, 0)}</p>
            <p className="text-[10px] text-gray-500">Total Artifacts</p>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search worlds..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                !selectedTag ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-white/5 text-gray-500 border-white/10 hover:border-white/20"
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                  selectedTag === tag ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-white/5 text-gray-500 border-white/10 hover:border-white/20"
                }`}
              >
                <Tag className="w-3 h-3 inline mr-1" />{tag}
              </button>
            ))}
          </div>
        </div>

        {filteredWorlds.length === 0 ? (
          <div className="text-center py-20">
            <Globe className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-display font-bold text-gray-500">No Worlds Found</h3>
            <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredWorlds.map((w) => (
              <motion.div
                key={w.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                onClick={() => setLocation(`/explore/${w.id}`)}
                className="group rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer"
              >
                <div className="aspect-video relative">
                  <img src={w.thumbnail} alt={w.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {w.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-gray-300 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-display font-bold text-white mb-1">{w.name}</h3>
                    <p className="text-xs text-gray-300 line-clamp-2">{w.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{w.projectCount} projects</span>
                      <span className="flex items-center gap-1"><Image className="w-3 h-3" />{w.artifactCount} artifacts</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AppShell>
  );
}
