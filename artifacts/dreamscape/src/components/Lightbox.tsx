import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
interface LightboxProps {
  artifact: any | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function Lightbox({ artifact, onClose, onPrev, onNext, hasPrev, hasNext }: LightboxProps) {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

  function handleCopyLink() {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const shareUrl = `${window.location.origin}${base}/gallery?artifact=${artifact!.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    const link = document.createElement("a");
    link.href = artifact!.thumbnail;
    link.download = `${artifact!.title.replace(/\s+/g, "-").toLowerCase()}.jpg`;
    link.target = "_blank";
    link.click();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-5xl w-full max-h-[90vh] flex flex-col lg:flex-row gap-6"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute -top-12 right-0 lg:top-0 lg:-right-12 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10">
            <X className="w-5 h-5" />
          </button>

          {hasPrev && (
            <button onClick={onPrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 hidden lg:flex p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {hasNext && (
            <button onClick={onNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 hidden lg:flex p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div className="flex-1 min-h-0">
            <img
              src={artifact.thumbnail}
              alt={artifact.title}
              className="w-full h-full max-h-[60vh] lg:max-h-[80vh] object-cover rounded-2xl"
            />
          </div>

          <div className="lg:w-80 space-y-4 overflow-y-auto">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">{artifact.title}</h2>
              <p className="text-sm text-gray-400 mt-1">{artifact.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase">
                {artifact.type}
              </span>
              {artifact.resolution && (
                <span className="text-xs text-gray-500">{artifact.resolution}</span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Heart className="w-3 h-3" /> {artifact.likes}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Prompt</p>
              <p className="text-sm text-gray-300 leading-relaxed">{artifact.prompt}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {artifact.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="text-xs text-gray-600">
              Created {new Date(artifact.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold hover:bg-cyan-500/20 transition"
              >
                <Download className="w-4 h-4" /> Export
              </button>
              <button
                onClick={() => setShowShare(!showShare)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold hover:bg-purple-500/20 transition"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            <AnimatePresence>
              {showShare && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Share this artifact</p>
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition text-left"
                    >
                      {copied ? "Link copied!" : "Copy link to clipboard"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
