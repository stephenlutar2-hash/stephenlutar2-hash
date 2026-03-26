import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock, CheckCircle2, Loader2, XCircle, Image,
  Search, Filter, Download, Share2, ExternalLink, Zap, BarChart3,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useSimulatedLoading, PageLoadingSkeleton } from "@/components/LoadingSkeleton";
import { generationHistory, type GenerationRecord } from "@/data/demo";

type StatusFilter = "all" | "completed" | "processing" | "failed";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function History() {
  const loading = useSimulatedLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (loading) return <AppShell><PageLoadingSkeleton /></AppShell>;

  const filtered = generationHistory
    .filter(h => {
      const matchesSearch = h.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.worldName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || h.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statusCounts = {
    all: generationHistory.length,
    completed: generationHistory.filter(h => h.status === "completed").length,
    processing: generationHistory.filter(h => h.status === "processing").length,
    failed: generationHistory.filter(h => h.status === "failed").length,
  };

  const avgDuration = Math.round(
    generationHistory.filter(g => g.duration).reduce((sum, g) => sum + (g.duration || 0), 0) /
    Math.max(generationHistory.filter(g => g.duration).length, 1)
  );

  function handleShare(id: string) {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    navigator.clipboard.writeText(`${window.location.origin}${base}/history?id=${id}`).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function handleDownload(result: string, prompt: string) {
    const link = document.createElement("a");
    link.href = result;
    link.download = `${prompt.slice(0, 30).replace(/\s+/g, "-")}.jpg`;
    link.target = "_blank";
    link.click();
  }

  return (
    <AppShell>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Generation History
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Timeline of all your creative generations</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {(["all", "completed", "processing", "failed"] as StatusFilter[]).map(s => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusFilter(s)}
              className={`p-3 rounded-xl border text-center transition ${
                statusFilter === s
                  ? s === "all" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                    s === "completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    s === "processing" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                    "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-white/[0.03] border-white/5 text-gray-500 hover:border-white/10"
              }`}
            >
              <p className="text-xl font-bold">{statusCounts[s]}</p>
              <p className="text-[10px] uppercase tracking-wider mt-0.5 capitalize">{s}</p>
            </motion.button>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-gray-400">Avg duration: <span className="text-white font-bold">{avgDuration}s</span></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-gray-400">Success rate: <span className="text-white font-bold">{Math.round((statusCounts.completed / Math.max(statusCounts.all, 1)) * 100)}%</span></span>
          </div>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search prompts or worlds..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-display font-bold text-gray-500">No Results</h3>
            <p className="text-sm text-gray-600 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/20 via-purple-500/20 to-transparent hidden sm:block" />

            <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
              {filtered.map((h) => (
                <motion.div
                  key={h.id}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="sm:pl-14 relative"
                >
                  <div className="absolute left-4 top-5 w-4 h-4 rounded-full border-2 hidden sm:block z-10
                    bg-background
                    border-current
                    " style={{
                      color: h.status === "completed" ? "rgb(52, 211, 153)" :
                             h.status === "processing" ? "rgb(96, 165, 250)" :
                             "rgb(248, 113, 113)"
                    }}
                  />

                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        h.status === "completed" ? "bg-emerald-500/10" :
                        h.status === "processing" ? "bg-blue-500/10" :
                        "bg-red-500/10"
                      }`}>
                        {h.status === "completed" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
                         h.status === "processing" ? <Loader2 className="w-5 h-5 text-blue-400 animate-spin" /> :
                         <XCircle className="w-5 h-5 text-red-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white leading-relaxed">{h.prompt}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-gray-500">
                          <span>{h.worldName}</span>
                          <span>&middot;</span>
                          <span>{h.projectName}</span>
                          <span>&middot;</span>
                          <span>{new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span>&middot;</span>
                          <span>{new Date(h.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                          {h.duration && (
                            <>
                              <span>&middot;</span>
                              <span className="flex items-center gap-0.5 text-amber-400/70"><Zap className="w-2.5 h-2.5" />{h.duration}s</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shrink-0 ${
                        h.status === "completed" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                        h.status === "processing" ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
                        "text-red-400 bg-red-500/10 border-red-500/20"
                      }`}>
                        {h.status}
                      </span>
                    </div>

                    {h.result && h.status === "completed" && (
                      <div className="mt-4 flex items-end gap-3">
                        <img src={h.result} alt="Result" className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border border-white/10 hover:border-cyan-500/30 transition" />
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownload(h.result!, h.prompt)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition"
                          >
                            <Download className="w-3 h-3" /> Export
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleShare(h.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition"
                          >
                            <Share2 className="w-3 h-3" /> {copiedId === h.id ? "Copied!" : "Share"}
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {h.status === "failed" && (
                      <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <p className="text-xs text-red-400">Generation failed. This could be due to content complexity or system load. Try again with a simpler prompt.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
