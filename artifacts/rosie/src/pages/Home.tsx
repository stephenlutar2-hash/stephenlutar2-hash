import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Shield, Eye, Bell, Layers, RefreshCw, Terminal, CheckCircle2, ChevronRight, Lock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardMockup } from "@/components/ui/DashboardMockup";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Abstract dark futuristic background" 
            className="w-full h-full object-cover opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background"></div>
          
          {/* Animated Glow Orbs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[150px]"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary glow-shadow"></span>
            <span className="text-sm font-medium text-white/80 font-mono tracking-wide">SYSTEM V2.4 ONLINE</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-tight mb-6 leading-tight"
          >
            YOUR SECURITY <br/>
            <span className="text-gradient">NEVER SLEEPS.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            ROSIE is an autonomous, AI-powered security monitoring platform. 
            We protect your infrastructure 24/7/365, detecting and neutralizing threats before they happen.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:scale-105 transition-all glow-shadow flex items-center justify-center gap-2 group">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 rounded-xl bg-white/5 text-white font-display font-bold text-lg hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2">
              <Terminal className="w-5 h-5" />
              View Demo
            </button>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Scroll to Deploy</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary/50 to-transparent"></div>
        </motion.div>
      </section>

      {/* 2. SECURITY STATS */}
      <section className="py-12 border-y border-white/5 bg-white/[0.01] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            {[
              { value: "99.99%", label: "System Uptime" },
              { value: "<1ms", label: "Threat Response" },
              { value: "1.2M+", label: "Threats Blocked" },
              { value: "24/7", label: "Autonomous Coverage" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center px-4"
              >
                <div className="text-3xl md:text-4xl font-display font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm font-mono text-primary/80 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROJECTS PROTECTED */}
      <section id="projects" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-mono text-secondary uppercase tracking-widest mb-4">Trusted Infrastructure</h2>
            <h3 className="text-3xl md:text-5xl font-display font-bold">EMPIRES WE PROTECT</h3>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 md:gap-6"
          >
            {['Beacon Dashboard', 'Nimbus AI', 'Zeus Core', 'INCA System', 'Dream Era'].map((project, i) => (
              <motion.div 
                key={project}
                variants={fadeIn}
                className="glass-panel rounded-2xl px-6 py-4 flex items-center gap-4 hover:border-primary/50 transition-colors group cursor-default"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Layers className="w-5 h-5 text-white/70 group-hover:text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">{project}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-green-400 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    PROTECTED
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-32 relative z-10 bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Autonomous Workflow</h2>
            <h3 className="text-3xl md:text-5xl font-display font-bold">THREE STEPS TO SECURE</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

            {[
              { step: "01", title: "Deploy", desc: "Instantly integrate ROSIE into your existing infrastructure via our secure API gateway.", icon: Terminal },
              { step: "02", title: "Monitor", desc: "ROSIE maps your network and begins 24/7 AI-driven behavioral analysis of all traffic.", icon: Eye },
              { step: "03", title: "Respond", desc: "Threats are neutralized in milliseconds before they can penetrate your outer defenses.", icon: Shield }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-background border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center mb-6 relative z-10">
                  <div className="absolute inset-2 rounded-full border border-primary/30 animate-spin-slow"></div>
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm font-mono text-muted-foreground mb-3">PHASE {item.step}</div>
                <h4 className="text-xl font-display font-bold text-white mb-3">{item.title}</h4>
                <p className="text-muted-foreground text-sm max-w-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURES SECTION */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-sm font-mono text-secondary uppercase tracking-widest mb-4">Core Architecture</h2>
              <h3 className="text-3xl md:text-5xl font-display font-bold">MILITARY-GRADE CAPABILITIES</h3>
            </div>
            <p className="text-muted-foreground max-w-md">
              Everything you need to secure a scaling digital enterprise, built into one cohesive, intelligent platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Real-Time Detection", desc: "Identify anomalies in traffic patterns in under 1 millisecond using our proprietary AI models.", icon: Shield },
              { title: "24/7 Autonomous Watch", desc: "ROSIE doesn't sleep. Constant vigilance across all your connected endpoints and databases.", icon: Eye },
              { title: "Instant Alerts", desc: "Get notified via SMS, Slack, or webhook the moment a high-severity event is mitigated.", icon: Bell },
              { title: "Multi-Project Coverage", desc: "Protect an entire portfolio of applications from a single, unified command center.", icon: Layers },
              { title: "Self-Healing Infra", desc: "Automatically re-routes traffic and isolates compromised nodes without manual intervention.", icon: RefreshCw },
              { title: "Command Control", desc: "Deep access via a gorgeous, real-time dashboard and programmatic CLI tools.", icon: Terminal }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-8 rounded-2xl group hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-display font-bold text-white mb-3">{feature.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. COMMAND CENTER PREVIEW */}
      <section id="command-center" className="py-32 relative z-10 overflow-hidden">
        {/* Background texture for dashboard section */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/dashboard-bg.png`}
            alt="Dashboard background texture" 
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-sm font-mono text-primary uppercase tracking-widest mb-4">Total Visibility</h2>
            <h3 className="text-3xl md:text-5xl font-display font-bold mb-6">THE COMMAND CENTER</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Monitor your entire digital empire from a single pane of glass. Real-time metrics, threat intelligence, and server load balancing at your fingertips.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      {/* 7. PRICING SECTION */}
      <section id="pricing" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-mono text-secondary uppercase tracking-widest mb-4">Deployment Plans</h2>
            <h3 className="text-3xl md:text-5xl font-display font-bold">SCALE YOUR SECURITY</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-8 rounded-3xl border-white/10 flex flex-col relative"
            >
              <div className="mb-8">
                <h4 className="text-xl font-display font-bold text-white mb-2">Starter</h4>
                <p className="text-sm text-muted-foreground mb-6">For single applications and small teams.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-white">$499</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 flex-1 mb-8">
                {['1 Project Coverage', 'Standard AI Detection', 'Email Alerts', '7-Day Log Retention'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                Deploy Starter
              </button>
            </motion.div>

            {/* Accelerator (Featured) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-panel p-8 rounded-3xl border-primary/50 relative transform md:-translate-y-4 glow-shadow flex flex-col"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full tracking-wider">
                RECOMMENDED
              </div>
              <div className="mb-8">
                <h4 className="text-xl font-display font-bold text-primary mb-2">Accelerator</h4>
                <p className="text-sm text-muted-foreground mb-6">For growing tech empires and platforms.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-white">$1,499</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 flex-1 mb-8">
                {['Up to 5 Projects', 'Advanced Behavioral AI', 'SMS & Slack Alerts', '30-Day Log Retention', 'Self-Healing Infra'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-colors shadow-lg shadow-primary/25">
                Deploy Accelerator
              </button>
            </motion.div>

            {/* Enterprise */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-8 rounded-3xl border-white/10 flex flex-col relative"
            >
              <div className="mb-8">
                <h4 className="text-xl font-display font-bold text-white mb-2">Enterprise</h4>
                <p className="text-sm text-muted-foreground mb-6">Custom architecture for global scale.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-white">Custom</span>
                </div>
              </div>
              <ul className="space-y-4 flex-1 mb-8">
                {['Unlimited Projects', 'Dedicated Neural Nodes', 'Priority Webhooks', '1-Year Log Retention', 'Dedicated Security Rep'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                Contact Sales
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. CTA SECTION */}
      <section className="py-32 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full opacity-50"></div>
          
          <div className="glass-panel rounded-3xl p-10 md:p-16 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                  READY TO SECURE YOUR EMPIRE?
                </h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Stop reacting to threats. Start predicting them. Deploy ROSIE today and gain total peace of mind.
                </p>
                
                <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button type="submit" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    Start Now <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Demo Credentials Box */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                  <Lock className="w-5 h-5 text-secondary" />
                  <h4 className="font-display font-bold text-white">SYSTEM ACCESS</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Use the following credentials to access the live command center demonstration environment:
                </p>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/50">Username</span>
                    <span className="text-primary font-bold">slutar</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/50">Password</span>
                    <span className="text-primary font-bold">Topshelf14@</span>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 border border-secondary text-secondary rounded-lg font-bold hover:bg-secondary hover:text-white transition-colors">
                  Login to Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
