import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2, Sparkles, Image, FileText, Box, Music, Video,
  ChevronDown, Loader2, CheckCircle2, Zap, Sliders,
  Palette, Eye, Layers, History, Copy, Star, Brush
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useWorlds, useProjects } from "@/hooks/useDreamscapeApi";

const PLACEHOLDER_RESULTS = [
  "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
];

type GenerationType = "image" | "text" | "3d" | "audio" | "video";

const typeConfig: Record<GenerationType, { icon: typeof Image; label: string; color: string }> = {
  image: { icon: Image, label: "Image", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  text: { icon: FileText, label: "Text", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  "3d": { icon: Box, label: "3D Model", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  audio: { icon: Music, label: "Audio", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  video: { icon: Video, label: "Video", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
};

const promptSuggestions = [
  "A crystalline palace floating above a sea of liquid starlight",
  "Ancient clockwork forest with trees made of brass and emerald",
  "Bioluminescent underwater city with coral-covered skyscrapers",
  "A volcanic temple where fire spirits perform an eternal dance",
  "Floating library islands connected by bridges of pure light",
  "A nebula nursery where new stars are born from cosmic dust",
];

const stylePresets = [
  { name: "Cinematic", icon: "🎬", desc: "Film-quality lighting and composition" },
  { name: "Ethereal", icon: "✨", desc: "Dreamy, soft, otherworldly atmosphere" },
  { name: "Cyberpunk", icon: "🌆", desc: "Neon-lit, high-tech, dystopian" },
  { name: "Watercolor", icon: "🎨", desc: "Soft, flowing, painterly strokes" },
  { name: "Surrealist", icon: "🌀", desc: "Dali-inspired, impossible geometry" },
  { name: "Art Nouveau", icon: "🌿", desc: "Organic curves, ornamental detail" },
];

interface GenerationResult {
  id: string;
  prompt: string;
  type: GenerationType;
  images: string[];
  timestamp: string;
  style?: string;
  params?: { creativity: number; detail: number; stylization: number };
}

interface PromptHistoryItem {
  prompt: string;
  timestamp: string;
  type: GenerationType;
  style?: string;
}

export default function PromptStudio() {
  const { data: worlds = [] } = useWorlds();
  const [prompt, setPrompt] = useState("");
  const [genType, setGenType] = useState<GenerationType>("image");
  const [selectedWorld, setSelectedWorld] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const genTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [creativity, setCreativity] = useState(70);
  const [detail, setDetail] = useState(80);
  const [stylization, setStylization] = useState(50);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([
    { prompt: "A crystalline palace floating above a sea of liquid starlight", timestamp: "2 hours ago", type: "image", style: "Ethereal" },
    { prompt: "Ancient clockwork forest with trees made of brass and emerald", timestamp: "4 hours ago", type: "image", style: "Cinematic" },
    { prompt: "Bioluminescent underwater city with coral-covered skyscrapers", timestamp: "Yesterday", type: "image" },
  ]);

  const { data: allProjects = [] } = useProjects();

  useEffect(() => () => { if (genTimer.current) clearTimeout(genTimer.current); }, []);
  useEffect(() => { if (worlds.length && !selectedWorld) setSelectedWorld(worlds[0].id); }, [worlds, selectedWorld]);

  const worldProjects = allProjects.filter((p: any) => p.worldId === selectedWorld);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setPromptHistory(prev => [{ prompt: prompt.trim(), timestamp: "Just now", type: genType, style: selectedStyle || undefined }, ...prev].slice(0, 20));

    genTimer.current = setTimeout(() => {
      const shuffled = [...PLACEHOLDER_RESULTS].sort(() => Math.random() - 0.5);
      const result: GenerationResult = {
        id: `gen-${Date.now()}`,
        prompt: prompt.trim(),
        type: genType,
        images: shuffled.slice(0, genType === "image" ? 4 : 1),
        timestamp: new Date().toISOString(),
        style: selectedStyle || undefined,
        params: { creativity, detail, stylization },
      };
      setResults(prev => [result, ...prev]);
      setGenerating(false);
    }, 2000 + Math.random() * 2000);
  }

  return (
    <AppShell>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`flex-1 space-y-6 ${showHistory ? "lg:max-w-[calc(100%-320px)]" : ""}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Prompt Studio
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Craft generation prompts and create artifacts</p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                showHistory ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              <History className="w-3.5 h-3.5" /> History
            </button>
          </div>

          <form onSubmit={handleGenerate} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(typeConfig) as GenerationType[]).map(type => {
                const config = typeConfig[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setGenType(type)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition ${
                      genType === type ? config.color : "bg-white/5 text-gray-500 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <config.icon className="w-3.5 h-3.5" /> {config.label}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe your vision... What world, scene, or artifact do you want to create?"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition text-sm resize-none"
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-gray-600">{prompt.length} chars</div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.slice(0, 3).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPrompt(s)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-gray-400 hover:text-white hover:border-white/20 transition truncate max-w-[200px]"
                  >
                    <Sparkles className="w-3 h-3 inline mr-1" />{s}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Generation Parameters</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-400 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-purple-400" />Creativity</label>
                    <span className="text-xs font-mono text-purple-400">{creativity}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={creativity} onChange={e => setCreativity(Number(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-purple-500/30" />
                  <div className="flex justify-between text-[9px] text-gray-600 mt-1"><span>Conservative</span><span>Wild</span></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-400 flex items-center gap-1.5"><Eye className="w-3 h-3 text-cyan-400" />Detail Level</label>
                    <span className="text-xs font-mono text-cyan-400">{detail}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={detail} onChange={e => setDetail(Number(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-cyan-500/30" />
                  <div className="flex justify-between text-[9px] text-gray-600 mt-1"><span>Abstract</span><span>Hyper-detailed</span></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-400 flex items-center gap-1.5"><Brush className="w-3 h-3 text-rose-400" />Stylization</label>
                    <span className="text-xs font-mono text-rose-400">{stylization}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={stylization} onChange={e => setStylization(Number(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-rose-500/30" />
                  <div className="flex justify-between text-[9px] text-gray-600 mt-1"><span>Photorealistic</span><span>Artistic</span></div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Style Transfer</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {stylePresets.map(style => (
                  <motion.button
                    key={style.name}
                    type="button"
                    onClick={() => setSelectedStyle(selectedStyle === style.name ? null : style.name)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedStyle === style.name
                        ? "bg-cyan-500/10 border-cyan-500/30 ring-1 ring-cyan-500/20"
                        : "bg-white/[0.02] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{style.icon}</span>
                      <span className="text-xs font-bold text-white">{style.name}</span>
                      {selectedStyle === style.name && <CheckCircle2 className="w-3 h-3 text-cyan-400 ml-auto" />}
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">{style.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              Advanced Options
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Target World</label>
                      <select
                        value={selectedWorld}
                        onChange={e => { setSelectedWorld(e.target.value); setSelectedProject(""); }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition appearance-none"
                      >
                        {worlds.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Target Project</label>
                      <select
                        value={selectedProject}
                        onChange={e => setSelectedProject(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition appearance-none"
                      >
                        <option value="">Auto-assign</option>
                        {worldProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={generating || !prompt.trim()}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-cyan-500/20"
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-4 h-4" /> Generate</>
                )}
              </button>
              {selectedStyle && (
                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-500/20">
                  Style: {selectedStyle}
                </span>
              )}
            </div>
          </form>

          {generating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Generating {genType}...</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Creativity {creativity}% | Detail {detail}% | Stylization {stylization}%
                    {selectedStyle && ` | ${selectedStyle}`}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "90%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-display font-bold text-white">Results</h3>
              {results.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{r.prompt}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500">
                          {new Date(r.timestamp).toLocaleString()} &middot; {r.type}
                        </span>
                        {r.style && (
                          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">{r.style}</span>
                        )}
                        {r.params && (
                          <span className="text-[9px] text-gray-600 font-mono">
                            C:{r.params.creativity} D:{r.params.detail} S:{r.params.stylization}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {r.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Result ${idx + 1}`}
                        className="w-full aspect-square object-cover rounded-xl border border-white/10 hover:border-cyan-500/30 transition cursor-pointer"
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {results.length === 0 && !generating && (
            <div className="text-center py-16">
              <Zap className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-display font-bold text-gray-500">No Generations Yet</h3>
              <p className="text-sm text-gray-600 mt-1">Enter a prompt above to start creating</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 overflow-hidden"
            >
              <div className="w-full lg:w-[300px] rounded-2xl bg-white/[0.02] border border-white/5 p-4 lg:sticky lg:top-20">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Prompt History</span>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin">
                  {promptHistory.map((item, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => { setPrompt(item.prompt); setGenType(item.type); if (item.style) setSelectedStyle(item.style); }}
                      className="w-full text-left p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-cyan-500/20 transition group"
                    >
                      <p className="text-xs text-white line-clamp-2 group-hover:text-cyan-400 transition">{item.prompt}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] text-gray-600">{item.timestamp}</span>
                        <span className="text-[9px] text-gray-600 uppercase">{item.type}</span>
                        {item.style && <span className="text-[9px] text-cyan-400/60">{item.style}</span>}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
