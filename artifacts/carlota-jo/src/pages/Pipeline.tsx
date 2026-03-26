import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, DollarSign, Users, ArrowRight, Clock,
  TrendingUp, ChevronDown, ChevronUp, Plus, GripVertical
} from "lucide-react";
import { Link } from "wouter";

interface Deal {
  id: number;
  company: string;
  contact: string;
  value: number;
  stage: string;
  probability: number;
  lastActivity: string;
  service: string;
  notes: string;
}

const stages = [
  { id: "prospect", label: "Prospect", color: "border-blue-500/30 bg-blue-500/5", textColor: "text-blue-400", probability: 20 },
  { id: "qualified", label: "Qualified", color: "border-purple-500/30 bg-purple-500/5", textColor: "text-purple-400", probability: 40 },
  { id: "proposal", label: "Proposal", color: "border-amber-500/30 bg-amber-500/5", textColor: "text-amber-400", probability: 60 },
  { id: "negotiation", label: "Negotiation", color: "border-cyan-500/30 bg-cyan-500/5", textColor: "text-cyan-400", probability: 75 },
  { id: "won", label: "Won", color: "border-emerald-500/30 bg-emerald-500/5", textColor: "text-emerald-400", probability: 100 },
  { id: "lost", label: "Lost", color: "border-red-500/30 bg-red-500/5", textColor: "text-red-400", probability: 0 },
];

const initialDeals: Deal[] = [
  { id: 1, company: "Meridian Capital Partners", contact: "Victoria Ashworth-Reid", value: 450000, stage: "negotiation", probability: 75, lastActivity: "2026-03-24", service: "Portfolio Optimization", notes: "Final pricing discussion scheduled for March 28" },
  { id: 2, company: "Apex Digital Holdings", contact: "Marcus Chen", value: 280000, stage: "proposal", probability: 60, lastActivity: "2026-03-23", service: "Technology Transformation", notes: "Proposal sent — awaiting board review" },
  { id: 3, company: "Silverstone Group", contact: "Catherine Blackwell", value: 820000, stage: "qualified", probability: 40, lastActivity: "2026-03-22", service: "M&A Advisory", notes: "Initial discovery call completed — strong interest in acquisition support" },
  { id: 4, company: "Atlas Family Office", contact: "James Harrington III", value: 350000, stage: "prospect", probability: 20, lastActivity: "2026-03-21", service: "Risk & Compliance", notes: "Inbound inquiry via website — scheduled intro call" },
  { id: 5, company: "Pinnacle Ventures", contact: "Sarah Goldman", value: 190000, stage: "won", probability: 100, lastActivity: "2026-03-20", service: "Growth Strategy", notes: "Engagement signed — kickoff April 1" },
  { id: 6, company: "Nordic Shipping AS", contact: "Erik Johansen", value: 520000, stage: "negotiation", probability: 70, lastActivity: "2026-03-19", service: "Strategic Advisory", notes: "Negotiating scope expansion to include fleet optimization" },
  { id: 7, company: "Quantum Analytics", contact: "Dr. Lisa Park", value: 160000, stage: "proposal", probability: 55, lastActivity: "2026-03-18", service: "Technology Transformation", notes: "Competitive situation with McKinsey — differentiating on implementation depth" },
  { id: 8, company: "Hartford Industries", contact: "Robert Martinez", value: 95000, stage: "lost", probability: 0, lastActivity: "2026-03-15", service: "Growth Strategy", notes: "Lost to internal team decision — maintain relationship for future" },
];

export default function Pipeline() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [view, setView] = useState<"board" | "list">("board");
  const [draggedDeal, setDraggedDeal] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [moveToast, setMoveToast] = useState<string | null>(null);

  const moveDeal = useCallback((dealId: number, newStage: string) => {
    const stageConfig = stages.find(s => s.id === newStage);
    setDeals(prev => prev.map(d => {
      if (d.id !== dealId) return d;
      const today = new Date().toISOString().split("T")[0];
      return { ...d, stage: newStage, probability: stageConfig?.probability ?? d.probability, lastActivity: today };
    }));
    const deal = deals.find(d => d.id === dealId);
    if (deal && deal.stage !== newStage) {
      const fromLabel = stages.find(s => s.id === deal.stage)?.label;
      const toLabel = stageConfig?.label;
      setMoveToast(`${deal.company} moved from ${fromLabel} → ${toLabel}`);
      setTimeout(() => setMoveToast(null), 3000);
    }
  }, [deals]);

  const handleDragStart = (e: React.DragEvent, dealId: number) => {
    setDraggedDeal(dealId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(dealId));
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const dealId = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (dealId) moveDeal(dealId, stageId);
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const totalPipeline = deals.filter(d => !["won", "lost"].includes(d.stage)).reduce((sum, d) => sum + d.value, 0);
  const weightedPipeline = deals.filter(d => !["won", "lost"].includes(d.stage)).reduce((sum, d) => sum + d.value * d.probability / 100, 0);
  const wonRevenue = deals.filter(d => d.stage === "won").reduce((sum, d) => sum + d.value, 0);
  const dealCount = deals.filter(d => !["won", "lost"].includes(d.stage)).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground font-serif">CJ</span>
            </div>
            <span className="font-serif text-lg font-semibold">Pipeline</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/meeting-intelligence" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Meetings</Link>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">CRM Pipeline</h1>
          <p className="text-muted-foreground">Drag and drop deals between stages to update pipeline status</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Pipeline", value: `$${(totalPipeline / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-primary" },
            { label: "Weighted Forecast", value: `$${(weightedPipeline / 1000).toFixed(0)}K`, icon: TrendingUp, color: "text-emerald-400" },
            { label: "Won Revenue", value: `$${(wonRevenue / 1000).toFixed(0)}K`, icon: Briefcase, color: "text-cyan-400" },
            { label: "Active Deals", value: `${dealCount}`, icon: Users, color: "text-purple-400" },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{m.label}</p>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6">
          {(["board", "list"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === v ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground border border-border hover:text-foreground"}`}>
              {v === "board" ? "Board View" : "List View"}
            </button>
          ))}
        </div>

        {view === "board" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
            {stages.map(stage => {
              const stageDeals = deals.filter(d => d.stage === stage.id);
              const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);
              const isOver = dragOverStage === stage.id;
              return (
                <div
                  key={stage.id}
                  className={`rounded-xl border ${stage.color} p-3 min-h-[200px] transition-all duration-200 ${isOver ? "ring-2 ring-primary/40 scale-[1.02]" : ""}`}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${stage.textColor}`}>{stage.label}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground">{stageDeals.length}</span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mb-3">${(stageTotal / 1000).toFixed(0)}K</p>
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {stageDeals.map(deal => (
                        <motion.div
                          key={deal.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: draggedDeal === deal.id ? 0.5 : 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          draggable
                          onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, deal.id)}
                          onDragEnd={handleDragEnd}
                          className="p-3 rounded-lg bg-card border border-border cursor-grab active:cursor-grabbing hover:border-primary/20 transition-colors select-none"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-xs font-semibold text-foreground leading-tight">{deal.company}</p>
                            <GripVertical className="w-3 h-3 text-muted-foreground/30" />
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-2">{deal.contact}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-primary font-bold">${(deal.value / 1000).toFixed(0)}K</span>
                            <span className="text-[10px] text-muted-foreground">{deal.probability}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-card border-b border-border">
                <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Stage</th>
                  <th className="px-5 py-3">Value</th>
                  <th className="px-5 py-3">Probability</th>
                  <th className="px-5 py-3">Move</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deals.map(deal => {
                  const stage = stages.find(s => s.id === deal.stage);
                  const currentIdx = stages.findIndex(s => s.id === deal.stage);
                  return (
                    <tr key={deal.id} className="hover:bg-card/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold">{deal.company}</p>
                        <p className="text-xs text-muted-foreground">{deal.contact}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{deal.service}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${stage?.color}`}>{stage?.label}</span>
                      </td>
                      <td className="px-5 py-3 text-sm font-mono text-primary font-bold">${(deal.value / 1000).toFixed(0)}K</td>
                      <td className="px-5 py-3 text-sm font-mono">{deal.probability}%</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          {currentIdx > 0 && (
                            <button onClick={() => moveDeal(deal.id, stages[currentIdx - 1].id)} className="text-[10px] px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground">← {stages[currentIdx - 1].label}</button>
                          )}
                          {currentIdx < stages.length - 1 && (
                            <button onClick={() => moveDeal(deal.id, stages[currentIdx + 1].id)} className="text-[10px] px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground">{stages[currentIdx + 1].label} →</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <AnimatePresence>
        {moveToast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-lg z-50">
            {moveToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
