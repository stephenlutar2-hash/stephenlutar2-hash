import { motion } from "framer-motion";
import { Palette, Wand2, CheckCircle2, Clock, Eye, Sparkles, Layers, Brain, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { usePipelineItems } from "@/hooks/useDreamscapeApi";

const pipelineStages = [
  { id: "concept", label: "Concept", icon: Brain, color: "text-purple-400" },
  { id: "generation", label: "Generation", icon: Wand2, color: "text-cyan-400" },
  { id: "refinement", label: "Refinement", icon: Sparkles, color: "text-amber-400" },
  { id: "review", label: "Review", icon: Eye, color: "text-blue-400" },
  { id: "published", label: "Published", icon: CheckCircle2, color: "text-emerald-400" },
];

const stageColor = (stage: string) => {
  const colors: Record<string, string> = { concept: "bg-purple-500/10 text-purple-400 border-purple-500/20", generation: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", refinement: "bg-amber-500/10 text-amber-400 border-amber-500/20", review: "bg-blue-500/10 text-blue-400 border-blue-500/20", published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
  return colors[stage] || "";
};

export default function CreativePipeline() {
  const { data: assets = [], isLoading, isError } = usePipelineItems();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center gap-3">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
        <p className="text-gray-400">Failed to load pipeline data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">AI-Powered Asset Creation Workflow</p>
          <h1 className="text-3xl font-bold tracking-tight">Creative Asset Pipeline</h1>
          <p className="text-gray-400 text-sm mt-1">Track AI-generated creative assets from concept through publication with quality metrics</p>
        </div>

        <div className="flex items-center justify-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-xl overflow-x-auto">
          {pipelineStages.map((stage, i) => {
            const Icon = stage.icon;
            const count = assets.filter((a: any) => a.stage === stage.id).length;
            return (
              <div key={stage.id} className="flex items-center gap-2">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-1 min-w-[80px]">
                  <div className={`w-10 h-10 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stage.color}`} />
                  </div>
                  <span className={`text-xs font-medium ${stage.color}`}>{stage.label}</span>
                  <span className="text-[10px] font-mono text-gray-500">{count} asset{count !== 1 ? "s" : ""}</span>
                </motion.div>
                {i < pipelineStages.length - 1 && <ArrowRight className="w-4 h-4 text-gray-600 shrink-0" />}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Assets", value: `${assets.length}`, icon: Layers, color: "text-cyan-400" },
            { label: "Published", value: `${assets.filter(a => a.stage === "published").length}`, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Total Variations", value: `${assets.reduce((s, a) => s + a.variations, 0)}`, icon: Palette, color: "text-purple-400" },
            { label: "Avg Quality", value: `${Math.round(assets.filter(a => a.quality > 0).reduce((s, a) => s + a.quality, 0) / assets.filter(a => a.quality > 0).length)}%`, icon: Sparkles, color: "text-amber-400" },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-gray-500 uppercase">{m.label}</p>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          {assets.map((asset, idx) => (
            <motion.div key={asset.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + idx * 0.05 }} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">{asset.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{asset.type} · {asset.timeToComplete}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${stageColor(asset.stage)}`}>{asset.stage}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">{asset.description}</p>
              <div className="flex items-center gap-6 mb-3">
                <div className="text-center"><p className="text-sm font-bold text-white">{asset.prompts}</p><p className="text-[9px] text-gray-500">Prompts</p></div>
                <div className="text-center"><p className="text-sm font-bold text-cyan-400">{asset.variations}</p><p className="text-[9px] text-gray-500">Variations</p></div>
                <div className="text-center"><p className="text-sm font-bold text-emerald-400">{asset.selectedFinal}</p><p className="text-[9px] text-gray-500">Selected</p></div>
                {asset.quality > 0 && <div className="text-center"><p className={`text-sm font-bold ${asset.quality >= 90 ? "text-emerald-400" : "text-amber-400"}`}>{asset.quality}%</p><p className="text-[9px] text-gray-500">Quality</p></div>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {asset.tags.map(t => <span key={t} className="text-[10px] font-mono text-gray-500 bg-white/[0.03] px-2 py-0.5 rounded">{t}</span>)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
