import { useState } from "react";
import { motion } from "framer-motion";
import {
  Flame, Shield, Activity, BarChart3, Crosshair, Users,
  ChevronRight, CheckCircle2, Menu, X, Play, Eye, FileText, Zap,
} from "lucide-react";
import { Button } from "@workspace/ui";
import { cn } from "@workspace/ui";

const BASE = import.meta.env.BASE_URL;

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Why Firestorm", href: "#why" },
    { name: "Scenarios", href: "#scenarios" },
    { name: "Detections", href: "#detections" },
    { name: "Training", href: "#training" },
    { name: "Reporting", href: "#reporting" },
  ];

  const whyCards = [
    { icon: Shield, title: "Defense Validation", desc: "Test your detection rules, SIEM correlations, and alerting pipelines against realistic threat scenarios — without production risk." },
    { icon: Crosshair, title: "Scenario Catalog", desc: "Pre-built attack simulations covering reconnaissance, credential attacks, lateral movement, exfiltration, and more." },
    { icon: Eye, title: "Detection Coverage", desc: "Measure expected vs. observed detections, track false positive/negative rates, and score rule coverage across your stack." },
    { icon: Activity, title: "Response Training", desc: "Guided incident response workflows with triage checklists, severity assignment, containment decisions, and timeline building." },
    { icon: BarChart3, title: "Executive Reporting", desc: "Generate comprehensive simulation reports with detection rates, response times, and readiness scores for leadership review." },
    { icon: Users, title: "Team Readiness", desc: "Train security teams in a safe lab environment, building muscle memory for real-world incident response." },
  ];

  const previewScenarios = [
    { name: "Port Scan Sweep", category: "Reconnaissance", severity: "medium" },
    { name: "Brute Force Login Burst", category: "Credential Attack", severity: "high" },
    { name: "SQL Injection Pattern", category: "Application Attack", severity: "critical" },
    { name: "DDoS Surge Pattern", category: "Availability Attack", severity: "critical" },
    { name: "Suspicious Admin Login", category: "Insider Threat", severity: "high" },
    { name: "Lateral Movement Indicators", category: "Post-Exploitation", severity: "critical" },
    { name: "Data Staging Indicators", category: "Exfiltration", severity: "high" },
  ];

  const severityColor: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <header className="fixed top-[33px] inset-x-0 z-50 glass-panel border-b-0 border-primary/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-xl tracking-widest text-white">FIRESTORM</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-semibold tracking-wider text-muted-foreground hover:text-primary transition-colors">
                {link.name}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="font-bold tracking-widest text-white hover:text-primary" onClick={() => window.location.href = `${BASE}login`}>LOGIN</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold tracking-widest hover:opacity-90 border-0" onClick={() => window.location.href = `${BASE}login`}>ENTER LAB</Button>
          </div>
          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-primary/20 p-4 flex flex-col gap-4 absolute w-full left-0 top-20">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="p-2 font-semibold text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>{link.name}</a>
            ))}
            <Button variant="outline" className="w-full" onClick={() => window.location.href = `${BASE}login`}>LOGIN</Button>
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold" onClick={() => window.location.href = `${BASE}login`}>ENTER LAB</Button>
          </div>
        )}
      </header>

      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,88,12,0.15)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.08)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }} className="mb-8">
            <Flame className="w-24 h-24 text-primary drop-shadow-[0_0_30px_rgba(234,88,12,0.5)]" strokeWidth={1} />
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="mb-4 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-[0.2em] uppercase inline-flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Authorized Simulation Environment
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-4xl md:text-6xl lg:text-7xl font-black font-display tracking-tight text-white mb-6 uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-red-600 text-glow">Firestorm</span>
            <span className="block text-xl md:text-2xl font-display font-bold tracking-[0.15em] text-white/80 mt-4">Authorized Simulation Command Center</span>
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-12 font-light">
            Validate your defensive capabilities through controlled security simulations. Test detection rules, train response teams, and measure readiness — all in a safe lab environment with synthetic data only.
          </motion.p>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }} className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-lg px-12 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold hover:opacity-90 border-0" onClick={() => window.location.href = `${BASE}login`}>
              <Play className="w-5 h-5 mr-2" /> Enter Simulation Lab
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-12 bg-background/50 backdrop-blur-sm border-orange-500/30 text-white hover:bg-orange-500/10" onClick={() => document.getElementById("why")?.scrollIntoView({ behavior: "smooth" })}>
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="why" className="py-24 bg-card/30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 uppercase tracking-wider">Why Firestorm</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">A controlled environment for validating every layer of your security stack through realistic threat simulation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyCards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-panel p-8 rounded-2xl hover:border-primary/50 transition-colors group">
                <card.icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-display font-bold text-white mb-3 tracking-wide">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="scenarios" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 uppercase tracking-wider">Scenario Catalog Preview</h2>
            <p className="text-muted-foreground">Pre-built simulation scenarios covering the full MITRE ATT&CK kill chain.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {previewScenarios.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs tracking-widest uppercase text-gray-500">{s.category}</span>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border", severityColor[s.severity])}>{s.severity}</span>
                </div>
                <h3 className="font-display font-bold text-white">{s.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="detections" className="py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 uppercase tracking-wider">Detection Validation</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">Measure your detection stack's effectiveness by comparing expected detections against actual observations. Track false positives, false negatives, and rule coverage scores.</p>
              <div className="space-y-4">
                {["Expected vs. Observed Detection Comparison", "False Positive / Negative Rate Tracking", "Rule Coverage Scoring per Category", "Detection Confidence Dashboard"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Detection Rate", value: "92%", color: "text-emerald-400" },
                { label: "False Positive Rate", value: "3.2%", color: "text-amber-400" },
                { label: "Rule Coverage", value: "87%", color: "text-cyan-400" },
                { label: "Confidence Score", value: "94", color: "text-violet-400" },
              ].map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-xl border border-white/10 bg-white/[0.02] text-center">
                  <p className="text-xs tracking-widest text-gray-500 uppercase mb-2">{m.label}</p>
                  <p className={cn("text-3xl font-display font-bold", m.color)}>{m.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="training" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 uppercase tracking-wider">Response Training</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">Guided incident response workflows that build muscle memory for real-world scenarios. Triage, contain, investigate, and recover — all in a controlled environment.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Zap, title: "Triage & Severity", desc: "Assign severity levels, prioritize incidents, and follow structured triage checklists." },
              { icon: Shield, title: "Containment Decisions", desc: "Make real-time containment decisions with guided playbooks and decision cards." },
              { icon: FileText, title: "Incident Documentation", desc: "Build incident timelines, capture notes, and generate recommended next steps." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="p-8 rounded-2xl glass-panel text-left">
                <item.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-display font-bold text-white mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="reporting" className="py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 uppercase tracking-wider">Executive Reporting</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">Generate comprehensive simulation reports with detection rates, response metrics, and organizational readiness scores. Export as JSON or CSV.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold hover:opacity-90 border-0" onClick={() => window.location.href = `${BASE}login`}>
              <Play className="w-5 h-5 mr-2" /> Start Your First Simulation
            </Button>
            <Button variant="outline" size="lg" className="border-orange-500/30 text-white hover:bg-orange-500/10" onClick={() => window.location.href = `${BASE}login`}>
              View Sample Report
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-background py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
            <Flame className="w-6 h-6 text-primary" />
            <span className="font-display font-bold tracking-widest text-white">FIRESTORM</span>
          </div>
          <div className="text-xs font-mono text-muted-foreground p-3 border border-border rounded bg-card/50">
            <div><span className="text-amber-400">Classification:</span> LAB-ONLY SIMULATION — NO REAL TARGETS</div>
          </div>
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} SZL Holdings. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
