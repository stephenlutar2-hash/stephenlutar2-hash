import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, Mail, MapPin, Briefcase, Award, Code2, Star,
  ExternalLink, Send, Linkedin, Github, Globe, ChevronDown,
  Shield, Brain, Zap, Server, BarChart3, Layers,
  Lock, Eye, ArrowUp, CheckCircle, Users, TrendingUp,
  Target, Building2, GraduationCap
} from "lucide-react";

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

const timeline = [
  {
    year: "2023",
    role: "Founder & CEO",
    company: "SZL Holdings",
    period: "2023 — Present",
    description: "Built a vertically integrated technology holding company from the ground up. Architected and shipped a portfolio of 15+ enterprise platforms spanning cybersecurity, AI analytics, maritime logistics, creative tools, and financial advisory — all within a unified full-stack monorepo.",
    achievements: ["15+ platforms shipped", "Full-stack TypeScript architecture", "AI-powered threat detection engine", "Zero-trust security framework"],
    impact: "Created an enterprise-grade multi-platform ecosystem processing real-time data across security, analytics, and logistics domains.",
  },
  {
    year: "2020",
    role: "Senior Software Architect",
    company: "Enterprise Security Division",
    period: "2020 — 2023",
    description: "Designed and implemented zero-trust security architectures for Fortune 500 clients. Led a cross-functional team of 12 engineers building real-time threat monitoring systems that processed 50M+ security events daily with sub-second response times.",
    achievements: ["Zero-trust architecture for Fortune 500", "50M+ daily events processed", "Led team of 12 engineers", "99.99% system uptime"],
    impact: "Reduced client security incident response time by 73% and eliminated 94% of false positive alerts through ML-based classification.",
  },
  {
    year: "2017",
    role: "Lead Full-Stack Engineer",
    company: "Cloud Infrastructure Corp",
    period: "2017 — 2020",
    description: "Architected a microservices platform handling 100k+ concurrent users. Designed automated deployment pipelines that cut release cycles by 80%, and built real-time analytics dashboards adopted by 200+ enterprise clients.",
    achievements: ["100k+ concurrent users", "80% faster deployments", "200+ enterprise clients", "Microservices migration"],
    impact: "Platform generated $12M ARR within 18 months of launch. Migration from monolith to microservices reduced infrastructure costs by 40%.",
  },
  {
    year: "2015",
    role: "Software Engineer",
    company: "Digital Innovation Labs",
    period: "2015 — 2017",
    description: "Full-stack development for fintech and healthcare startups. Implemented PCI-compliant payment processing, HIPAA-compliant data pipelines, and responsive web applications serving 50k+ monthly active users.",
    achievements: ["PCI-compliant payment systems", "HIPAA-compliant pipelines", "50k+ MAU", "React & Node.js"],
    impact: "Payment platform processed $2.3M in transactions within first quarter. Healthcare data pipeline reduced report generation time from hours to minutes.",
  },
];

const caseStudies = [
  {
    title: "Enterprise Security Monitoring Platform",
    role: "Architect & Lead Engineer",
    client: "Fortune 500 Financial Services",
    icon: Shield,
    color: "from-cyan-500 to-blue-600",
    metrics: [
      { label: "Threat Detection", value: "73%" , suffix: "faster" },
      { label: "False Positives", value: "94%", suffix: "reduced" },
      { label: "Daily Events", value: "50M+", suffix: "" },
      { label: "Uptime", value: "99.99%", suffix: "" },
    ],
    description: "Designed and built a real-time security monitoring platform processing 50M+ events daily. Implemented ML-based threat classification that reduced false positive alerts by 94% and improved incident response time by 73%.",
    technologies: ["TypeScript", "React", "Node.js", "PostgreSQL", "Redis", "TensorFlow"],
  },
  {
    title: "AI-Powered Predictive Analytics Engine",
    role: "Technical Lead",
    client: "Enterprise SaaS Company",
    icon: Brain,
    color: "from-violet-500 to-purple-600",
    metrics: [
      { label: "Prediction Accuracy", value: "91%", suffix: "" },
      { label: "Revenue Impact", value: "$8.2M", suffix: "saved" },
      { label: "Processing Speed", value: "3x", suffix: "faster" },
      { label: "Model Training", value: "Auto", suffix: "" },
    ],
    description: "Built a predictive analytics platform that uses machine learning to forecast system anomalies, resource utilization, and business KPIs. Automated model retraining pipeline maintains 91% prediction accuracy across 40+ signal types.",
    technologies: ["Python", "TypeScript", "React", "OpenAI", "PostgreSQL", "Redis"],
  },
  {
    title: "Multi-Platform Microservices Migration",
    role: "Principal Architect",
    client: "Cloud Infrastructure Corp",
    icon: Server,
    color: "from-emerald-500 to-teal-600",
    metrics: [
      { label: "Infra Costs", value: "40%", suffix: "reduced" },
      { label: "Concurrent Users", value: "100k+", suffix: "" },
      { label: "Deploy Frequency", value: "5x", suffix: "increase" },
      { label: "Revenue", value: "$12M", suffix: "ARR" },
    ],
    description: "Led the migration of a monolithic platform to a microservices architecture serving 100k+ concurrent users. Designed event-driven communication patterns and automated deployment pipelines that increased release velocity by 5x.",
    technologies: ["Node.js", "Kubernetes", "Docker", "Terraform", "AWS", "RabbitMQ"],
  },
  {
    title: "Maritime Fleet Intelligence System",
    role: "Founder & Architect",
    client: "SZL Holdings — Vessels",
    icon: Globe,
    color: "from-blue-500 to-cyan-600",
    metrics: [
      { label: "Fleet Tracking", value: "Real-time", suffix: "" },
      { label: "Route Optimization", value: "18%", suffix: "fuel saved" },
      { label: "Compliance", value: "100%", suffix: "automated" },
      { label: "Data Sources", value: "12+", suffix: "integrated" },
    ],
    description: "Architected a maritime intelligence platform providing real-time fleet tracking, route optimization, and regulatory compliance automation. Integrated 12+ data sources including AIS feeds, weather APIs, and port databases.",
    technologies: ["TypeScript", "React", "Express", "PostgreSQL", "WebSocket", "Mapbox"],
  },
];

const selectedWork = [
  { name: "ROSIE", description: "AI-powered security monitoring with real-time threat detection, incident response, and the Alloy AI chat assistant.", tags: ["React", "TypeScript", "AI", "Security"], icon: Shield, color: "from-cyan-500 to-violet-600" },
  { name: "Aegis", description: "Enterprise defensive security platform with threat assessment, vulnerability scanning, and compliance monitoring.", tags: ["Security", "Zero-Trust", "React"], icon: Shield, color: "from-amber-500 to-yellow-600" },
  { name: "Beacon", description: "Centralized telemetry and analytics dashboard with KPI tracking, project management, and cross-platform insights.", tags: ["Analytics", "Dashboard", "Charts"], icon: BarChart3, color: "from-cyan-400 to-blue-600" },
  { name: "Zeus", description: "Modular core architecture engine powering the entire SZL ecosystem with adaptive scaling and health monitoring.", tags: ["Infrastructure", "Modules", "TypeScript"], icon: Zap, color: "from-yellow-500 to-amber-600" },
  { name: "Nimbus", description: "Predictive intelligence platform with confidence-scored AI forecasting, anomaly detection, and system alerts.", tags: ["AI", "Predictions", "Analytics"], icon: Brain, color: "from-cyan-500 to-violet-600" },
  { name: "Vessels", description: "Maritime fleet intelligence with real-time tracking, route optimization, compliance automation, and risk analysis.", tags: ["Logistics", "Maps", "Real-time"], icon: Globe, color: "from-blue-500 to-emerald-600" },
];

const privateProjects = [
  { name: "Project Sentinel", description: "Classified defense intelligence platform for real-time geopolitical threat monitoring and strategic response coordination.", tags: ["Defense", "Intelligence", "Classified"] },
  { name: "Project Meridian", description: "Proprietary algorithmic trading system with multi-asset class support and ML-driven signal generation.", tags: ["FinTech", "ML", "Trading"] },
  { name: "Project Atlas", description: "Enterprise knowledge graph platform mapping organizational relationships, dependencies, and strategic opportunities.", tags: ["Graph DB", "NLP", "Enterprise"] },
];

const skills = [
  { category: "Languages", items: ["TypeScript", "JavaScript", "Python", "Go", "SQL", "HTML/CSS"] },
  { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "Vite", "Redux"] },
  { category: "Backend", items: ["Node.js", "Express", "PostgreSQL", "Redis", "GraphQL", "REST"] },
  { category: "Infrastructure", items: ["AWS", "Azure", "Docker", "Kubernetes", "CI/CD", "Terraform"] },
  { category: "Security", items: ["Zero-Trust", "OAuth/OIDC", "Encryption", "Pen Testing", "SIEM", "Threat Modeling"] },
  { category: "Leadership", items: ["Team Management", "Architecture Design", "Product Strategy", "Agile", "Mentoring", "Investor Relations"] },
];

export default function Home() {
  const [formData, setFormData] = useState({ name: "", email: "", purpose: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [accessRequest, setAccessRequest] = useState<string | null>(null);
  const [accessForm, setAccessForm] = useState({ name: "", email: "", company: "", reason: "" });
  const [accessSubmitted, setAccessSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: "", email: "", purpose: "", message: "" });
  };

  const handleAccessRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setAccessSubmitted(true);
    setTimeout(() => { setAccessSubmitted(false); setAccessRequest(null); }, 3000);
    setAccessForm({ name: "", email: "", company: "", reason: "" });
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold tracking-wide text-gold">SL</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-mono text-gray-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full"><span className="w-1 h-1 rounded-full bg-emerald-400" />SZL Portfolio · Profile 83%</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            {["About", "Experience", "Case Studies", "Work", "Contact"].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-sm text-muted-foreground hover:text-foreground transition">{item}</a>
            ))}
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gold/3 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gold/2 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(40 80% 55%) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center mx-auto mb-8"
            >
              <span className="font-display text-4xl font-bold text-gold">SL</span>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xs uppercase tracking-[0.35em] text-gold/70 mb-5 font-medium">
              Technology Leader &middot; Architect &middot; Founder
            </motion.p>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6">
              <span className="text-foreground">Stephen</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-300 to-gold">Lutar</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Building the future of enterprise security, AI infrastructure, and intelligent systems.
              Founder of SZL Holdings — a portfolio of platforms protecting and powering digital operations worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#case-studies" className="px-8 py-4 rounded-full bg-gold text-background font-semibold text-sm tracking-wide hover:bg-gold/90 transition flex items-center justify-center gap-2">
                View Case Studies <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#contact" className="px-8 py-4 rounded-full border border-border text-foreground font-semibold text-sm tracking-wide hover:bg-muted/50 transition text-center">
                Get in Touch
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.6 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" />
          </motion.div>
        </div>
      </section>

      <section className="py-6 px-6 border-y border-border/30 bg-muted/20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
          {[
            { label: "Years Experience", value: "10+" },
            { label: "Platforms Built", value: "15+" },
            { label: "Team Members Led", value: "30+" },
            { label: "Events Processed Daily", value: "50M+" },
            { label: "Enterprise Clients", value: "200+" },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className="text-xl font-display font-bold text-gold">{stat.value}</span>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 mb-3">About</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Executive Profile</h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <AnimatedSection className="lg:col-span-2" delay={0.1}>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Stephen Lutar is a technology strategist and hands-on architect with over a decade of experience building enterprise-grade platforms at the intersection of security, AI, and infrastructure.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  As Founder & CEO of SZL Holdings, Stephen has architected a portfolio of 15+ integrated platforms — from real-time threat detection systems processing 50M+ daily events, to predictive AI engines, to maritime fleet intelligence — all built on a unified TypeScript monorepo with zero-trust security principles.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Prior to SZL Holdings, Stephen held senior architecture and engineering leadership roles at enterprise security and cloud infrastructure companies, where he led teams of 12+ engineers, designed systems serving 100k+ concurrent users, and implemented zero-trust architectures for Fortune 500 clients.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  His approach combines deep technical expertise with strategic product vision — building systems that are not just functional, but fundamentally well-architected, secure by design, and built to scale.
                </p>

                <div className="pt-4 border-t border-border/30">
                  <blockquote className="border-l-2 border-gold/40 pl-5 italic text-muted-foreground">
                    "The best systems aren't built to handle today's problems — they're architected to anticipate tomorrow's. Security, scalability, and maintainability aren't features; they're foundations."
                  </blockquote>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="space-y-4">
                <div className="w-full aspect-[3/4] rounded-2xl bg-gradient-to-br from-gold/10 to-gold/3 border border-gold/15 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                      <span className="font-display text-3xl font-bold text-gold">SL</span>
                    </div>
                    <p className="text-sm font-display font-semibold text-foreground">Stephen Lutar</p>
                    <p className="text-xs text-muted-foreground mt-1">Founder & CEO, SZL Holdings</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Building2, label: "SZL Holdings", sub: "Founder & CEO" },
                    { icon: MapPin, label: "Remote — Worldwide", sub: "Global Operations" },
                    { icon: GraduationCap, label: "Computer Science", sub: "B.S. — Software Engineering" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
                      <item.icon className="w-4 h-4 text-gold shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section id="experience" className="py-24 px-6 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="mb-16 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 mb-3">Career Journey</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Impact-Driven Timeline</h2>
            </div>
          </AnimatedSection>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-gold/10 to-transparent" />

            {timeline.map((exp, i) => (
              <AnimatedSection key={exp.role} delay={i * 0.1}>
                <div className={`relative flex flex-col md:flex-row gap-6 mb-16 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-gold border-[3px] border-background z-10 mt-1 shadow-lg shadow-gold/20" />
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full bg-gold/10 -mt-1 z-0 animate-ping" style={{ animationDuration: "3s" }} />

                  <div className={`md:w-1/2 ${i % 2 === 0 ? "md:text-right md:pr-14" : "md:pl-14"} pl-12 md:pl-0`}>
                    <span className="text-xs text-gold font-mono font-semibold">{exp.period}</span>
                    <h3 className="text-xl font-display font-bold text-foreground mt-1">{exp.role}</h3>
                    <p className="text-sm text-gold/70 mb-3 font-medium">{exp.company}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{exp.description}</p>

                    <div className={`p-3 rounded-lg bg-card border border-border/50 mb-4 ${i % 2 === 0 ? "md:ml-auto" : ""} max-w-sm`}>
                      <p className="text-[10px] uppercase tracking-wider text-gold/60 font-semibold mb-2">Impact</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{exp.impact}</p>
                    </div>

                    <div className={`flex flex-wrap gap-2 ${i % 2 === 0 ? "md:justify-end" : ""}`}>
                      {exp.achievements.map(h => (
                        <span key={h} className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gold/10 text-gold/80 border border-gold/15">{h}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section id="case-studies" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="mb-16 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 mb-3">Achievements</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Case Studies</h2>
              <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">Detailed explorations of key projects, their challenges, and measurable outcomes.</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {caseStudies.map((study, i) => (
              <AnimatedSection key={study.title} delay={i * 0.1}>
                <div className="rounded-2xl bg-card border border-border hover:border-gold/20 transition-all duration-300 overflow-hidden h-full">
                  <div className={`h-3 bg-gradient-to-r ${study.color}`} />
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${study.color} flex items-center justify-center shrink-0`}>
                        <study.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground leading-tight">{study.title}</h3>
                        <p className="text-xs text-gold/70 mt-1">{study.role} — {study.client}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-5">
                      {study.metrics.map(m => (
                        <div key={m.label} className="text-center p-2.5 rounded-lg bg-muted/30 border border-border/50">
                          <p className="text-lg font-display font-bold text-gold">{m.value}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{m.suffix || m.label}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{study.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {study.technologies.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="py-24 px-6 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="mb-16 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 mb-3">Portfolio</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Selected Work</h2>
              <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">A curated selection of platforms from the SZL Holdings portfolio.</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {selectedWork.map((project, i) => (
              <AnimatedSection key={project.name} delay={i * 0.08}>
                <div className="group rounded-2xl bg-card border border-border hover:border-gold/20 transition-all duration-300 overflow-hidden h-full">
                  <div className={`h-32 bg-gradient-to-br ${project.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-15">
                      <div className="absolute top-3 left-4 right-4 h-2 rounded bg-white/30" />
                      <div className="absolute top-7 left-4 w-1/3 h-1.5 rounded bg-white/20" />
                      <div className="absolute top-12 left-4 right-4 grid grid-cols-3 gap-2">
                        <div className="h-8 rounded bg-white/15" />
                        <div className="h-8 rounded bg-white/15" />
                        <div className="h-8 rounded bg-white/15" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
                      <project.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-lg font-bold text-foreground">{project.name}</h3>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.3}>
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-gold/60" />
                <h3 className="font-display text-xl font-bold text-foreground">Private Projects</h3>
                <div className="h-px flex-1 bg-border/30" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {privateProjects.map(project => (
                  <div key={project.name} className="relative rounded-2xl bg-card border border-border overflow-hidden">
                    <div className="absolute inset-0 backdrop-blur-sm bg-background/60 z-10 flex flex-col items-center justify-center">
                      <Lock className="w-8 h-8 text-muted-foreground/30 mb-3" />
                      <p className="text-xs text-muted-foreground/50 font-medium mb-3">Access Restricted</p>
                      <button
                        onClick={() => setAccessRequest(project.name)}
                        className="px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-semibold hover:bg-gold/20 transition"
                      >
                        Request Access
                      </button>
                    </div>
                    <div className="p-6 opacity-30">
                      <h4 className="font-display text-lg font-bold text-foreground mb-2">{project.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground border border-border">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {accessRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-2xl bg-card border border-border p-8">
            <h3 className="font-display text-xl font-bold text-foreground mb-1">Request Access</h3>
            <p className="text-sm text-muted-foreground mb-6">Request access to <span className="text-gold font-semibold">{accessRequest}</span></p>

            {accessSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-foreground font-semibold">Request Submitted</p>
                <p className="text-sm text-muted-foreground mt-1">We'll review your request and get back to you.</p>
              </div>
            ) : (
              <form onSubmit={handleAccessRequest} className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1.5">Full Name</label>
                  <input type="text" required value={accessForm.name} onChange={e => setAccessForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:border-gold/40 transition" autoComplete="name" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1.5">Email</label>
                  <input type="email" required value={accessForm.email} onChange={e => setAccessForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:border-gold/40 transition" autoComplete="email" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1.5">Company</label>
                  <input type="text" value={accessForm.company} onChange={e => setAccessForm(p => ({ ...p, company: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:border-gold/40 transition" autoComplete="organization" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1.5">Reason for Access</label>
                  <textarea required value={accessForm.reason} onChange={e => setAccessForm(p => ({ ...p, reason: e.target.value }))} rows={3} className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:border-gold/40 transition resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setAccessRequest(null)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg bg-gold text-background text-sm font-semibold hover:bg-gold/90 transition">Submit Request</button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      <section id="skills" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="mb-16 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 mb-3">Expertise</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Skills & Competencies</h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((group, i) => (
              <AnimatedSection key={group.category} delay={i * 0.06}>
                <div className="rounded-xl bg-card border border-border p-5 h-full">
                  <h3 className="text-sm font-semibold text-gold mb-4 uppercase tracking-wider">{group.category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map(item => (
                      <span key={item} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground border border-border/50">{item}</span>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 px-6 bg-muted/10">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection>
            <div className="mb-12 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 mb-3">Let's Connect</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Get in Touch</h2>
              <p className="text-sm text-muted-foreground mt-3">Interested in collaboration, consulting, or exploring opportunities together?</p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {[
                { icon: Mail, label: "stephen@szlholdings.com", href: "mailto:stephen@szlholdings.com" },
                { icon: MapPin, label: "Remote — Worldwide" },
                { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/in/stephenlutar" },
                { icon: Github, label: "GitHub", href: "https://github.com/stephenlutar" },
                { icon: Globe, label: "szlholdings.com", href: "https://szlholdings.com" },
              ].map(link => (
                link.href ? (
                  <a key={link.label} href={link.href} target={link.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </a>
                ) : (
                  <span key={link.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </span>
                )
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <form onSubmit={handleSubmit} className="rounded-2xl bg-card border border-border p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-2">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 transition" placeholder="Your name" required autoComplete="name" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-2">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 transition" placeholder="your@email.com" required autoComplete="email" />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-2">Purpose</label>
                <select value={formData.purpose} onChange={e => setFormData(p => ({ ...p, purpose: e.target.value }))} className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:border-gold/40 transition" required>
                  <option value="">Select inquiry type...</option>
                  <option value="recruiting">Recruiting Inquiry</option>
                  <option value="consulting">Consulting Engagement</option>
                  <option value="speaking">Speaking Opportunity</option>
                  <option value="investment">Investment Discussion</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-2">Message</label>
                <textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} rows={5} className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 transition resize-none" placeholder="Tell me about your project, opportunity, or how I can help..." required />
              </div>
              <button type="submit" className="w-full py-3.5 rounded-lg bg-gold text-background font-semibold text-sm tracking-wide hover:bg-gold/90 transition flex items-center justify-center gap-2">
                {submitted ? <>Message Sent <CheckCircle className="w-4 h-4" /></> : <>Send Message <Send className="w-4 h-4" /></>}
              </button>
            </form>
          </AnimatedSection>
        </div>
      </section>

      <footer className="border-t border-border/30 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold text-gold">SL</span>
            <span className="text-xs text-muted-foreground">Stephen Lutar — Technology Leader & Architect</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://linkedin.com/in/stephenlutar" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold transition"><Linkedin className="w-4 h-4" /></a>
            <a href="https://github.com/stephenlutar" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold transition"><Github className="w-4 h-4" /></a>
            <a href="mailto:stephen@szlholdings.com" className="text-muted-foreground hover:text-gold transition"><Mail className="w-4 h-4" /></a>
          </div>
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
