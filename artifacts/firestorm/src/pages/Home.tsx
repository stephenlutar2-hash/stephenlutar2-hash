import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Crosshair, Bug, Radio, Users, Eye, ChevronRight, CheckCircle2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveOperationsFeed } from "@/components/LiveOperationsFeed";
import { cn } from "@/lib/utils";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Capabilities", href: "#capabilities" },
    { name: "Operations", href: "#operations" },
    { name: "Pricing", href: "#pricing" },
    { name: "Intel", href: "#testimonials" },
  ];

  const coreCapabilities = [
    { icon: Crosshair, title: "Offensive Recon", desc: "Automated reconnaissance sweeps across your attack surface to identify exposed assets, misconfigurations, and shadow IT before adversaries do." },
    { icon: Bug, title: "Vulnerability Hunting", desc: "Continuous zero-day and CVE scanning with intelligent exploit validation. Find what automated scanners miss." },
    { icon: Flame, title: "Threat Neutralization", desc: "Proactive threat elimination through controlled offensive operations. Burn out attack infrastructure before it activates." },
    { icon: Eye, title: "Intelligence Gathering", desc: "Deep and dark web monitoring, threat actor profiling, and predictive intelligence to stay ahead of emerging campaigns." },
    { icon: Users, title: "Collaborative Operations", desc: "Red team / blue team coordination platform with real-time tactical communication and shared operational dashboards." },
    { icon: Radio, title: "Signal Interception", desc: "Monitor adversary command-and-control channels and exfiltration pathways to detect and disrupt active operations." }
  ];

  const complianceBadges = ["CREST CERTIFIED", "OSCP VERIFIED", "TIBER-EU", "CBEST APPROVED", "PCI ASV", "ISO 27001"];

  const caseStudies = [
    { quote: "Firestorm's red team exercises exposed critical vulnerabilities in our infrastructure that three previous vendors missed entirely. Game-changing offensive capability.", author: "CISO, Major European Bank" },
    { quote: "The continuous attack surface monitoring caught a sophisticated supply-chain compromise within hours. Firestorm paid for itself in a single engagement.", author: "VP Security, Fortune 100 Tech" },
    { quote: "Their collaborative operations platform transformed how our security teams coordinate. Real-time threat intelligence sharing across all our global SOCs.", author: "Director of Cybersecurity, Defense Contractor" }
  ];

  const pricingTiers = [
    { 
      name: "Strike", 
      desc: "Targeted offensive assessments for growing security programs.", 
      price: "$4,500", 
      features: ["Quarterly Penetration Tests", "External Attack Surface Scan", "Vulnerability Reports", "48-Hour SLA Response"],
      highlight: false
    },
    { 
      name: "Blaze", 
      desc: "Continuous offensive operations for enterprise-grade protection.", 
      price: "$15,000", 
      features: ["Continuous Red Team Ops", "Dark Web Intelligence", "Real-Time Attack Surface", "Custom Exploit Development", "Dedicated Operator Team"],
      highlight: true
    },
    { 
      name: "Inferno", 
      desc: "Full-spectrum offensive security for nation-state level threats.", 
      price: "Custom", 
      features: ["Adversary Simulation", "Supply Chain Assessment", "Physical + Digital Red Team", "24/7 Threat Hunt", "Executive Threat Briefings"],
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      
      <header className="fixed top-0 inset-x-0 z-50 glass-panel border-b-0 border-primary/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-xl tracking-widest text-white">FIRESTORM</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="text-sm font-semibold tracking-wider text-muted-foreground hover:text-primary transition-colors">
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="font-bold tracking-widest text-white hover:text-primary" onClick={() => window.location.href = `${import.meta.env.BASE_URL}login`}>LOGIN</Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold tracking-widest hover:opacity-90 border-0" onClick={() => alert("Engage Firestorm Triggered")}>ENGAGE</Button>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-primary/20 p-4 flex flex-col gap-4 absolute w-full left-0 top-20">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="p-2 font-semibold text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
                {link.name}
              </a>
            ))}
            <div className="h-px bg-border my-2" />
            <Button variant="outline" className="w-full" onClick={() => window.location.href = `${import.meta.env.BASE_URL}login`}>LOGIN</Button>
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold">ENGAGE</Button>
          </div>
        )}
      </header>

      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,88,12,0.15)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(220,38,38,0.08)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <Flame className="w-24 h-24 text-primary drop-shadow-[0_0_30px_rgba(234,88,12,0.5)]" strokeWidth={1} />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black font-display tracking-tight text-white mb-6 uppercase"
          >
            Strike <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-red-600 text-glow">First</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-12 font-light"
          >
            White-hat offensive security operations. Proactively hunting vulnerabilities, neutralizing threats, and protecting communities before adversaries can act.
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
          >
            <Button size="lg" className="w-full sm:w-auto text-lg px-12 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold hover:opacity-90 border-0" onClick={() => alert('Initiating Engagement...')}>
              Engage Firestorm
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-12 bg-background/50 backdrop-blur-sm border-orange-500/30 text-white hover:bg-orange-500/10" onClick={() => document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth'})}>
              View Capabilities
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden bg-background">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-light leading-relaxed text-muted-foreground"
          >
            Named after the <strong className="text-white font-medium">unstoppable force of a controlled blaze</strong>, Firestorm represents the proactive side of cybersecurity — finding and eliminating threats before they ignite into full-scale breaches.
          </motion.p>
        </div>
      </section>

      <section id="capabilities" className="py-24 bg-card/30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 uppercase tracking-wider">Core Capabilities</h2>
            <p className="text-primary tracking-widest uppercase text-sm font-bold">Five Pillars of Offense</p>
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

      <section id="operations" className="py-24 bg-card/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 uppercase tracking-wider">Live Operations</h2>
              <p className="text-muted-foreground">Real-time view of active offensive security operations.</p>
            </div>
            <div className="flex items-center gap-4 text-sm font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-orange-500 font-bold">OPS ACTIVE</span>
              </div>
              <div className="text-muted-foreground px-3 py-1 border border-border rounded bg-background">OPERATORS: 24/7</div>
            </div>
          </div>
          
          <LiveOperationsFeed />
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-12 uppercase tracking-wider">Certified & Accredited</h2>
          
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

      <section id="testimonials" className="py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 uppercase tracking-wider">Field Reports</h2>
            <p className="text-muted-foreground">What our clients say after Firestorm engagements.</p>
          </div>
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

      <section id="pricing" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 uppercase tracking-wider">Engagement Models</h2>
            <p className="text-muted-foreground">Select the offensive posture that matches your threat landscape.</p>
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
                    ? "bg-card border-2 border-primary shadow-[0_0_40px_-10px_rgba(234,88,12,0.3)] scale-105 z-10" 
                    : "glass-panel"
                )}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
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
                  className={cn(
                    "w-full mt-auto font-bold tracking-widest",
                    tier.highlight 
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:opacity-90 border-0" 
                      : "bg-transparent border border-orange-500/30 text-white hover:bg-orange-500/10"
                  )}
                  onClick={() => alert(`Selected ${tier.name} Engagement`)}
                >
                  {tier.price === "Custom" ? "Contact Operations" : "Start Engagement"}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Flame className="w-16 h-16 text-primary mx-auto mb-8" />
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 uppercase tracking-tight">Ready to Go on the Offensive?</h2>
          <p className="text-xl text-muted-foreground mb-10">Join elite organizations that trust Firestorm to proactively protect their communities.</p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert("Engagement Requested"); }}>
            <input 
              type="email" 
              placeholder="Enter your corporate email" 
              required
              className="flex-grow h-14 bg-background border border-primary/30 rounded-md px-6 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <Button type="submit" size="lg" className="h-14 px-8 shrink-0 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold hover:opacity-90 border-0">
              Request Access <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-background py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
            <Flame className="w-6 h-6 text-primary" />
            <span className="font-display font-bold tracking-widest text-white">FIRESTORM</span>
          </div>
          
          <div className="text-sm text-muted-foreground flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Responsible Disclosure</a>
          </div>
          
          <div className="text-xs font-mono text-muted-foreground p-3 border border-border rounded bg-card/50">
            <div><span className="text-primary">Classification:</span> WHITE-HAT OPERATIONS</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
