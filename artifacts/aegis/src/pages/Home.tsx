import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Lock, BrainCircuit, Zap, ClipboardCheck, Search, ChevronRight, CheckCircle2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { LiveThreatFeed } from "@/components/LiveThreatFeed";
import { cn } from "@/lib/utils";

// Make sure the image is requested in requirements.yaml
const HERO_BG = `${import.meta.env.BASE_URL}images/aegis-hero-bg.png`;

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Platform", href: "#" },
    { name: "Architecture", href: "#architecture" },
    { name: "Live Intel", href: "#intel" },
    { name: "Pricing", href: "#pricing" },
  ];

  const coreCapabilities = [
    { icon: Shield, title: "Perimeter Defense", desc: "Military-grade edge protection shielding your infrastructure from volumetric and targeted attacks." },
    { icon: Lock, title: "Zero-Trust Architecture", desc: "Verify every request, authenticate every node. Assume breach, guarantee isolation." },
    { icon: BrainCircuit, title: "AI Threat Intelligence", desc: "Neural networks analyzing global telemetry to predict and neutralize zero-day vectors." },
    { icon: Zap, title: "Incident Response", desc: "Sub-millisecond autonomous retaliation against active intrusions and anomalies." },
    { icon: ClipboardCheck, title: "Compliance Management", desc: "Continuous automated auditing for SOC2, ISO27001, HIPAA, and custom frameworks." },
    { icon: Search, title: "Forensic Analysis", desc: "Deep packet inspection and cryptographic logging for post-incident reconstruction." }
  ];

  const complianceBadges = ["SOC 2 TYPE II", "ISO 27001", "HIPAA COMPLIANT", "GDPR READY", "PCI DSS L1", "NIST CSF"];

  const caseStudies = [
    { quote: "Aegis stopped a massive zero-day vector before our internal teams even received the alert. It is truly an unbreakable shield.", author: "CTO, Global Finance Corp" },
    { quote: "Deploying Aegis across our multi-cloud infrastructure took hours, not months. The visibility is unprecedented.", author: "VP Engineering, HealthTech Inc" },
    { quote: "We sleep better knowing the Aegis AI is autonomously monitoring our perimeter 24/7/365. Worth every penny.", author: "CISO, Aerospace Defense" }
  ];

  const pricingTiers = [
    { 
      name: "Shield", 
      desc: "For growing organizations requiring robust baseline defense.", 
      price: "$2,500", 
      features: ["L3/L4 DDoS Protection", "Standard WAF Rules", "24/7 Monitoring", "7-Day Log Retention"],
      highlight: false
    },
    { 
      name: "Fortress", 
      desc: "Comprehensive security for mission-critical enterprise workloads.", 
      price: "$8,500", 
      features: ["L7 Advanced DDoS Mitigation", "AI-Powered WAF", "Zero-Trust Edge", "30-Day Log Retention", "Dedicated Security Analyst"],
      highlight: true
    },
    { 
      name: "Citadel", 
      desc: "Ultimate protection for massive scale and supreme compliance.", 
      price: "Custom", 
      features: ["Global Network Footprint", "Custom AI Threat Models", "Forensic Cryptography", "Unlimited Log Retention", "15-Minute SLA Guarantee"],
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 glass-panel border-b-0 border-primary/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-xl tracking-widest text-white">AEGIS</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="text-sm font-semibold tracking-wider text-muted-foreground hover:text-primary transition-colors">
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="font-bold tracking-widest" onClick={() => alert("Login Portal Triggered")}>LOGIN</Button>
            <Button variant="glow" onClick={() => alert("Deploy Aegis Triggered")}>DEPLOY AEGIS</Button>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-primary/20 p-4 flex flex-col gap-4 absolute w-full left-0 top-20">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="p-2 font-semibold text-muted-foreground">
                {link.name}
              </a>
            ))}
            <div className="h-px bg-border my-2" />
            <Button variant="outline" className="w-full">LOGIN</Button>
            <Button variant="glow" className="w-full">DEPLOY AEGIS</Button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <img src={HERO_BG} alt="Aegis Background" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <Shield className="w-24 h-24 text-primary drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]" strokeWidth={1} />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black font-display tracking-tight text-white mb-6 uppercase"
          >
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary text-glow">Unbreakable</span> Shield
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-12 font-light"
          >
            Enterprise-grade security fortress. Defending your digital empire with autonomous AI threat intelligence and zero-trust architecture.
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
          >
            <Button variant="glow" size="lg" className="w-full sm:w-auto text-lg px-12" onClick={() => alert('Initiating Deployment...')}>
              Deploy Aegis
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-12 bg-background/50 backdrop-blur-sm" onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth'})}>
              View Architecture
            </Button>
          </motion.div>
        </div>
      </section>

      {/* What is Aegis */}
      <section className="py-24 relative overflow-hidden bg-background">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-light leading-relaxed text-muted-foreground"
          >
            Named after the <strong className="text-white font-medium">mythological shield of Zeus</strong>, Aegis stands as the outermost layer of defense for your entire organization. It is an impenetrable fortress that sits between your internal systems and the chaos of the public web.
          </motion.p>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-24 bg-card/30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 uppercase tracking-wider">Core Capabilities</h2>
            <p className="text-primary tracking-widest uppercase text-sm font-bold">Six Pillars of Defense</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreCapabilities.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-8 rounded-2xl hover:border-primary/50 transition-colors group"
              >
                <cap.icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-display font-bold text-white mb-3 tracking-wide">{cap.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section id="architecture" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 uppercase tracking-wider">The Inner Sanctum</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Aegis wraps around your critical infrastructure (Beacon, Nimbus, Zeus) preventing unauthorized access before it reaches your proprietary logic.</p>
          </div>
          
          <ArchitectureDiagram />
        </div>
      </section>

      {/* Threat Dashboard */}
      <section id="intel" className="py-24 bg-card/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 uppercase tracking-wider">Global Telemetry</h2>
              <p className="text-muted-foreground">Live view of threats neutralized by the Aegis network.</p>
            </div>
            <div className="flex items-center gap-4 text-sm font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-500 font-bold">SYSTEM NOMINAL</span>
              </div>
              <div className="text-muted-foreground px-3 py-1 border border-border rounded bg-background">UPTIME: 99.999%</div>
            </div>
          </div>
          
          <LiveThreatFeed />
        </div>
      </section>

      {/* Compliance */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-12 uppercase tracking-wider">Verified & Certified</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {complianceBadges.map((badge, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="py-6 px-4 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all cursor-default"
              >
                <span className="font-display font-bold tracking-widest text-sm md:text-base text-muted-foreground whitespace-nowrap">{badge}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {caseStudies.map((study, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative p-8 rounded-2xl glass-panel"
              >
                <div className="absolute -top-4 -left-2 text-6xl text-primary/20 font-serif">"</div>
                <p className="text-lg italic leading-relaxed text-muted-foreground mb-6 relative z-10">{study.quote}</p>
                <div className="h-px w-12 bg-primary mb-4" />
                <p className="font-display font-bold text-white tracking-widest text-sm uppercase">{study.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 uppercase tracking-wider">Enterprise Licensing</h2>
            <p className="text-muted-foreground">Select the defensive posture appropriate for your scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className={cn(
                  "relative p-8 rounded-2xl flex flex-col h-full",
                  tier.highlight 
                    ? "bg-card border-2 border-primary shadow-[0_0_40px_-10px_rgba(212,175,55,0.3)] scale-105 z-10" 
                    : "glass-panel"
                )}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-display font-bold text-white mb-2 uppercase tracking-widest">{tier.name}</h3>
                <p className="text-muted-foreground text-sm h-12">{tier.desc}</p>
                
                <div className="my-8">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {tier.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-gray-300">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={tier.highlight ? "glow" : "outline"} 
                  className="w-full mt-auto"
                  onClick={() => alert(`Selected ${tier.name} Tier`)}
                >
                  {tier.price === "Custom" ? "Contact Sales" : "Start Trial"}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Shield className="w-16 h-16 text-primary mx-auto mb-8" />
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 uppercase tracking-tight">Ready to Secure Your Empire?</h2>
          <p className="text-xl text-muted-foreground mb-10">Join the elite organizations that trust Aegis with their perimeter.</p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert("Access Requested"); }}>
            <input 
              type="email" 
              placeholder="Enter your corporate email" 
              required
              className="flex-grow h-14 bg-background border border-primary/30 rounded-md px-6 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <Button type="submit" variant="glow" size="lg" className="h-14 px-8 shrink-0">
              Request Access <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-display font-bold tracking-widest text-white">AEGIS</span>
          </div>
          
          <div className="text-sm text-muted-foreground flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          </div>
          
          <div className="text-xs font-mono text-muted-foreground p-3 border border-border rounded bg-card/50">
            <div><span className="text-primary">Admin:</span> slutar</div>
            <div><span className="text-primary">Auth:</span> Topshelf14@</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
