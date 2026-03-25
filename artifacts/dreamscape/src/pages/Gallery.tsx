import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import {
  Search, Heart, Image as ImageIcon, SlidersHorizontal
} from "lucide-react";
import AppShell from "@/components/AppShell";
import Lightbox from "@/components/Lightbox";
import { artifacts, worlds, getArtifactsByWorld, getArtifactById, type Artifact } from "@/data/demo";

type SortBy = "newest" | "popular" | "title";

export default function Gallery() {
  const params = useParams<{ worldId?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorld, setSelectedWorld] = useState<string>(params.worldId || "all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [lightboxArtifact, setLightboxArtifact] = useState<Artifact | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const artifactId = urlParams.get("artifact");
    if (artifactId) {
      const found = getArtifactById(artifactId);
      if (found) setLightboxArtifact(found);
    }
  }, []);

  const filteredArtifacts = (selectedWorld === "all" ? artifacts : getArtifactsByWorld(selectedWorld))
    .filter(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "popular") return b.likes - a.likes;
      return a.title.localeCompare(b.title);
    });

  const currentIndex = lightboxArtifact ? filteredArtifacts.findIndex(a => a.id === lightboxArtifact.id) : -1;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Artifact Gallery
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Browse and explore generated creative content</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search artifacts..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition"
            />
          </div>
          <select
            value={selectedWorld}
            onChange={e => setSelectedWorld(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition appearance-none cursor-pointer"
          >
            <option value="all">All Worlds</option>
            {worlds.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition appearance-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>

        {filteredArtifacts.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-display font-bold text-gray-500">No Artifacts Found</h3>
            <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredArtifacts.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setLightboxArtifact(a)}
                className="group break-inside-avoid rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer"
              >
                <div className="relative">
                  <img src={a.thumbnail} alt={a.title} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="text-sm font-display font-bold text-white">{a.title}</h3>
                    <p className="text-[10px] text-gray-300 mt-0.5 line-clamp-1">{a.description}</p>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white">
                      <Heart className="w-3 h-3" /> {a.likes}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/[0.02]">
                  <p className="text-sm font-medium text-white truncate">{a.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex gap-1.5">
                      {a.tags.slice(0, 2).map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-500">#{t}</span>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-600">{a.type}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Lightbox
        artifact={lightboxArtifact}
        onClose={() => setLightboxArtifact(null)}
        onPrev={currentIndex > 0 ? () => setLightboxArtifact(filteredArtifacts[currentIndex - 1]) : undefined}
        onNext={currentIndex < filteredArtifacts.length - 1 ? () => setLightboxArtifact(filteredArtifacts[currentIndex + 1]) : undefined}
        hasPrev={currentIndex > 0}
        hasNext={currentIndex < filteredArtifacts.length - 1}
      />
    </AppShell>
  );
}
