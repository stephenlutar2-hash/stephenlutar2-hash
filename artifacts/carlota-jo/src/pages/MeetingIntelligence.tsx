import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, CheckCircle2, AlertCircle, Users, TrendingUp,
  Clock, ArrowRight, Sparkles, Smile, Meh, Frown, Loader2
} from "lucide-react";
import { Link } from "wouter";

interface MeetingNote {
  id: number;
  client: string;
  date: string;
  rawNotes: string;
  actionItems: string[];
  nextSteps: string[];
  sentiment: "positive" | "neutral" | "cautious";
  pipelineUpdate: string;
  keyInsights: string[];
}

const sampleMeetings: MeetingNote[] = [
  {
    id: 1, client: "Meridian Capital Partners", date: "2026-03-24",
    rawNotes: "Call with Victoria and team. Discussed final pricing structure for portfolio optimization engagement. They are comparing with Goldman advisory but expressed strong preference for our implementation-focused approach. Budget approved at board level — need to finalize SOW by end of month. Victoria mentioned potential expansion into ESG integration for Q3.",
    actionItems: ["Finalize Statement of Work with updated pricing by March 28", "Prepare ESG integration add-on proposal for Q3 discussion", "Send case study from Pinnacle Ventures engagement as reference"],
    nextSteps: ["Schedule signing meeting for week of March 31", "Prepare onboarding packet for April kickoff"],
    sentiment: "positive",
    pipelineUpdate: "Move to Negotiation — 75% probability. Pricing discussion positive. Board budget approved.",
    keyInsights: ["Client comparing with Goldman but prefers implementation depth", "Potential Q3 expansion opportunity in ESG", "Board-level budget approval already secured"],
  },
  {
    id: 2, client: "Silverstone Group", date: "2026-03-22",
    rawNotes: "Discovery call with Catherine Blackwell. They're looking at acquiring a fintech platform in the $200-400M range. Need end-to-end M&A support. Catherine concerned about technology due diligence — they've been burned before. Want to understand our tech assessment methodology. Mentioned they're also talking to Lazard.",
    actionItems: ["Send technology due diligence methodology deck", "Prepare competitive comparison showing Carlota Jo vs Lazard capabilities", "Research potential fintech targets in their stated range"],
    nextSteps: ["Follow-up call scheduled March 29 to discuss methodology", "Prepare preliminary target shortlist for next meeting"],
    sentiment: "neutral",
    pipelineUpdate: "Advance to Qualified — 40% probability. Strong need identified but competitive situation with Lazard.",
    keyInsights: ["Previous negative experience with tech due diligence", "Budget range $200-400M for acquisition", "Lazard in competitive consideration — differentiate on tech assessment"],
  },
  {
    id: 3, client: "Quantum Analytics", date: "2026-03-18",
    rawNotes: "Proposal review with Dr. Lisa Park. She liked the approach but pushed back on timeline — wants to compress from 12 weeks to 8. Also raised concerns about data access — their CTO is protective of infrastructure access. McKinsey gave them a lower price but Lisa says our technical depth is superior. Need to figure out how to make the timeline work.",
    actionItems: ["Revise project plan for 8-week compressed timeline", "Prepare data access requirements document for CTO review", "Adjust pricing to remain competitive with McKinsey while protecting margins"],
    nextSteps: ["Send revised proposal by March 25", "Schedule technical deep-dive with their CTO"],
    sentiment: "cautious",
    pipelineUpdate: "Remain at Proposal — 55% probability. Timeline and pricing pressure. McKinsey competitive threat.",
    keyInsights: ["Client values technical depth over brand", "CTO is a potential blocker on data access", "Timeline compression requested — 12 to 8 weeks", "McKinsey offering lower price point"],
  },
];

const sentimentConfig = {
  positive: { icon: Smile, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Positive" },
  neutral: { icon: Meh, color: "text-amber-400", bg: "bg-amber-500/10", label: "Neutral" },
  cautious: { icon: Frown, color: "text-red-400", bg: "bg-red-500/10", label: "Cautious" },
};

function simulateAnalysis(rawNotes: string): MeetingNote {
  const words = rawNotes.split(/\s+/);
  const hasPositive = /happy|great|approved|signed|agreed|excited|strong/i.test(rawNotes);
  const hasNegative = /concerned|worried|pushed back|lost|rejected|issue|problem/i.test(rawNotes);
  const sentiment: "positive" | "neutral" | "cautious" = hasPositive && !hasNegative ? "positive" : hasNegative ? "cautious" : "neutral";

  const sentences = rawNotes.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);

  const actionItems = sentences
    .filter(s => /need to|should|must|prepare|send|schedule|follow up|review|finalize/i.test(s))
    .slice(0, 4)
    .map(s => s.length > 80 ? s.slice(0, 77) + "..." : s);

  if (actionItems.length === 0) {
    actionItems.push("Review meeting notes and identify follow-up items", "Schedule next touchpoint with client");
  }

  const nextSteps = sentences
    .filter(s => /next|follow|schedule|plan|upcoming|after/i.test(s))
    .slice(0, 3);

  if (nextSteps.length === 0) {
    nextSteps.push("Schedule follow-up meeting within 1 week");
  }

  const keyInsights = sentences
    .filter(s => !actionItems.includes(s) && !nextSteps.includes(s))
    .slice(0, 4)
    .map(s => s.length > 60 ? s.slice(0, 57) + "..." : s);

  if (keyInsights.length === 0) {
    keyInsights.push("Meeting notes analyzed — key themes extracted");
  }

  const clientMatch = rawNotes.match(/(?:with|from|at|meeting)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/);
  const client = clientMatch ? clientMatch[1] : "New Client";

  return {
    id: Date.now(),
    client,
    date: new Date().toISOString().split("T")[0],
    rawNotes,
    actionItems,
    nextSteps,
    sentiment,
    pipelineUpdate: `AI Analysis: Sentiment ${sentiment}. ${actionItems.length} action items identified. ${words.length} words analyzed.`,
    keyInsights,
  };
}

export default function MeetingIntelligence() {
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [meetings, setMeetings] = useState<MeetingNote[]>(sampleMeetings);
  const [notesInput, setNotesInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = useCallback(() => {
    if (!notesInput.trim() || notesInput.trim().length < 20) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const result = simulateAnalysis(notesInput);
      setMeetings(prev => [result, ...prev]);
      setExpandedId(result.id);
      setNotesInput("");
      setIsAnalyzing(false);
    }, 1500);
  }, [notesInput]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground font-serif">CJ</span>
            </div>
            <span className="font-serif text-lg font-semibold">Meeting Intelligence</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/pipeline" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pipeline</Link>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-16 max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Meeting Intelligence</h1>
          <p className="text-muted-foreground">Paste meeting notes to extract action items, sentiment, and pipeline updates</p>
        </div>

        <div className="mb-6 p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Paste Meeting Notes</h3>
          </div>
          <textarea
            className="w-full h-32 bg-background border border-border rounded-lg p-4 text-sm resize-none focus:border-primary/50 focus:outline-none transition-colors"
            placeholder="Paste or type your meeting notes here (at least 20 characters)... AI will extract action items, next steps, client sentiment, and suggest pipeline updates."
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">{notesInput.length > 0 ? `${notesInput.split(/\s+/).filter(Boolean).length} words` : ""}</span>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || notesInput.trim().length < 20}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Analyze Notes</>}
            </button>
          </div>
        </div>

        <h2 className="text-lg font-serif font-bold mb-4">
          {meetings.length > sampleMeetings.length ? `Meeting Analyses (${meetings.length})` : "Recent Meeting Analyses"}
        </h2>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {meetings.map((meeting, idx) => {
              const isExpanded = expandedId === meeting.id;
              const sentCfg = sentimentConfig[meeting.sentiment];
              const SentIcon = sentCfg.icon;
              const isNew = !sampleMeetings.some(s => s.id === meeting.id);
              return (
                <motion.div
                  key={meeting.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: isNew ? 0 : idx * 0.06 }}
                  className={`rounded-xl border overflow-hidden ${isNew ? "border-primary/30 ring-1 ring-primary/10" : "border-border"}`}
                >
                  <div className="p-5 bg-card cursor-pointer hover:bg-card/80 transition-colors" onClick={() => setExpandedId(isExpanded ? null : meeting.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            {meeting.client}
                            {isNew && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">New</span>}
                          </h4>
                          <p className="text-xs text-muted-foreground">{new Date(meeting.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${sentCfg.bg} ${sentCfg.color}`}>
                          <SentIcon className="w-3 h-3" /> {sentCfg.label}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">{meeting.actionItems.length} actions</span>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="border-t border-border p-5 space-y-5">
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                            <h5 className="text-xs font-bold uppercase text-primary mb-2 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> Pipeline Update
                            </h5>
                            <p className="text-sm text-foreground/80">{meeting.pipelineUpdate}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Action Items
                              </h5>
                              <ul className="space-y-2">
                                {meeting.actionItems.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                    <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                <ArrowRight className="w-3 h-3 text-cyan-400" /> Next Steps
                              </h5>
                              <ul className="space-y-2">
                                {meeting.nextSteps.map((step, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                    <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0 mt-1" />
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-primary" /> Key Insights
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {meeting.keyInsights.map((insight, i) => (
                                <span key={i} className="text-xs bg-card border border-border px-3 py-1.5 rounded-lg text-foreground/70">{insight}</span>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-background border border-border">
                            <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2">Raw Notes</h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">{meeting.rawNotes}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
