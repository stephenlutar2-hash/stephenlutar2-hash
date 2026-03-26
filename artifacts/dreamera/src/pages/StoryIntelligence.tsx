import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Brain, BarChart3, Wand2, TrendingUp, MessageSquare, Heart, Mic, MicOff, Loader2, FileText } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const stories = [
  {
    id: 1, title: "The Last Algorithm", genre: "Sci-Fi Thriller", wordCount: 42000, status: "In Progress",
    scores: { plot: 87, character: 82, dialogue: 91, pacing: 78, worldBuilding: 94, originality: 88 },
    aiNotes: "Strong world-building foundation with compelling premise. Pacing dips in Act 2 chapters 8-11 — recommend tightening the investigation sequence. Dialogue quality is excellent, particularly the AI ethics debates between Dr. Chen and ARIA. Character arc for Marcus needs more emotional grounding before the climax.",
    themes: ["AI consciousness", "Ethics of creation", "Power dynamics", "Human identity"],
  },
  {
    id: 2, title: "Beneath the Copper Sky", genre: "Fantasy Adventure", wordCount: 68000, status: "Draft Complete",
    scores: { plot: 92, character: 89, dialogue: 85, pacing: 88, worldBuilding: 96, originality: 91 },
    aiNotes: "Exceptional world-building with the floating copper archipelago. Plot structure follows a strong hero's journey with surprising twists in the third act. Minor dialogue flatness in chapters 3-5 when exposition is heavy — consider weaving information through action scenes instead of conversation.",
    themes: ["Found family", "Environmental stewardship", "Coming of age", "Cultural preservation"],
  },
];

const radarData = (scores: Record<string, number>) => Object.entries(scores).map(([key, value]) => ({ metric: key.replace(/([A-Z])/g, " $1").trim(), value }));

type VoiceState = "idle" | "recording" | "processing" | "done";

function VoiceToStory() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [generatedStory, setGeneratedStory] = useState<{ title: string; excerpt: string; themes: string[]; wordEstimate: number } | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(() => {
    setVoiceState("recording");
    setRecordDuration(0);
    setTranscript("");
    setGeneratedStory(null);
    timerRef.current = setInterval(() => setRecordDuration(d => d + 1), 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setVoiceState("processing");

    setTimeout(() => {
      setTranscript("A young cartographer discovers that the maps she draws at night come alive by morning. Each sketch she creates in her sleep transforms into a real landscape somewhere on the floating copper archipelago. But when she accidentally draws a crack through the sky, she must journey into her own dreamscapes to mend the fabric of reality before it fractures completely. Along the way, she encounters echo-people — reflections of the characters she's drawn — who may hold the key to understanding why her art has power over the physical world.");
      setVoiceState("done");

      setTimeout(() => {
        setGeneratedStory({
          title: "The Cartographer's Dream",
          excerpt: "Elara's charcoal trembled against the parchment, drawing lines she didn't consciously guide. The copper light of three moons filtered through the observatory window, casting prismatic shadows across her sleeping quarters. By morning, where there had been only ocean between the Amber Spire and the Driftwood Markets, a new island would rise — complete with forests, rivers, and ruins that felt ancient despite being hours old.",
          themes: ["Creative power", "Dream vs reality", "Responsibility of creation", "Self-discovery"],
          wordEstimate: 45000,
        });
      }, 1000);
    }, 2000);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2"><Mic className="w-4 h-4 text-purple-400" /> Voice-to-Story</h3>
      <p className="text-xs text-gray-500">Speak your story concept aloud. AI transcribes, analyzes themes, and generates a story opening.</p>

      <div className="flex flex-col items-center gap-4 py-4">
        <motion.button
          onClick={voiceState === "recording" ? stopRecording : startRecording}
          disabled={voiceState === "processing"}
          animate={voiceState === "recording" ? { scale: [1, 1.1, 1] } : {}}
          transition={voiceState === "recording" ? { duration: 1, repeat: Infinity } : {}}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            voiceState === "recording"
              ? "bg-red-500/20 border-2 border-red-500 text-red-400"
              : voiceState === "processing"
              ? "bg-purple-500/20 border-2 border-purple-500/50 text-purple-400 cursor-wait"
              : "bg-white/[0.03] border-2 border-white/10 text-gray-400 hover:border-purple-500/50 hover:text-purple-400"
          }`}
        >
          {voiceState === "processing" ? <Loader2 className="w-8 h-8 animate-spin" /> : voiceState === "recording" ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </motion.button>

        <p className="text-xs text-gray-500">
          {voiceState === "idle" && "Tap to start recording your story concept"}
          {voiceState === "recording" && `Recording... ${recordDuration}s — tap to stop`}
          {voiceState === "processing" && "Transcribing and generating story..."}
          {voiceState === "done" && "Recording complete — story generated"}
        </p>

        {voiceState === "recording" && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div key={i} animate={{ height: [4, 8 + Math.random() * 16, 4] }} transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }} className="w-1 bg-red-400 rounded-full" />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {transcript && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
            <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Transcript</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{transcript}</p>
          </motion.div>
        )}

        {generatedStory && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-purple-400 flex items-center gap-2"><Wand2 className="w-4 h-4" /> {generatedStory.title}</h4>
              <span className="text-[10px] font-mono text-gray-500">~{generatedStory.wordEstimate.toLocaleString()} words est.</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed italic">"{generatedStory.excerpt}"</p>
            <div className="flex flex-wrap gap-2">
              {generatedStory.themes.map(t => <span key={t} className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20">{t}</span>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StoryIntelligence() {
  const [selectedStory, setSelectedStory] = useState(0);
  const [activeTab, setActiveTab] = useState<"analysis" | "voice">("analysis");
  const story = stories[selectedStory];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">AI-Powered Narrative Engine</p>
          <h1 className="text-3xl font-bold tracking-tight">Story Intelligence</h1>
          <p className="text-gray-400 text-sm mt-1">Deep narrative analysis, quality scoring, and voice-to-story generation</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTab("analysis")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "analysis" ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" : "bg-white/[0.03] text-gray-500 border border-white/5 hover:text-white"}`}>
            <FileText className="w-4 h-4 inline mr-1.5" />Story Analysis
          </button>
          <button onClick={() => setActiveTab("voice")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "voice" ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" : "bg-white/[0.03] text-gray-500 border border-white/5 hover:text-white"}`}>
            <Mic className="w-4 h-4 inline mr-1.5" />Voice-to-Story
          </button>
        </div>

        {activeTab === "voice" ? (
          <VoiceToStory />
        ) : (
          <>
            <div className="flex items-center gap-2">
              {stories.map((s, i) => (
                <button key={s.id} onClick={() => setSelectedStory(i)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedStory === i ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "bg-white/[0.03] text-gray-500 border border-white/5 hover:text-white"}`}>
                  {s.title}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Overall Score", value: `${Math.round(Object.values(story.scores).reduce((a, b) => a + b, 0) / Object.keys(story.scores).length)}%`, icon: Brain, color: "text-purple-400" },
                { label: "Word Count", value: story.wordCount.toLocaleString(), icon: BookOpen, color: "text-cyan-400" },
                { label: "Genre", value: story.genre, icon: Sparkles, color: "text-amber-400" },
                { label: "Status", value: story.status, icon: TrendingUp, color: "text-emerald-400" },
              ].map((m, i) => (
                <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-gray-500 uppercase">{m.label}</p>
                    <m.icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-400" /> Quality Radar</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData(story.scores)}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} />
                      <Radar dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Wand2 className="w-4 h-4 text-purple-400" /> AI Editorial Notes</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">{story.aiNotes}</p>
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> Core Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {story.themes.map(t => <span key={t} className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20">{t}</span>)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-cyan-400" /> Score Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(story.scores).map(([k, v]) => (
                  <div key={k} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                    <p className={`text-2xl font-bold ${v >= 90 ? "text-emerald-400" : v >= 80 ? "text-cyan-400" : "text-amber-400"}`}>{v}</p>
                    <p className="text-[9px] text-gray-500 uppercase mt-1">{k.replace(/([A-Z])/g, " $1").trim()}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
