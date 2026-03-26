import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { 
  Shield, 
  Terminal, 
  Layers, 
  Eye, 
  Zap, 
  BarChart, 
  Lock, 
  ArrowRight,
  Globe,
  Database,
  Cpu
} from "lucide-react";
import { Button } from "@workspace/ui";
import { Badge } from "@workspace/ui";
import { Progress } from "@workspace/ui";
import { Input } from "@workspace/ui";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const mockChartData = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 120 },
  { name: 'Mar', value: 115 },
  { name: 'Apr', value: 140 },
  { name: 'May', value: 180 },
  { name: 'Jun', value: 250 },
  { name: 'Jul', value: 310 },
  { name: 'Aug', value: 380 },
  { name: 'Sep', value: 420 },
  { name: 'Oct', value: 500 },
  { name: 'Nov', value: 650 },
  { name: 'Dec', value: 890 },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setLoginError("Invalid credentials");
        return;
      }
      const data = await res.json();
      localStorage.setItem("szl_token", data.token);
      localStorage.setItem("szl_user", data.username);
      setLocation("/dashboard");
    } catch {
      setLoginError("Connection failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/lutar-hero.png`} 
            alt="Lutar Hero Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-sans tracking-widest text-primary uppercase">System Online • Secure</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 uppercase tracking-tight"
          >
            LUTAR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary">
              Command Your Empire
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground font-sans max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            The personal platform of SZL Holdings. One command center for everything that matters. Track projects, assets, and legacy in absolute silence.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-8 text-sm font-sans tracking-widest uppercase font-semibold text-black bg-primary rounded-sm hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300">
              Enter Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <a href="#about" className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-8 text-sm font-sans tracking-widest uppercase font-semibold text-white border border-border bg-card/30 backdrop-blur-md rounded-sm hover:bg-white/5 hover:border-white/20 transition-all duration-300">
              Learn More
            </a>
          </motion.div>
        </div>
      </section>

      {/* WHAT IS LUTAR */}
      <section id="about" className="py-24 relative border-t border-border/50 bg-background/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 uppercase">
                The Personal <br/><span className="text-primary text-glow">Empire OS</span>
              </h2>
              <p className="text-muted-foreground font-sans text-lg leading-relaxed mb-6">
                Lutar is more than a dashboard. It is a unified command center built explicitly for the management of SZL Holdings. Every strategic move, every deployment, every financial metric is centralized here.
              </p>
              <p className="text-muted-foreground font-sans text-lg leading-relaxed">
                Named for power and built for absolute control, Lutar gives you the oversight required to scale an empire without losing the granular details.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mt-10">
                <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
                  <Terminal className="w-8 h-8 text-primary mb-4" />
                  <h4 className="text-white font-display font-semibold mb-2">Absolute Control</h4>
                  <p className="text-sm text-muted-foreground">Command infrastructure from a single pane of glass.</p>
                </div>
                <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
                  <Shield className="w-8 h-8 text-primary mb-4" />
                  <h4 className="text-white font-display font-semibold mb-2">Total Security</h4>
                  <p className="text-sm text-muted-foreground">Military-grade encryption and access controls.</p>
                </div>
              </div>
            </div>
            
            {/* Dashboard Preview Graphic */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/30 to-background blur-2xl opacity-50" />
              <div className="relative rounded-xl border border-border/80 bg-[#0a0a0a] overflow-hidden shadow-2xl">
                {/* Mac OS Window Header */}
                <div className="h-8 bg-[#111] border-b border-border/50 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <div className="mx-auto text-[10px] text-muted-foreground font-mono tracking-widest uppercase">Lutar Secure Terminal</div>
                </div>
                {/* Fake Dashboard Body */}
                <div className="p-6 flex gap-6">
                  {/* Fake Sidebar */}
                  <div className="w-1/4 space-y-4">
                    <div className="h-4 w-2/3 bg-border/50 rounded" />
                    <div className="space-y-2 mt-8">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-3 w-full bg-border/30 rounded" />
                      ))}
                    </div>
                  </div>
                  {/* Fake Main Content */}
                  <div className="w-3/4 space-y-6">
                    <div className="flex gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 flex-1 bg-primary/10 border border-primary/20 rounded-lg" />
                      ))}
                    </div>
                    <div className="h-32 w-full bg-card/80 border border-border/50 rounded-lg relative overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockChartData}>
                          <Line type="monotone" dataKey="value" stroke="hsl(158 84% 39%)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* EMPIRE PROJECTS */}
      <section id="empire" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 uppercase">Empire Projects</h2>
            <p className="text-muted-foreground font-sans max-w-2xl mx-auto">The core pillars of the SZL Holdings infrastructure.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { name: "ROSIE", desc: "Autonomous Security Platform", status: "Active", progress: 100, icon: Shield },
              { name: "AEGIS", desc: "Enterprise Shield System", status: "Active", progress: 100, icon: Lock },
              { name: "Beacon", desc: "Decision & Analytics Dashboard", status: "Active", progress: 95, icon: BarChart },
              { name: "Nimbus", desc: "Predictive AI Framework", status: "Building", progress: 88, icon: CloudIcon },
              { name: "Zeus", desc: "Modular Core Architecture", status: "Building", progress: 68, icon: Zap },
              { name: "INCA AI", desc: "Innovation & Discovery Engine", status: "Planning", progress: 25, icon: Cpu },
            ].map((project, i) => (
              <motion.div key={i} variants={fadeInUp} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/20 group-hover:to-transparent rounded-xl transition-all duration-500 blur-sm" />
                <div className="relative h-full bg-card border border-border p-6 rounded-xl overflow-hidden hover:border-primary/40 transition-colors duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                      <project.icon size={24} />
                    </div>
                    <Badge variant={project.status === "Active" ? "default" : project.status === "Building" ? "secondary" : "outline"}>
                      {project.status}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground font-sans mb-6">{project.desc}</p>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-xs font-sans text-muted-foreground uppercase tracking-wider">
                      <span>Completion</span>
                      <span className={project.progress === 100 ? "text-primary" : ""}>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOLDINGS & GOALS */}
      <section id="holdings" className="py-24 relative bg-card/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Holdings */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-display font-bold text-white mb-8 uppercase">Holdings Structure</h2>
              <div className="space-y-4">
                {[
                  { title: "Technology Division", items: "Zeus Core, Nimbus AI, INCA", icon: Database },
                  { title: "Security Infrastructure", items: "ROSIE Platform, AEGIS Shield", icon: Shield },
                  { title: "Media & Strategy", items: "Dream Era Campaigns, Beacon", icon: Globe },
                ].map((holding, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-border/50 rounded-lg bg-background/50 hover:bg-background transition-colors">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                      <holding.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-sans font-semibold">{holding.title}</h4>
                      <p className="text-xs text-muted-foreground">{holding.items}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Goals */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-display font-bold text-white mb-8 uppercase">Strategic Objectives</h2>
              <div className="space-y-6 p-8 rounded-xl border border-border bg-background">
                {[
                  { name: "Empire Infrastructure", value: 90 },
                  { name: "Launch 5 Platforms", value: 80 },
                  { name: "Build AI Security Suite", value: 65 },
                  { name: "Global Media Presence", value: 40 },
                  { name: "Revenue Target $10M", value: 25 },
                ].map((goal, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm font-sans">
                      <span className="text-secondary">{goal.name}</span>
                      <span className="text-primary font-mono">{goal.value}%</span>
                    </div>
                    <Progress value={goal.value} className="h-1.5" />
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* SECURE LOGIN PANEL */}
      <section className="py-32 relative flex justify-center items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-screen" />
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative z-10 w-full max-w-md px-6"
        >
          <div className="glass-panel rounded-2xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            
            <div className="text-center mb-8">
              <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-widest">Secure Access</h3>
              <p className="text-sm text-muted-foreground font-sans mt-2">Identify yourself to the Lutar framework.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm">
                  {loginError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-sans tracking-widest uppercase text-muted-foreground">Identity</label>
                <Input 
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="font-mono text-primary bg-background/50 border-primary/20 focus-visible:ring-primary/50" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-sans tracking-widest uppercase text-muted-foreground">Passphrase</label>
                <Input 
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono text-primary bg-background/50 border-primary/20 focus-visible:ring-primary/50" 
                />
              </div>
              
              <Button type="submit" className="w-full h-12 mt-4" disabled={isLoggingIn}>
                {isLoggingIn ? "Authenticating..." : "Enter Lutar"}
              </Button>

              <div className="pt-6 border-t border-border/50 text-center mt-6">
                <Badge variant="outline" className="text-[10px] tracking-[0.2em] border-primary/20 text-primary/70">
                  ACCESS LEVEL: EMPEROR
                </Badge>
              </div>
            </form>
          </div>
        </motion.div>
      </section>

      {/* FOUNDER SECTION */}
      <section className="py-24 relative border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-2 flex justify-center">
                <div className="relative">
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                    <span className="font-display text-6xl font-bold text-primary">SL</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-lg bg-primary/20 border border-primary/30 text-[10px] text-primary font-bold uppercase tracking-widest">Founder</div>
                </div>
              </div>
              <div className="lg:col-span-3">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 uppercase">Stephen Lutar</h2>
                <p className="text-primary text-sm font-sans tracking-widest uppercase mb-4">Founder & CEO — SZL Holdings</p>
                <p className="text-muted-foreground font-sans text-lg leading-relaxed mb-6">
                  Architect of the SZL ecosystem. 10+ years building enterprise platforms across security, AI, and infrastructure. Every platform in this portfolio was designed, architected, and shipped from a single vision.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "15+", label: "Platforms" },
                    { value: "10+", label: "Years" },
                    { value: "$18.5M", label: "Valuation" },
                  ].map(m => (
                    <div key={m.label} className="p-3 rounded-lg border border-border/50 bg-card/30 text-center">
                      <p className="text-xl font-display font-bold text-primary">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="py-24 border-t border-border/30 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-primary/3 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl lg:text-5xl font-display italic text-secondary leading-snug"
          >
            "Built different. Moving in silence. <br/> The empire doesn't announce itself — <span className="text-primary">it arrives.</span>"
          </motion.h2>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="font-display font-bold text-black text-sm">L</span>
            </div>
            <span className="font-display font-bold tracking-widest text-sm uppercase text-white/50">SZL Holdings</span>
          </div>
          <p className="text-xs text-muted-foreground font-sans tracking-widest uppercase">
            © {new Date().getFullYear()} Lutar OS. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Temporary Icon component for array
function CloudIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  )
}
