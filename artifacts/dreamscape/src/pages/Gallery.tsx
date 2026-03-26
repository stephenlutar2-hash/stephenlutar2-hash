import { useState, useEffect, useCallback } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Heart, Image as ImageIcon, SlidersHorizontal, BarChart3,
  Maximize2, X, ChevronLeft, ChevronRight, Download, Share2,
  Grid3x3, LayoutGrid, Columns
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { Loader2, AlertTriangle } from "lucide-react";
import Lightbox from "@/components/Lightbox";
import { useWorlds, useArtifacts } from "@/hooks/useDreamscapeApi";

type SortBy = "newest" | "popular" | "title";
type LayoutMode = "masonry" | "grid" | "list";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function Gallery() {
  const params = useParams<{ worldId?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorld, setSelectedWorld] = useState<string>(params.worldId || "all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [lightboxArtifact, setLightboxArtifact] = useState<any | null>(null);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [immersiveIndex, setImmersiveIndex] = useState(0);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("masonry");
  const { data: worlds = [], isLoading: wl, isError: we } = useWorlds();
  const { data: artifacts = [], isLoading: al, isError: ae } = useArtifacts();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const artifactId = urlParams.get("artifact");
    if (artifactId && artifacts.length) {
      const found = artifacts.find((a: any) => a.id === artifactId);
      if (found) setLightboxArtifact(found);
    }
  }, [artifacts]);

  if (wl || al) return <AppShell><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div></AppShell>;
  if (we || ae) return <AppShell><div className="flex flex-col items-center justify-center h-64 gap-3"><AlertTriangle className="w-8 h-8 text-amber-400" /><p className="text-gray-400">Failed to load gallery.</p></div></AppShell>;

  const filteredArtifacts = (selectedWorld === "all" ? artifacts : artifacts.filter((a: any) => a.worldId === selectedWorld))
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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!immersiveMode) return;
    if (e.key === "Escape") setImmersiveMode(false);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      setImmersiveIndex(prev => Math.min(prev + 1, filteredArtifacts.length - 1));
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      setImmersiveIndex(prev => Math.max(prev - 1, 0));
    }
  }, [immersiveMode, filteredArtifacts.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (loading) return <AppShell><PageLoadingSkeleton /></AppShell>;

  const currentIndex = lightboxArtifact ? filteredArtifacts.findIndex(a => a.id === lightboxArtifact.id) : -1;
  const totalLikes = filteredArtifacts.reduce((sum, a) => sum + a.likes, 0);
  const typeBreakdown = filteredArtifacts.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {} as Record<string, number>);

  function enterImmersive(index: number) {
    setImmersiveIndex(index);
    setImmersiveMode(true);
  }

  const layoutClasses: Record<LayoutMode, string> = {
    masonry: "columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4",
    grid: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4",
    list: "space-y-3",
  };

  return (
    <AppShell>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Artifact Gallery
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Browse and explore generated creative content</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                {([
                  { mode: "masonry" as LayoutMode, icon: Columns },
                  { mode: "grid" as LayoutMode, icon: Grid3x3 },
                  { mode: "list" as LayoutMode, icon: LayoutGrid },
                ]).map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setLayoutMode(mode)}
                    className={`p-2 transition ${layoutMode === mode ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-gray-500 hover:text-white"}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => { if (filteredArtifacts.length > 0) enterImmersive(0); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Immersive
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-gray-400"><span className="text-white font-bold">{filteredArtifacts.length}</span> artifacts</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs text-gray-400"><span className="text-white font-bold">{totalLikes.toLocaleString()}</span> likes</span>
          </div>
          {Object.entries(typeBreakdown).map(([type, count]) => (
            <div key={type} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="text-xs text-gray-400"><span className="text-white font-bold">{count}</span> {type}</span>
            </div>
          ))}
        </motion.div>

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
        ) : layoutMode === "list" ? (
          <motion.div className={layoutClasses.list} variants={containerVariants} initial="hidden" animate="visible">
            {filteredArtifacts.map((a, i) => (
              <motion.div
                key={a.id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition cursor-pointer"
                onClick={() => setLightboxArtifact(a)}
              >
                <img src={a.thumbnail} alt={a.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{a.title}</h3>
                  <p className="text-[11px] text-gray-500 line-clamp-1">{a.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {a.tags.slice(0, 3).map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-gray-500">#{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{a.likes}</span>
                  <button onClick={(e) => { e.stopPropagation(); enterImmersive(i); }} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className={layoutClasses[layoutMode]}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredArtifacts.map((a, i) => (
              <motion.div
                key={a.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`group ${layoutMode === "masonry" ? "break-inside-avoid" : ""} rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer`}
              >
                <div className="relative" onClick={() => setLightboxArtifact(a)}>
                  <img src={a.thumbnail} alt={a.title} className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${layoutMode === "grid" ? "aspect-square" : ""}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="text-sm font-display font-bold text-white">{a.title}</h3>
                    <p className="text-[10px] text-gray-300 mt-0.5 line-clamp-1">{a.description}</p>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs text-white">
                      <Heart className="w-3 h-3" /> {a.likes}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); enterImmersive(i); }}
                      className="p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
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
          </motion.div>
        )}
      </motion.div>

      <Lightbox
        artifact={lightboxArtifact}
        onClose={() => setLightboxArtifact(null)}
        onPrev={currentIndex > 0 ? () => setLightboxArtifact(filteredArtifacts[currentIndex - 1]) : undefined}
        onNext={currentIndex < filteredArtifacts.length - 1 ? () => setLightboxArtifact(filteredArtifacts[currentIndex + 1]) : undefined}
        hasPrev={currentIndex > 0}
        hasNext={currentIndex < filteredArtifacts.length - 1}
      />

      <AnimatePresence>
        {immersiveMode && filteredArtifacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <button
              onClick={() => setImmersiveMode(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute top-6 left-6 z-10">
              <p className="text-sm font-bold text-white">{filteredArtifacts[immersiveIndex]?.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{immersiveIndex + 1} / {filteredArtifacts.length}</p>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Arrow keys to navigate</span>
              <span className="text-[10px] text-gray-600">|</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">ESC to exit</span>
            </div>

            {immersiveIndex > 0 && (
              <button
                onClick={() => setImmersiveIndex(prev => prev - 1)}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {immersiveIndex < filteredArtifacts.length - 1 && (
              <button
                onClick={() => setImmersiveIndex(prev => prev + 1)}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={immersiveIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-w-[90vw] max-h-[85vh]"
              >
                <img
                  src={filteredArtifacts[immersiveIndex]?.thumbnail}
                  alt={filteredArtifacts[immersiveIndex]?.title}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg"
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {filteredArtifacts.slice(Math.max(0, immersiveIndex - 4), immersiveIndex + 5).map((a, i) => {
                const actualIndex = Math.max(0, immersiveIndex - 4) + i;
                return (
                  <button
                    key={a.id}
                    onClick={() => setImmersiveIndex(actualIndex)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                      actualIndex === immersiveIndex ? "border-cyan-400 opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                    }`}
                  >
                    <img src={a.thumbnail} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
