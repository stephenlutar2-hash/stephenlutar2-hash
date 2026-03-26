import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Brain, CheckCircle2, AlertCircle,
  Beaker, BarChart3, Database, Tag, Clock, Sparkles
} from "lucide-react";

interface ExtractedCard {
  id: number;
  fileName: string;
  uploadedAt: string;
  status: "processing" | "completed" | "failed";
  findings: string[];
  methodology: string;
  datasets: string[];
  accuracy: number;
  keyMetrics: { label: string; value: string }[];
  tags: string[];
}

const sampleCards: ExtractedCard[] = [
  {
    id: 1,
    fileName: "transformer_anomaly_detection_v3.pdf",
    uploadedAt: "2026-03-24T14:30:00Z",
    status: "completed",
    findings: [
      "Cross-attention mechanism between sensor modalities improves detection accuracy by 4.2%",
      "Model achieves 96.3% accuracy on WADI industrial IoT benchmark",
      "Training convergence 2.3x faster than baseline LSTM approach",
      "Robust to up to 15% missing sensor data without degradation",
    ],
    methodology: "Supervised learning with cross-modal attention transformer architecture. Training on 3 industrial IoT datasets with 5-fold cross-validation. Comparison against 7 baseline methods including LSTM-AE, DeepAnT, and USAD.",
    datasets: ["WADI", "SWaT", "BATADAL"],
    accuracy: 96.3,
    keyMetrics: [
      { label: "F1 Score", value: "0.943" },
      { label: "Precision", value: "0.961" },
      { label: "Recall", value: "0.926" },
      { label: "Training Time", value: "4.2h" },
    ],
    tags: ["anomaly-detection", "transformer", "IoT"],
  },
  {
    id: 2,
    fileName: "maritime_route_optimization_review.pdf",
    uploadedAt: "2026-03-23T09:15:00Z",
    status: "completed",
    findings: [
      "GNN-based approaches outperform traditional optimization by 12-18% on fuel efficiency",
      "Reinforcement learning agents can adapt to real-time weather changes within 15 minutes",
      "Ensemble methods combining ML with classical optimization show best risk-adjusted performance",
    ],
    methodology: "Systematic literature review of 89 papers (2020-2026) on ML-driven maritime route optimization. Meta-analysis of reported fuel savings across different vessel types and routes.",
    datasets: ["AIS Historical Data", "NOAA Weather", "Lloyd's Port Data"],
    accuracy: 89.7,
    keyMetrics: [
      { label: "Avg Fuel Savings", value: "14.2%" },
      { label: "Papers Reviewed", value: "89" },
      { label: "Avg Route Improvement", value: "8.3%" },
      { label: "Coverage Period", value: "6 years" },
    ],
    tags: ["maritime", "optimization", "review"],
  },
  {
    id: 3,
    fileName: "multi_agent_orchestration_benchmark.pdf",
    uploadedAt: "2026-03-22T16:45:00Z",
    status: "completed",
    findings: [
      "Hierarchical agent architectures reduce task completion time by 34% vs flat orchestration",
      "Shared memory pools between agents improve cross-task coherence by 28%",
      "Agent specialization yields diminishing returns beyond 8 specialized agents per workflow",
    ],
    methodology: "Experimental benchmark comparing 5 multi-agent orchestration frameworks on 12 enterprise workflow scenarios. Evaluation metrics: task completion rate, latency, resource utilization, output quality.",
    datasets: ["Enterprise Workflow Benchmark Suite", "AgentBench v2"],
    accuracy: 91.2,
    keyMetrics: [
      { label: "Task Completion", value: "94.1%" },
      { label: "Avg Latency", value: "2.3s" },
      { label: "Quality Score", value: "8.7/10" },
      { label: "Frameworks Tested", value: "5" },
    ],
    tags: ["multi-agent", "orchestration", "benchmark"],
  },
];

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export default function DocumentIntelligence() {
  const [cards] = useState<ExtractedCard[]>(sampleCards);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div {...pageTransition} className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-3xl font-display font-bold text-white">Document Intelligence</h2>
        <p className="text-muted-foreground mt-1 text-sm">Upload research papers and reports — AI extracts key findings into structured experiment cards</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass-panel rounded-xl p-8 border-2 border-dashed transition-all cursor-pointer ${isDragging ? "border-cyan bg-cyan/5" : "border-white/10 hover:border-cyan/30"}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); }}
      >
        <div className="text-center">
          <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? "text-cyan" : "text-muted-foreground/40"}`} />
          <h3 className="text-sm font-semibold text-white mb-1">Drop Research Papers Here</h3>
          <p className="text-xs text-muted-foreground">Supports PDF, DOCX, and TXT — AI will extract findings, methodology, datasets, and metrics</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-[10px] font-mono text-muted-foreground bg-white/[0.03] px-2 py-1 rounded">.PDF</span>
            <span className="text-[10px] font-mono text-muted-foreground bg-white/[0.03] px-2 py-1 rounded">.DOCX</span>
            <span className="text-[10px] font-mono text-muted-foreground bg-white/[0.03] px-2 py-1 rounded">.TXT</span>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center gap-2 mb-2">
        <Database className="w-4 h-4 text-cyan" />
        <h3 className="font-display font-bold text-white">Extracted Experiment Cards</h3>
        <span className="text-xs font-mono text-muted-foreground ml-auto">{cards.length} documents processed</span>
      </div>

      <div className="space-y-4">
        {cards.map((card, idx) => {
          const isExpanded = expandedId === card.id;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.06 }}
              className="glass-panel rounded-xl overflow-hidden"
            >
              <div className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setExpandedId(isExpanded ? null : card.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-5 h-5 text-violet" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{card.fileName}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(card.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${card.status === "completed" ? "text-emerald bg-emerald/10 border-emerald/20" : card.status === "failed" ? "text-destructive bg-destructive/10 border-destructive/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"}`}>
                      {card.status === "completed" ? <CheckCircle2 className="w-3 h-3" /> : card.status === "failed" ? <AlertCircle className="w-3 h-3" /> : <Brain className="w-3 h-3 animate-pulse" />}
                      {card.status.toUpperCase()}
                    </span>
                    <span className="text-sm font-mono text-cyan font-bold">{card.accuracy}%</span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5">
                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {card.keyMetrics.map(m => (
                          <div key={m.label} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-center">
                            <p className="text-lg font-display font-bold text-white">{m.value}</p>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase">{m.label}</p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h5 className="text-xs font-mono text-muted-foreground uppercase mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-violet" /> Key Findings</h5>
                        <ul className="space-y-2">
                          {card.findings.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                              <span className="w-5 h-5 rounded bg-cyan/10 text-cyan text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-xs font-mono text-muted-foreground uppercase mb-2 flex items-center gap-1"><Beaker className="w-3 h-3 text-emerald" /> Methodology</h5>
                        <p className="text-sm text-foreground/70 leading-relaxed">{card.methodology}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div>
                          <h5 className="text-xs font-mono text-muted-foreground uppercase mb-1.5 flex items-center gap-1"><BarChart3 className="w-3 h-3 text-amber-400" /> Datasets</h5>
                          <div className="flex gap-2">{card.datasets.map(d => <span key={d} className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">{d}</span>)}</div>
                        </div>
                        <div>
                          <h5 className="text-xs font-mono text-muted-foreground uppercase mb-1.5 flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</h5>
                          <div className="flex gap-2">{card.tags.map(t => <span key={t} className="text-xs font-mono text-muted-foreground bg-white/[0.03] px-2 py-0.5 rounded">{t}</span>)}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
