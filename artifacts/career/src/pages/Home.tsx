import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Mail, MapPin, Briefcase, Award, Code2, Star,
  ExternalLink, Send, Linkedin, Github, Globe, ChevronDown,
  Shield, Brain, Zap, Server, BarChart3, Layers
} from "lucide-react";

const experience = [
  {
    role: "Founder & CEO",
    company: "SZL Holdings",
    period: "2023 — Present",
    description: "Building a portfolio of enterprise security, AI, and infrastructure platforms. Leading architecture, product strategy, and engineering across 11+ web applications serving the cybersecurity and intelligence sectors.",
    highlights: ["9-platform SaaS portfolio", "Full-stack TypeScript architecture", "AI-powered threat detection"],
  },
  {
    role: "Senior Software Architect",
    company: "Enterprise Security Division",
    period: "2020 — 2023",
    description: "Designed and implemented zero-trust security architectures for Fortune 500 clients. Led a team of 12 engineers building real-time threat monitoring systems processing 50M+ events daily.",
    highlights: ["Zero-trust architecture", "50M+ daily events processed", "12-engineer team leadership"],
  },
  {
    role: "Lead Full-Stack Engineer",
    company: "Cloud Infrastructure Corp",
    period: "2017 — 2020",
    description: "Architected microservices platform handling 100k+ concurrent users. Built real-time analytics dashboards and automated deployment pipelines reducing release cycles by 80%.",
    highlights: ["100k+ concurrent users", "80% faster deployments", "Microservices architecture"],
  },
  {
    role: "Software Engineer",
    company: "Digital Innovation Labs",
    period: "2015 — 2017",
    description: "Full-stack development for fintech and healthcare startups. Implemented secure payment processing, HIPAA-compliant data pipelines, and responsive web applications.",
    highlights: ["Payment processing systems", "HIPAA compliance", "React & Node.js"],
  },
];

const projectsData = [
  { name: "ROSIE", description: "AI-powered security monitoring with real-time threat detection, incident response, and the Alloy AI chat assistant.", tags: ["React", "TypeScript", "AI", "Security"], icon: Shield, color: "from-cyan-500 to-violet-600" },
  { name: "Aegis", description: "Enterprise defensive security platform with threat assessment, vulnerability scanning, and compliance monitoring.", tags: ["Security", "Zero-Trust", "React"], icon: Shield, color: "from-amber-500 to-yellow-600" },
  { name: "Beacon", description: "Centralized telemetry and analytics dashboard with KPI tracking, project management, and cross-platform insights.", tags: ["Analytics", "Dashboard", "Charts"], icon: BarChart3, color: "from-cyan-400 to-blue-600" },
  { name: "Zeus", description: "Modular core architecture engine powering the entire SZL ecosystem with adaptive scaling and health monitoring.", tags: ["Infrastructure", "Modules", "TypeScript"], icon: Zap, color: "from-yellow-500 to-amber-600" },
  { name: "DreamEra", description: "Neural storytelling platform with artifact mapping, narrative intelligence, and AI-driven creative synthesis.", tags: ["AI", "Storytelling", "Neural"], icon: Brain, color: "from-violet-500 to-blue-600" },
  { name: "Nimbus", description: "Predictive intelligence platform with confidence-scored AI forecasting, anomaly detection, and system alerts.", tags: ["AI", "Predictions", "Analytics"], icon: Brain, color: "from-cyan-500 to-violet-600" },
];

const skills = [
  { category: "Languages", items: ["TypeScript", "JavaScript", "Python", "Go", "SQL", "HTML/CSS"] },
  { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "Vite", "Redux"] },
  { category: "Backend", items: ["Node.js", "Express", "PostgreSQL", "Redis", "GraphQL", "REST"] },
  { category: "Infrastructure", items: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Nginx"] },
  { category: "Security", items: ["Zero-Trust", "OAuth/OIDC", "Encryption", "Penetration Testing", "SIEM", "Threat Modeling"] },
  { category: "Leadership", items: ["Team Management", "Architecture Design", "Product Strategy", "Agile/Scrum", "Code Review", "Mentoring"] },
];

export default function Home() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-lg font-bold tracking-wide text-gold">SL</span>
          <div className="hidden sm:flex items-center gap-6">
            {["Experience", "Projects", "Skills", "Contact"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition">{item}</a>
            ))}
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-gold/3 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gold/2 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center mx-auto mb-8">
              <span className="font-display text-3xl font-bold text-gold">SL</span>
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-gold/70 mb-4 font-medium">Architect &middot; Engineer &middot; Leader</p>

            <h1 className="font-display text-5xl sm:text-7xl font-bold leading-[1.1] mb-6">
              <span className="text-foreground">Sean</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-amber-300">Lutar</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Building the future of enterprise security and AI infrastructure. Founder of SZL Holdings — a portfolio of platforms protecting and powering digital operations worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#projects" className="px-8 py-4 rounded-full bg-gold text-background font-semibold text-sm tracking-wide hover:bg-gold/90 transition flex items-center justify-center gap-2">
                View My Work <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#contact" className="px-8 py-4 rounded-full border border-border text-foreground font-semibold text-sm tracking-wide hover:bg-muted/50 transition text-center">
                Get in Touch
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" />
          </motion.div>
        </div>
      </section>

      <section className="py-6 px-6 border-y border-border/30 bg-muted/20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {[
            { label: "Years Experience", value: "10+" },
            { label: "Platforms Built", value: "11" },
            { label: "Team Members Led", value: "30+" },
            { label: "Events Processed Daily", value: "50M+" },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className="text-xl font-display font-bold text-gold">{stat.value}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="experience" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/70 mb-3">Career Journey</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Experience</h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-gold/10 to-transparent" />

            {experience.map((exp, i) => (
              <motion.div
                key={exp.role}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`relative flex flex-col md:flex-row gap-6 mb-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className="absolute left-4 md:left-1/2 w-3 h-3 -translate-x-1/2 rounded-full bg-gold border-2 border-background z-10 mt-1" />

                <div className={`md:w-1/2 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"} pl-10 md:pl-0`}>
                  <span className="text-xs text-gold font-mono">{exp.period}</span>
                  <h3 className="text-lg font-display font-bold text-foreground mt-1">{exp.role}</h3>
                  <p className="text-sm text-gold/70 mb-3">{exp.company}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{exp.description}</p>
                  <div className={`flex flex-wrap gap-2 ${i % 2 === 0 ? "md:justify-end" : ""}`}>
                    {exp.highlights.map(h => (
                      <span key={h} className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gold/10 text-gold/80 border border-gold/15">{h}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="py-24 px-6 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/70 mb-3">Portfolio</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Featured Projects</h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">A selection of platforms from the SZL Holdings portfolio, each solving critical enterprise challenges.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsData.map((project, i) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl bg-card border border-border hover:border-gold/20 transition-all duration-300 overflow-hidden"
              >
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/70 mb-3">Expertise</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Skills & Competencies</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((group, i) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl bg-card border border-border p-5"
              >
                <h3 className="text-sm font-semibold text-gold mb-4 uppercase tracking-wider">{group.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(item => (
                    <span key={item} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground border border-border/50">{item}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 px-6 bg-muted/10">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/70 mb-3">Let's Connect</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Get in Touch</h2>
            <p className="text-sm text-muted-foreground mt-3">Interested in collaboration, investment, or just want to chat about the future of security and AI?</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {[
              { icon: Mail, label: "sean@szlholdings.com", href: "mailto:sean@szlholdings.com" },
              { icon: MapPin, label: "Remote — Worldwide", href: "#" },
              { icon: Linkedin, label: "LinkedIn", href: "#" },
              { icon: Github, label: "GitHub", href: "#" },
            ].map(link => (
              <a key={link.label} href={link.href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition">
                <link.icon className="w-4 h-4" />
                {link.label}
              </a>
            ))}
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-card border border-border p-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 transition"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 transition"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 transition resize-none"
                placeholder="Tell me about your project or opportunity..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-lg bg-gold text-background font-semibold text-sm tracking-wide hover:bg-gold/90 transition flex items-center justify-center gap-2"
            >
              {submitted ? (
                <>Message Sent</>
              ) : (
                <>Send Message <Send className="w-4 h-4" /></>
              )}
            </button>
          </motion.form>
        </div>
      </section>

      <footer className="border-t border-border/30 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold text-gold">SL</span>
            <span className="text-xs text-muted-foreground">Sean Lutar — Portfolio</span>
          </div>
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
