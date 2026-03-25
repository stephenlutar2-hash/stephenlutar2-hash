import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Shield, Eye, FileText, LayoutDashboard, Target, LogOut,
  AlertTriangle, CheckCircle2, ChevronRight, Clock, Zap,
  ArrowRight, RotateCcw, MessageSquare,
} from "lucide-react";
import { Badge } from "@workspace/ui";

interface Step {
  id: number; title: string; description: string;
  decisions: { label: string; correct: boolean; feedback: string }[];
}

const triageSteps: Step[] = [
  {
    id: 1,
    title: "Initial Triage Assessment",
    description: "Multiple IDS alerts indicate a port scan sweep originating from an internal workstation (10.0.1.42). The scan is targeting subnet 10.0.2.0/24, probing common service ports (80, 443, 8080, 9090). 147 open ports have been identified across 23 hosts.",
    decisions: [
      { label: "Escalate immediately — potential active reconnaissance", correct: true, feedback: "Correct. Internal-origin port scans indicate either a compromised host or insider threat. Immediate escalation ensures the SOC can begin containment assessment while the scan is still active." },
      { label: "Log and monitor — likely routine network scanning", correct: false, feedback: "Risky. While authorized scans exist, internal port scans without prior notification should be treated as suspicious. Without verification from IT ops, this warrants escalation." },
      { label: "Block source IP and close ticket", correct: false, feedback: "Premature. Blocking without investigation may alert the threat actor and cause them to pivot through alternate channels. Escalate first to understand scope." },
    ],
  },
  {
    id: 2,
    title: "Severity Assignment",
    description: "You've confirmed this is not an authorized scan. The source workstation belongs to a user in the finance department. SIEM correlation shows the workstation also made unusual DNS requests to external resolvers in the past hour.",
    decisions: [
      { label: "P1 Critical — Active compromise with lateral movement indicators", correct: true, feedback: "Correct. The combination of unauthorized scanning + external DNS anomalies from a finance workstation strongly suggests an active compromise. P1 ensures all-hands response and management notification." },
      { label: "P2 High — Suspicious but contained to one host", correct: false, feedback: "Underrated. The external DNS activity suggests the compromise extends beyond the workstation. P2 may delay the response needed to prevent data exfiltration." },
      { label: "P3 Medium — Anomalous but not confirmed malicious", correct: false, feedback: "Too low. Multiple indicators of compromise (port scan + DNS anomaly + finance dept target) warrant P1 classification. P3 could result in missed containment window." },
    ],
  },
  {
    id: 3,
    title: "Containment Decision",
    description: "The investigation has confirmed malware on the finance workstation. EDR shows a process chain consistent with a RAT (Remote Access Trojan). The workstation has active network connections to 3 other hosts in the finance VLAN.",
    decisions: [
      { label: "Isolate workstation via EDR, block lateral connections at VLAN level, preserve forensic state", correct: true, feedback: "Correct. EDR isolation preserves the machine for forensics while stopping active connections. VLAN-level blocking prevents the RAT from pivoting to other finance hosts. This is the gold standard containment approach." },
      { label: "Shut down the workstation immediately", correct: false, feedback: "Not ideal. Hard shutdown destroys volatile memory evidence (running processes, network connections, encryption keys). EDR isolation achieves containment while preserving forensic artifacts." },
      { label: "Reset user credentials and monitor for further activity", correct: false, feedback: "Insufficient. A RAT operates independently of user credentials. The malware will continue operating with its own C2 channel. Network isolation is required to stop active compromise." },
    ],
  },
  {
    id: 4,
    title: "Incident Documentation",
    description: "Containment is in place. The SOC has isolated the workstation and blocked lateral connections. Management has been notified. What should be documented next?",
    decisions: [
      { label: "Full incident timeline, IOCs, affected systems list, containment actions taken, recommended next steps for eradication", correct: true, feedback: "Correct. Comprehensive documentation enables effective handoff between shifts, supports regulatory reporting requirements, and creates an audit trail for post-incident review. Include timestamps for every action." },
      { label: "Brief summary email to management with key findings", correct: false, feedback: "Incomplete. While management communication is important, the incident record must include technical details for the response team, IOCs for threat hunting, and a complete timeline for compliance." },
      { label: "Update the ticket with 'contained' status", correct: false, feedback: "Minimal. Status updates are necessary but insufficient. The response team needs detailed documentation to support eradication, recovery, and lessons-learned phases." },
    ],
  },
];

const navItems = [
  { icon: LayoutDashboard, label: "Command Center", path: "/dashboard" },
  { icon: Target, label: "Scenario Catalog", path: "/scenarios" },
  { icon: Eye, label: "Detection Validation", path: "/detections" },
  { icon: Shield, label: "Response Trainer", path: "/response-trainer" },
  { icon: FileText, label: "Reports", path: "/reports" },
];

export default function ResponseTrainer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDecision, setSelectedDecision] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [timelineEntries, setTimelineEntries] = useState<{ time: string; action: string }[]>([]);
  const [newTimelineAction, setNewTimelineAction] = useState("");
  const [, setLocation] = useLocation();

  function handleDecision(index: number) {
    setSelectedDecision(index);
    setShowFeedback(true);
    if (triageSteps[currentStep].decisions[index].correct) {
      setScore((prev) => prev + 25);
    }
  }

  function handleNext() {
    if (currentStep < triageSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setSelectedDecision(null);
      setShowFeedback(false);
    } else {
      setCompleted(true);
    }
  }

  function addTimelineEntry() {
    if (!newTimelineAction.trim()) return;
    setTimelineEntries((prev) => [...prev, { time: new Date().toLocaleTimeString("en-US", { hour12: false }), action: newTimelineAction.trim() }]);
    setNewTimelineAction("");
  }

  function handleReset() {
    setCurrentStep(0);
    setSelectedDecision(null);
    setShowFeedback(false);
    setScore(0);
    setCompleted(false);
    setNotes("");
    setTimelineEntries([]);
    setNewTimelineAction("");
  }

  function handleLogout() {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  const step = triageSteps[currentStep];

  return (
    <div className="min-h-screen flex bg-[#0c0a08] text-white">
      <aside className="w-64 border-r border-orange-500/10 bg-[#0a0908] flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-orange-500/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-[0.2em]">FIRESTORM</span>
          </Link>
        </div>
        <div className="p-4 flex-1 space-y-1">
          <div className="px-2 mb-4 mt-2"><p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">Simulation Lab</p></div>
          {navItems.map((item) => (
            <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${item.path === "/response-trainer" ? "bg-orange-500/10 text-orange-500" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}>
              <item.icon size={18} /><span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-orange-500/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} /><span className="text-sm font-medium">Disconnect</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 border-b border-orange-500/10 bg-[#0a0908]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-semibold tracking-wide">Response Trainer</h1>
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">LAB MODE</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-500">Score: <span className="text-orange-400 font-bold">{score}/100</span></span>
            <button onClick={handleReset} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="p-6 flex-1">
          {completed ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center py-16">
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${score >= 75 ? "bg-emerald-500/20 border-2 border-emerald-500/30" : score >= 50 ? "bg-amber-500/20 border-2 border-amber-500/30" : "bg-red-500/20 border-2 border-red-500/30"}`}>
                <span className={`text-4xl font-display font-bold ${score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"}`}>{score}</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-white mb-4">Drill Complete</h2>
              <p className="text-gray-400 mb-2">
                {score === 100 ? "Perfect score! Excellent incident response decision-making." :
                 score >= 75 ? "Strong performance. Your triage and response decisions were largely correct." :
                 score >= 50 ? "Adequate performance. Review the feedback for areas of improvement." :
                 "Needs improvement. Review incident response procedures and retry the drill."}
              </p>
              <p className="text-xs text-gray-600 mb-8">Scenario: Internal Port Scan → RAT Compromise Response</p>
              <div className="flex justify-center gap-4">
                <button onClick={handleReset} className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold tracking-wider uppercase text-sm hover:opacity-90 transition">
                  Retry Drill
                </button>
                <Link href="/reports" className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-bold tracking-wider uppercase text-sm hover:bg-white/10 transition">
                  View Reports
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {triageSteps.map((_, i) => (
                    <div key={i} className={`flex items-center gap-2 ${i < triageSteps.length - 1 ? "" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i === currentStep ? "bg-orange-500 text-white" : i < currentStep ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-gray-500 border border-white/10"}`}>
                        {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      {i < triageSteps.length - 1 && <div className={`w-8 h-0.5 ${i < currentStep ? "bg-emerald-500/30" : "bg-white/10"}`} />}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500">Step {currentStep + 1} of {triageSteps.length}</span>
              </div>

              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-display font-bold text-white">{step.title}</h2>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5 mb-6">
                  <p className="text-sm text-gray-300 leading-relaxed">{step.description}</p>
                </div>
                <h3 className="text-xs tracking-widest uppercase text-gray-500 mb-4">Your Decision</h3>
                <div className="space-y-3">
                  {step.decisions.map((dec, i) => (
                    <button key={i} onClick={() => !showFeedback && handleDecision(i)} disabled={showFeedback} className={`w-full text-left p-4 rounded-lg border transition-all ${showFeedback ? (selectedDecision === i ? (dec.correct ? "border-emerald-500/50 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10") : dec.correct ? "border-emerald-500/30 bg-emerald-500/5 opacity-60" : "border-white/5 bg-white/[0.01] opacity-40") : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-orange-500/30 cursor-pointer"}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${showFeedback && selectedDecision === i ? (dec.correct ? "border-emerald-500 bg-emerald-500/20" : "border-red-500 bg-red-500/20") : showFeedback && dec.correct ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/20 bg-white/5"}`}>
                          {showFeedback && (selectedDecision === i || dec.correct) && (
                            dec.correct ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-red-400 text-xs font-bold">✗</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-300">{dec.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {showFeedback && selectedDecision !== null && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-6">
                      <div className={`p-4 rounded-lg border ${step.decisions[selectedDecision].correct ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                        <p className="text-sm text-gray-300 leading-relaxed">{step.decisions[selectedDecision].feedback}</p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button onClick={handleNext} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold tracking-wider uppercase text-sm hover:opacity-90 transition flex items-center gap-2">
                          {currentStep < triageSteps.length - 1 ? <>Next Step <ArrowRight className="w-4 h-4" /></> : <>Complete Drill <CheckCircle2 className="w-4 h-4" /></>}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs tracking-widest uppercase text-gray-500">Incident Timeline Builder</h3>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                    {timelineEntries.length === 0 ? (
                      <p className="text-xs text-gray-600">No entries yet. Add timeline events as you progress through the drill.</p>
                    ) : (
                      timelineEntries.map((entry, i) => (
                        <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                          <span className="text-[10px] font-mono text-cyan-400 shrink-0 mt-0.5">{entry.time}</span>
                          <span className="text-xs text-gray-300">{entry.action}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input value={newTimelineAction} onChange={(e) => setNewTimelineAction(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTimelineEntry()} placeholder="Add timeline event..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/30" />
                    <button onClick={addTimelineEntry} className="px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/30 transition border border-cyan-500/30">Add</button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <h3 className="text-xs tracking-widest uppercase text-gray-500">Incident Notes</h3>
                  </div>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Document your observations and reasoning..." className="w-full bg-transparent border-0 text-sm text-gray-300 placeholder:text-gray-600 resize-none focus:outline-none min-h-[80px]" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <ChevronRight className="w-4 h-4 text-orange-400" />
                  <h3 className="text-xs tracking-widest uppercase text-orange-400 font-bold">Recommended Next Steps</h3>
                </div>
                <div className="space-y-2">
                  {currentStep === 0 && [
                    "Gather all available alert data from IDS, SIEM, and network logs",
                    "Identify the source and scope of the suspicious activity",
                    "Determine if this matches any known authorized operations",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-orange-400 shrink-0 mt-0.5">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                  {currentStep === 1 && [
                    "Validate the compromise hypothesis with EDR telemetry",
                    "Check for additional IOCs across the affected subnet",
                    "Notify the incident response team lead",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-orange-400 shrink-0 mt-0.5">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                  {currentStep === 2 && [
                    "Initiate network isolation for the compromised host",
                    "Preserve volatile memory and disk images for forensics",
                    "Block known C2 IPs at the firewall perimeter",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-orange-400 shrink-0 mt-0.5">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                  {currentStep === 3 && [
                    "Create a comprehensive incident report with full IOC listing",
                    "Schedule a post-incident review meeting within 48 hours",
                    "Update detection rules based on observed gaps",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-orange-400 shrink-0 mt-0.5">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
