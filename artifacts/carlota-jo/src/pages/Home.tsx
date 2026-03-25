import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronDown, ChevronRight, ArrowRight, ArrowUp,
  Briefcase, TrendingUp, Shield, Code, BarChart3, GitMerge,
  Quote, Star, CheckCircle2, Clock, DollarSign, Users,
  Mail, Phone, MapPin, Linkedin, Twitter
} from "lucide-react";

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const services = [
  {
    icon: Briefcase,
    title: "Strategic Advisory",
    tagline: "Charting the path to sustainable growth",
    description: "We partner with C-suite executives and board members to develop actionable strategies that drive long-term value creation. Our advisory practice combines deep industry expertise with rigorous analytical frameworks to navigate complex business landscapes.",
    deliverables: ["Corporate Strategy Development", "Market Entry & Expansion Planning", "Competitive Positioning Analysis", "Strategic Roadmap & KPI Framework", "Board Advisory & Governance Support"],
  },
  {
    icon: TrendingUp,
    title: "Portfolio Optimization",
    tagline: "Maximizing returns across your entire portfolio",
    description: "Our portfolio optimization practice helps family offices, holding companies, and institutional investors restructure and reallocate assets for maximum risk-adjusted returns. We bring a disciplined approach to portfolio construction backed by proprietary analytics.",
    deliverables: ["Asset Allocation & Rebalancing", "Performance Attribution Analysis", "Risk-Adjusted Return Modeling", "Alternative Investment Sourcing", "Portfolio Governance Framework"],
  },
  {
    icon: Code,
    title: "Technology Transformation",
    tagline: "Architecting the digital enterprise",
    description: "We guide organizations through comprehensive digital transformation initiatives — from cloud migration and AI integration to platform modernization. Our team bridges the gap between technology and business strategy to deliver measurable outcomes.",
    deliverables: ["Digital Maturity Assessment", "Cloud & Infrastructure Strategy", "AI/ML Implementation Roadmap", "Enterprise Architecture Design", "Technology Vendor Evaluation"],
  },
  {
    icon: Shield,
    title: "Risk & Compliance",
    tagline: "Protecting value through proactive governance",
    description: "Our risk practice builds resilient governance frameworks that protect your enterprise while enabling growth. We address regulatory compliance, cybersecurity risk, operational continuity, and reputational exposure with a holistic, forward-looking methodology.",
    deliverables: ["Enterprise Risk Assessment", "Regulatory Compliance Framework", "Cybersecurity Governance", "Business Continuity Planning", "ESG Risk Integration"],
  },
  {
    icon: BarChart3,
    title: "Growth Strategy",
    tagline: "Scaling with precision and purpose",
    description: "We help growth-stage and established companies identify and execute on their highest-value opportunities. Our growth strategy practice combines market intelligence, financial modeling, and operational expertise to accelerate sustainable expansion.",
    deliverables: ["Revenue Growth Modeling", "Customer Acquisition Strategy", "Pricing & Monetization Design", "Geographic Expansion Planning", "Partnership & Channel Strategy"],
  },
  {
    icon: GitMerge,
    title: "M&A Advisory",
    tagline: "Strategic transactions that create lasting value",
    description: "From target identification through post-merger integration, our M&A practice delivers end-to-end transaction support. We bring a principal's perspective to every deal, ensuring strategic alignment and operational continuity throughout the lifecycle.",
    deliverables: ["Target Screening & Evaluation", "Due Diligence Management", "Valuation & Deal Structuring", "Integration Planning & Execution", "Synergy Realization Tracking"],
  },
];

const testimonials = [
  {
    quote: "Carlota Jo Consulting transformed our portfolio strategy. Their analytical rigor combined with genuine strategic intuition helped us realize a 340% return over 36 months.",
    name: "Victoria Ashworth-Reid",
    title: "Chief Investment Officer",
    company: "Meridian Capital Partners",
  },
  {
    quote: "The technology transformation roadmap they developed became the foundation for our entire digital strategy. Implementation was seamless, and ROI exceeded projections by 2x.",
    name: "Marcus Chen",
    title: "CEO",
    company: "Apex Digital Holdings",
  },
  {
    quote: "Their M&A advisory during our $800M acquisition was exceptional. Every detail was handled with precision, and the post-merger integration plan they developed saved us months of disruption.",
    name: "Catherine Blackwell",
    title: "Managing Director",
    company: "Silverstone Group",
  },
  {
    quote: "Working with Carlota Jo Consulting elevated our governance framework from compliance-driven to truly strategic. Their risk methodology is now embedded in our decision-making at every level.",
    name: "James Harrington III",
    title: "Board Chair",
    company: "Atlas Family Office",
  },
];

const caseStudies = [
  {
    title: "Digital Transformation of a $2B Industrial Conglomerate",
    industry: "Manufacturing & Industry",
    challenge: "A multi-national industrial group faced declining margins and competitive pressure from digitally-native competitors. Legacy systems, siloed data, and resistance to change created significant operational friction across 14 business units.",
    approach: "We conducted a comprehensive digital maturity assessment across all divisions, identifying $180M in potential efficiency gains. Our phased transformation roadmap prioritized quick wins while building toward a unified data platform and AI-driven operations.",
    outcome: "Within 18 months, the client achieved a 28% reduction in operational costs, launched three new digital revenue streams, and consolidated 47 legacy systems into a modern cloud architecture. Employee satisfaction scores increased by 35%.",
    metrics: ["$180M efficiency gains identified", "28% cost reduction", "3 new digital revenue streams", "18-month transformation"],
  },
  {
    title: "Portfolio Restructuring for a Multi-Generational Family Office",
    industry: "Wealth Management",
    challenge: "A third-generation family office managing $4.2B in assets faced concentration risk, generational transition challenges, and an underperforming alternative investment allocation that was eroding returns.",
    approach: "We performed a complete portfolio diagnostic, stress-tested allocations against multiple scenarios, and developed a diversification strategy that honored the family's values while pursuing institutional-grade returns. We also facilitated governance workshops to align three generations of stakeholders.",
    outcome: "The restructured portfolio delivered 22% annualized returns over two years, reduced concentration risk by 60%, and established a governance charter that has successfully guided the family through two leadership transitions.",
    metrics: ["$4.2B assets under advisory", "22% annualized returns", "60% concentration risk reduction", "3 generations aligned"],
  },
  {
    title: "Strategic Acquisition & Integration of a FinTech Platform",
    industry: "Financial Services",
    challenge: "A mid-market financial services firm identified a strategic acquisition target but lacked the internal capability to evaluate technology assets, structure the deal, and plan integration without disrupting core operations.",
    approach: "We led the end-to-end transaction from target evaluation through integration planning. Our team conducted technical due diligence, developed a detailed synergy model, negotiated deal terms, and created a 100-day integration playbook covering technology, talent, and client migration.",
    outcome: "The $340M acquisition closed 6 weeks ahead of schedule. Post-merger integration achieved 95% client retention, realized $45M in annual synergies within the first year, and the combined platform now serves 2.3M users across 12 markets.",
    metrics: ["$340M transaction value", "95% client retention", "$45M annual synergies", "6 weeks ahead of schedule"],
  },
];

const metrics = [
  { value: "$12.4B", label: "Portfolio Value Managed" },
  { value: "160+", label: "Engagements Delivered" },
  { value: "94%", label: "Client Retention Rate" },
  { value: "22", label: "Years of Experience" },
];

const partners = [
  "McKinsey Alumni Network",
  "Harvard Business School",
  "CFA Institute",
  "World Economic Forum",
  "Bloomberg Terminal Partner",
];

export default function Home() {
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", service: "", budget: "", timeline: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}../api/carlota-jo/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactSubmitted(true);
      }
    } catch {
    } finally {
      setContactLoading(false);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground font-serif">CJ</span>
            </div>
            <div>
              <span className="font-serif text-lg font-semibold tracking-wide text-foreground">Carlota Jo</span>
              <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Consulting</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Services", href: "#services" },
              { label: "About", href: "#about" },
              { label: "Case Studies", href: "#case-studies" },
              { label: "Contact", href: "#contact" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/consultation"
              className="px-6 py-2.5 bg-primary text-primary-foreground font-medium text-sm rounded-sm hover:bg-primary/90 transition-colors tracking-wide"
            >
              Book Consultation
            </Link>
          </nav>

          <Link href="/consultation" className="md:hidden px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm">
            Book
          </Link>
        </div>
      </header>

      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-amber-950/20" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-amber-800/5 rounded-full blur-3xl" />
          <motion.div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsla(38,60%,55%,0.3) 1px, transparent 1px), linear-gradient(90deg, hsla(38,60%,55%,0.3) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
            animate={{ backgroundPosition: ["0px 0px", "80px 80px"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <span className="inline-block px-4 py-1.5 text-xs tracking-[0.3em] uppercase text-primary border border-primary/20 rounded-full font-medium">
              Strategic Advisory & Portfolio Management
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight mb-8 leading-[1.1]"
          >
            Where Vision Meets{" "}
            <span className="gold-gradient italic">Precision</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            Carlota Jo Consulting delivers elite strategic advisory for enterprises, family offices,
            and institutional investors. We build lasting value through disciplined analysis, visionary strategy,
            and flawless execution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/consultation"
              className="px-8 py-4 bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
            >
              Schedule a Consultation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#services"
              className="px-8 py-4 border border-primary/20 text-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              Our Services
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground/50" />
        </motion.div>
      </section>

      <section className="py-20 border-t border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {metrics.map((metric, i) => (
              <AnimatedSection key={metric.label} delay={i * 0.1} className="text-center">
                <div className="text-3xl md:text-4xl font-serif font-bold gold-gradient mb-2">{metric.value}</div>
                <div className="text-sm text-muted-foreground tracking-wide">{metric.label}</div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">What We Do</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-6">Our Practice Areas</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light">
              Six disciplined practice areas, each led by senior advisors with decades of operating and consulting experience.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isExpanded = expandedService === index;
              return (
                <AnimatedSection key={service.title} delay={index * 0.08}>
                  <div className={`h-full p-8 rounded-lg luxury-border luxury-border-hover transition-all duration-300 bg-card ${isExpanded ? "ring-1 ring-primary/20" : ""}`}>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-2">{service.title}</h3>
                    <p className="text-sm text-primary/80 italic mb-4 font-serif">{service.tagline}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{service.description}</p>

                    <button
                      onClick={() => setExpandedService(isExpanded ? null : index)}
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 mb-4"
                    >
                      {isExpanded ? "Show Less" : "Key Deliverables"}
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {isExpanded && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 border-t border-border/50 pt-4"
                      >
                        {service.deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            {d}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="py-24 md:py-32 bg-card/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <div className="aspect-[4/5] rounded-lg overflow-hidden luxury-border relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-amber-900/20 to-background flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-amber-800/30 mx-auto mb-6 flex items-center justify-center">
                      <span className="text-4xl font-serif font-bold gold-gradient">CJ</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic font-serif">Founder & Managing Partner</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">The Founder</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mt-4 mb-6">Carlota Jo Blackwell</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  With over two decades of experience spanning private equity, management consulting, and enterprise technology,
                  Carlota Jo Blackwell founded CJ Consulting on the belief that exceptional advisory begins with understanding —
                  not just of markets and models, but of the people and purposes behind every decision.
                </p>
                <p>
                  Prior to founding the firm, Carlota served as a Principal at McKinsey & Company, led portfolio strategy
                  for a $6B family office, and held senior operating roles at two Fortune 500 technology companies.
                  She holds an MBA from Harvard Business School and is a CFA charterholder.
                </p>
                <p className="italic font-serif text-foreground/80 text-lg border-l-2 border-primary/30 pl-4">
                  "Our clients don't need more data — they need clarity. We distill complexity into conviction
                  and transform conviction into measurable results."
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {["CFA Charterholder", "Harvard MBA", "McKinsey Alumni", "Board Director"].map((cred) => (
                  <span key={cred} className="px-3 py-1.5 text-xs tracking-wider uppercase border border-primary/20 rounded-full text-primary/80">
                    {cred}
                  </span>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">Trust & Credibility</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-6">What Our Clients Say</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.1}>
                <div className="p-8 rounded-lg luxury-border bg-card h-full flex flex-col">
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  <p className="text-foreground/90 leading-relaxed mb-6 flex-grow font-light italic font-serif text-lg">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{t.name.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.title}, {t.company}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="flex flex-wrap justify-center gap-8 md:gap-12 py-8 border-t border-b border-border/30">
            {partners.map((p) => (
              <span key={p} className="text-sm text-muted-foreground/60 tracking-wide font-medium">{p}</span>
            ))}
          </AnimatedSection>
        </div>
      </section>

      <section id="case-studies" className="py-24 md:py-32 bg-card/50">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">Selected Work</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-6">Case Studies</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light">
              Representative engagements demonstrating our approach and impact across industries.
            </p>
          </AnimatedSection>

          <div className="space-y-12">
            {caseStudies.map((cs, i) => (
              <AnimatedSection key={cs.title} delay={i * 0.1}>
                <div className="rounded-lg luxury-border bg-card overflow-hidden">
                  <div className="p-8 md:p-12">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="px-3 py-1 text-xs tracking-wider uppercase bg-primary/10 text-primary rounded-full">{cs.industry}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-8">{cs.title}</h3>

                    <div className="grid md:grid-cols-3 gap-8">
                      <div>
                        <h4 className="text-sm font-semibold tracking-wider uppercase text-primary mb-3">Challenge</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">{cs.challenge}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold tracking-wider uppercase text-primary mb-3">Approach</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">{cs.approach}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold tracking-wider uppercase text-primary mb-3">Outcome</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">{cs.outcome}</p>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/30 flex flex-wrap gap-4">
                      {cs.metrics.map((m) => (
                        <span key={m} className="flex items-center gap-2 text-sm text-foreground/80">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16">
            <AnimatedSection>
              <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">Get in Touch</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mt-4 mb-6">Start a Conversation</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Every engagement begins with a conversation. Tell us about your objectives and challenges,
                and we'll share how our expertise can help you achieve measurable results.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">inquiries@carlotajo.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">+1 (212) 555-0140</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Office</p>
                    <p className="font-medium">590 Madison Avenue, Suite 2800</p>
                    <p className="text-sm text-muted-foreground">New York, NY 10022</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              {contactSubmitted ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-8 rounded-lg luxury-border bg-card">
                    <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-serif font-bold mb-2">Inquiry Received</h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. A member of our team will respond within one business day.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5 p-8 rounded-lg luxury-border bg-card">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Full Name</label>
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Email</label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Service Interest</label>
                    <select
                      required
                      value={contactForm.service}
                      onChange={(e) => setContactForm((f) => ({ ...f, service: e.target.value }))}
                      className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                    >
                      <option value="">Select a service area</option>
                      {services.map((s) => (
                        <option key={s.title} value={s.title}>{s.title}</option>
                      ))}
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Budget Range</label>
                      <select
                        value={contactForm.budget}
                        onChange={(e) => setContactForm((f) => ({ ...f, budget: e.target.value }))}
                        className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                      >
                        <option value="">Select range</option>
                        <option value="Under $50K">Under $50K</option>
                        <option value="$50K - $150K">$50K - $150K</option>
                        <option value="$150K - $500K">$150K - $500K</option>
                        <option value="$500K+">$500K+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Timeline</label>
                      <select
                        value={contactForm.timeline}
                        onChange={(e) => setContactForm((f) => ({ ...f, timeline: e.target.value }))}
                        className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                      >
                        <option value="">Select timeline</option>
                        <option value="Immediate">Immediate</option>
                        <option value="1-3 months">1-3 months</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="6+ months">6+ months</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                      className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                      placeholder="Tell us about your objectives and how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="w-full py-3.5 bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {contactLoading ? "Submitting..." : "Submit Inquiry"}
                    {!contactLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 bg-card/30 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground font-serif">CJ</span>
                </div>
                <span className="font-serif text-lg font-semibold">Carlota Jo Consulting</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Elite strategic advisory for enterprises, family offices, and institutional investors.
                Building lasting value through disciplined analysis and visionary strategy.
              </p>
              <div className="flex gap-3 mt-6">
                <span className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground/40">
                  <Linkedin className="w-4 h-4" />
                </span>
                <span className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground/40">
                  <Twitter className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm tracking-wider uppercase mb-4">Services</h4>
              <ul className="space-y-2">
                {services.slice(0, 4).map((s) => (
                  <li key={s.title}>
                    <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{s.title}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-sm tracking-wider uppercase mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a></li>
                <li><a href="#case-studies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Case Studies</a></li>
                <li><a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
                <li><span className="text-sm text-muted-foreground/50">Privacy Policy</span></li>
                <li><span className="text-sm text-muted-foreground/50">Terms of Service</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Carlota Jo Consulting. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Top <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
