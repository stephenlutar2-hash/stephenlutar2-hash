import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, ChevronRight, Layers, Image, ArrowLeft,
  Search, Filter, Tag
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { worlds, projects, getProjectsByWorld, getWorldById, getArtifactsByProject } from "@/data/demo";

export default function Explorer() {
  const params = useParams<{ worldId?: string }>();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const selectedWorld = params.worldId ? getWorldById(params.worldId) : null;
  const worldProjects = selectedWorld ? getProjectsByWorld(selectedWorld.id) : [];

  const allTags = Array.from(new Set(worlds.flatMap(w => w.tags)));
  const filteredWorlds = worlds.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || w.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (selectedWorld) {
    return (
      <AppShell>
        <div className="space-y-6">
          <button
            onClick={() => setLocation("/explore")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Worlds
          </button>

          <div className="relative rounded-2xl overflow-hidden">
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
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Projects</h3>
            {worldProjects.length === 0 ? (
              <div className="text-center py-16">
                <Layers className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">No projects in this world yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {worldProjects.map((p, i) => {
                  const projArtifacts = getArtifactsByProject(p.id);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
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
                            <img key={a.id} src={a.thumbnail} alt={a.title} className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/10" />
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
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            World Explorer
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Navigate creative worlds and discover their projects</p>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorlds.map((w, i) => (
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
          </div>
        )}
      </div>
    </AppShell>
  );
}
