import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronDown, ChevronRight, ChevronLeft, ArrowRight, ArrowUp,
  Briefcase, TrendingUp, Shield, Code, BarChart3, GitMerge,
  Quote, Star, CheckCircle2, Clock, DollarSign, Users,
  Mail, Phone, MapPin, Linkedin, Twitter
} from "lucide-react";

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");
  const isDecimal = !Number.isInteger(value);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1800;
    const steps = 40;
    const increment = value / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const current = Math.min(value, increment * step);
      setDisplay(isDecimal ? current.toFixed(1) : Math.round(current).toString());
      if (step >= steps) {
        setDisplay(isDecimal ? value.toFixed(1) : value.toString());
        clearInterval(timer);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value, isDecimal]);

  return <span ref={ref}>{prefix}{display}{suffix}</span>;
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
  { label: "Portfolio Value Managed", numericValue: 12.4, prefix: "$", suffix: "B" },
  { label: "Engagements Delivered", numericValue: 160, prefix: "", suffix: "+" },
  { label: "Client Retention Rate", numericValue: 94, prefix: "", suffix: "%" },
  { label: "Years of Experience", numericValue: 22, prefix: "", suffix: "" },
];

const partners = [
  "McKinsey Alumni Network",
  "Harvard Business School",
  "CFA Institute",
  "World Economic Forum",
  "Bloomberg Terminal Partner",
];

function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    startTimer();
  };

  const goPrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    startTimer();
  };

  const goNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    startTimer();
  };

  const t = testimonials[activeIndex];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="relative">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden min-h-[320px] md:min-h-[280px] flex items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full"
            >
              <div className="testimonial-card p-10 md:p-14 rounded-xl luxury-border bg-card text-center">
                <Quote className="w-10 h-10 text-primary/20 mx-auto mb-6" />
                <p className="text-foreground/90 leading-relaxed mb-8 font-light italic font-serif text-xl md:text-2xl max-w-3xl mx-auto">
                  "{t.quote}"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-amber-800/20 flex items-center justify-center ring-2 ring-primary/10">
                    <span className="text-sm font-bold text-primary">{t.name.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm tracking-wide">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}, {t.company}</p>
                  </div>
                  <div className="ml-4 flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={goPrev}
            className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === activeIndex ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", service: "", budget: "", timeline: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.96]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

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
        showToast("Your inquiry has been submitted successfully. We'll be in touch within 24 hours.", "success");
      } else {
        showToast("Something went wrong. Please try again or email us directly.", "error");
      }
    } catch {
      showToast("Network error. Please check your connection and try again.", "error");
    } finally {
      setContactLoading(false);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[100] max-w-md px-5 py-4 rounded-lg shadow-2xl border backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-100"
                : "bg-red-950/90 border-red-500/30 text-red-100"
            }`}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${toast.type === "success" ? "text-emerald-400" : "text-red-400"}`} />
              <p className="text-sm leading-relaxed">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <span className="text-sm font-bold text-primary-foreground font-serif">CJ</span>
            </div>
            <div>
              <span className="font-serif text-lg font-semibold tracking-wide text-foreground">Carlota Jo</span>
              <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Consulting</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Your Needs", href: "#services" },
              { label: "Your Industry", href: "#industries" },
              { label: "Results", href: "#case-studies" },
              { label: "Insights", href: "#insights" },
              { label: "Contact", href: "#contact" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide relative after:absolute after:bottom-[-4px] after:left-0 after:h-[1px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/consultation"
              className="btn-primary px-6 py-2.5 font-medium text-sm rounded-sm tracking-wide inline-flex items-center"
            >
              Book Consultation
            </Link>
          </nav>

          <Link href="/consultation" className="md:hidden btn-primary px-4 py-2 text-sm font-medium rounded-sm">
            Book
          </Link>
        </div>
      </header>

      <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

          <div className="absolute inset-0 hero-gradient-mesh" />

          <motion.div
            className="hero-orb absolute w-[500px] h-[500px] rounded-full blur-[100px]"
            style={{ top: "15%", right: "15%", background: "hsla(38, 50%, 40%, 0.08)" }}
          />
          <motion.div
            className="hero-orb-reverse absolute w-[400px] h-[400px] rounded-full blur-[80px]"
            style={{ bottom: "20%", left: "10%", background: "hsla(25, 40%, 30%, 0.06)" }}
          />
          <motion.div
            className="hero-orb absolute w-[300px] h-[300px] rounded-full blur-[60px]"
            style={{ top: "50%", left: "40%", background: "hsla(38, 60%, 55%, 0.04)", animationDelay: "5s" }}
          />

          <motion.div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(hsla(38,60%,55%,0.4) 1px, transparent 1px), linear-gradient(90deg, hsla(38,60%,55%,0.4) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
            animate={{ backgroundPosition: ["0px 0px", "80px 80px"] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-10"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 text-xs tracking-[0.25em] uppercase text-primary/90 border border-primary/15 rounded-full font-medium backdrop-blur-sm bg-primary/[0.03]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
              Strategic Advisory & Portfolio Management
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-serif font-bold tracking-tight mb-8 leading-[1.05]"
          >
            Where Vision Meets{" "}
            <span className="gold-gradient-animated italic">Precision</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-14 font-light leading-relaxed"
          >
            Carlota Jo Consulting delivers elite strategic advisory for enterprises, family offices,
            and institutional investors. We build lasting value through disciplined analysis, visionary strategy,
            and flawless execution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/consultation"
              className="btn-primary px-10 py-4 font-medium text-sm tracking-wider uppercase rounded-sm flex items-center justify-center gap-2 group"
            >
              Schedule a Consultation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#services"
              className="px-10 py-4 border border-primary/15 text-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-primary/5 hover:border-primary/25 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              Our Services
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground/40" />
        </motion.div>
      </section>

      <AnimatedSection className="py-6 border-y border-border/20 bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50 mr-2">Trusted by</span>
            {partners.map((p, i) => (
              <motion.span
                key={p}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-xs text-muted-foreground/40 tracking-wide font-medium"
              >
                {p}
              </motion.span>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {metrics.map((metric, i) => (
              <AnimatedSection key={metric.label} delay={i * 0.1} className="text-center metric-card py-4">
                <div className="text-3xl md:text-5xl font-serif font-bold gold-gradient mb-3">
                  <CountUp value={metric.numericValue} prefix={metric.prefix} suffix={metric.suffix} />
                </div>
                <div className="text-sm text-muted-foreground tracking-wider uppercase">{metric.label}</div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">Proven Results</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mt-3 mb-4">Results at a Glance</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudies.map((cs, i) => (
              <AnimatedSection key={cs.title} delay={i * 0.1}>
                <a href="#case-studies" className="group block p-8 rounded-xl luxury-border luxury-border-hover bg-card h-full transition-all duration-500">
                  <span className="text-[10px] tracking-wider uppercase text-primary/70 font-semibold">{cs.industry}</span>
                  <h3 className="font-serif text-lg font-semibold mt-2 mb-4 group-hover:text-primary/90 transition-colors leading-snug">{cs.title}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {cs.metrics.slice(0, 4).map((m) => (
                      <div key={m} className="px-3 py-2 rounded-lg bg-primary/[0.04] border border-primary/10">
                        <span className="text-xs text-primary font-semibold">{m}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Read Full Case Study <ArrowRight className="w-3 h-3" />
                  </div>
                </a>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section id="services" className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">What We Do</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-6">Our Practice Areas</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Six disciplined practice areas, each led by senior advisors with decades of operating and consulting experience.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isExpanded = expandedService === index;
              return (
                <AnimatedSection key={service.title} delay={index * 0.08}>
                  <div className={`group h-full p-8 rounded-xl card-shine luxury-border luxury-border-hover transition-all duration-500 bg-card ${isExpanded ? "ring-1 ring-primary/20" : ""}`}>
                    <div className="icon-container w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-105">
                      <Icon className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-primary/90 transition-colors">{service.title}</h3>
                    <p className="text-sm text-primary/70 italic mb-4 font-serif">{service.tagline}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5">{service.description}</p>

                    <button
                      onClick={() => setExpandedService(isExpanded ? null : index)}
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 mb-4 group/btn"
                    >
                      {isExpanded ? "Show Less" : "Key Deliverables"}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : "group-hover/btn:translate-y-0.5"}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="space-y-2.5 border-t border-border/50 pt-4 overflow-hidden"
                        >
                          {service.deliverables.map((d, di) => (
                            <motion.li
                              key={d}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: di * 0.08 }}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              {d}
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="py-24 md:py-36 bg-card/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] bg-primary/5" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] bg-amber-900/5" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <div className="aspect-[4/5] rounded-xl overflow-hidden luxury-border relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-amber-900/20 to-background flex items-center justify-center transition-all duration-700 group-hover:from-primary/15 group-hover:via-amber-900/25">
                  <div className="text-center">
                    <motion.div
                      className="w-36 h-36 rounded-full bg-gradient-to-br from-primary/30 to-amber-800/30 mx-auto mb-6 flex items-center justify-center ring-2 ring-primary/10"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                    >
                      <span className="text-5xl font-serif font-bold gold-gradient">CJ</span>
                    </motion.div>
                    <p className="text-sm text-muted-foreground italic font-serif">Founder & Managing Partner</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/50 to-transparent" />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">The Founder</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mt-4 mb-6">Carlota Jo Blackwell</h2>
              <div className="space-y-5 text-muted-foreground leading-relaxed">
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
                <motion.div
                  className="relative pl-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />
                  <p className="italic font-serif text-foreground/80 text-lg">
                    "Our clients don't need more data — they need clarity. We distill complexity into conviction
                    and transform conviction into measurable results."
                  </p>
                </motion.div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {["CFA Charterholder", "Harvard MBA", "McKinsey Alumni", "Board Director"].map((cred, i) => (
                  <motion.span
                    key={cred}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="px-4 py-1.5 text-xs tracking-wider uppercase border border-primary/15 rounded-full text-primary/80 hover:bg-primary/5 hover:border-primary/25 transition-all cursor-default"
                  >
                    {cred}
                  </motion.span>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">Trust & Credibility</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-6">What Our Clients Say</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg font-light">
              Long-term partnerships built on trust, results, and unwavering commitment to excellence.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <TestimonialCarousel />
          </AnimatedSection>

          <AnimatedSection delay={0.3} className="mt-20">
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 py-8 border-t border-b border-border/20">
              {partners.map((p, i) => (
                <motion.span
                  key={p}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm text-muted-foreground/50 tracking-wide font-medium hover:text-muted-foreground/70 transition-colors cursor-default"
                >
                  {p}
                </motion.span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section id="industries" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">Sector Expertise</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mt-3 mb-4">Your Industry, Our Expertise</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light">
              Deep domain knowledge across high-stakes industries where precision and trust are non-negotiable.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Financial Services", desc: "Family offices, private equity, and institutional investors navigating complex portfolios and regulatory landscapes.", stat: "$2.4B+", statLabel: "Assets Advised" },
              { name: "Technology", desc: "Enterprise SaaS, AI/ML platforms, and infrastructure companies scaling from seed to IPO and beyond.", stat: "15+", statLabel: "Platforms Built" },
              { name: "Healthcare & Life Sciences", desc: "Digital health, biotech, and pharmaceutical firms requiring HIPAA-compliant strategy and operational excellence.", stat: "100%", statLabel: "Compliance Rate" },
              { name: "Defense & Government", desc: "Secure systems, intelligence platforms, and mission-critical infrastructure with zero-trust architecture.", stat: "FedRAMP", statLabel: "Ready" },
            ].map((industry, i) => (
              <AnimatedSection key={industry.name} delay={i * 0.08}>
                <div className="h-full p-6 rounded-xl luxury-border luxury-border-hover card-shine bg-card/60 flex flex-col">
                  <h3 className="font-serif text-lg font-bold text-foreground mb-2">{industry.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{industry.desc}</p>
                  <div className="pt-3 border-t border-border/30">
                    <span className="text-xl font-serif font-bold gold-gradient">{industry.stat}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider ml-2">{industry.statLabel}</span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section id="case-studies" className="py-24 md:py-36 bg-card/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full blur-[150px] bg-primary/5" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <AnimatedSection className="text-center mb-20">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">Selected Work</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-6">Case Studies</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light">
              Representative engagements demonstrating our approach and impact across industries.
            </p>
          </AnimatedSection>

          <div className="space-y-12">
            {caseStudies.map((cs, i) => (
              <AnimatedSection key={cs.title} delay={i * 0.15}>
                <div className="group rounded-xl luxury-border luxury-border-hover bg-card overflow-hidden transition-all duration-500">
                  <div className="p-8 md:p-12">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="px-4 py-1.5 text-xs tracking-wider uppercase bg-primary/10 text-primary rounded-full font-medium">{cs.industry}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-8 group-hover:text-primary/90 transition-colors duration-300">{cs.title}</h3>

                    <div className="grid md:grid-cols-3 gap-8">
                      {[
                        { label: "Challenge", content: cs.challenge },
                        { label: "Approach", content: cs.approach },
                        { label: "Outcome", content: cs.outcome },
                      ].map((section, si) => (
                        <div key={section.label} className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{si + 1}</div>
                            <h4 className="text-sm font-semibold tracking-wider uppercase text-primary">{section.label}</h4>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/20 flex flex-wrap gap-4">
                      {cs.metrics.map((m) => (
                        <span key={m} className="flex items-center gap-2 text-sm text-foreground/80 bg-primary/[0.04] px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
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

      <div className="section-divider" />

      <section id="contact" className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16">
            <AnimatedSection>
              <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">Get in Touch</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mt-4 mb-6">Start a Conversation</h2>
              <p className="text-muted-foreground leading-relaxed mb-10">
                Every engagement begins with a conversation. Tell us about your objectives and challenges,
                and we'll share how our expertise can help you achieve measurable results.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Mail, label: "Email", value: "inquiries@carlotajo.com", sub: null },
                  { icon: Phone, label: "Phone", value: "+1 (212) 555-0140", sub: null },
                  { icon: MapPin, label: "Office", value: "590 Madison Avenue, Suite 2800", sub: "New York, NY 10022" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-4 group/contact"
                  >
                    <div className="icon-container w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover/contact:bg-primary/15">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium">{item.value}</p>
                      {item.sub && <p className="text-sm text-muted-foreground">{item.sub}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              {contactSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-center p-10 rounded-xl luxury-border bg-card">
                    <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-serif font-bold mb-2">Inquiry Received</h3>
                    <p className="text-muted-foreground">
                      Thank you for reaching out. A member of our team will respond within one business day.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5 p-8 md:p-10 rounded-xl luxury-border bg-card">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Full Name</label>
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                        className="form-input"
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
                        className="form-input"
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
                      className="form-input"
                    >
                      <option value="">Select a service area</option>
                      {services.map((s) => (
                        <option key={s.title} value={s.title}>{s.title}</option>
                      ))}
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Budget Range</label>
                      <select
                        value={contactForm.budget}
                        onChange={(e) => setContactForm((f) => ({ ...f, budget: e.target.value }))}
                        className="form-input"
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
                        className="form-input"
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
                      className="form-input resize-none"
                      placeholder="Tell us about your objectives and how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="btn-primary w-full py-3.5 font-medium text-sm tracking-wider uppercase rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      <section id="insights" className="py-24 md:py-36 bg-card/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] bg-primary/5" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-medium">Thought Leadership</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 mb-6">Insights & Perspectives</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light">
              Expert analysis on digital transformation, AI strategy, and the evolving landscape of enterprise technology.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                category: "AI Strategy",
                title: "The Executive's Guide to Enterprise AI Adoption in 2026",
                excerpt: "Why 70% of AI initiatives stall — and the three-phase framework we use to ensure measurable ROI within 90 days.",
                readTime: "8 min read",
                date: "Mar 2026",
              },
              {
                category: "Digital Transformation",
                title: "Beyond the Buzzword: What Real Digital Transformation Looks Like",
                excerpt: "Case studies from three Fortune 500 engagements that moved beyond slide decks to deliver $40M+ in measurable value.",
                readTime: "12 min read",
                date: "Feb 2026",
              },
              {
                category: "Cybersecurity",
                title: "Zero-Trust Architecture: From Framework to Implementation",
                excerpt: "A practical roadmap for enterprises transitioning from perimeter security to zero-trust, with lessons from our advisory practice.",
                readTime: "10 min read",
                date: "Jan 2026",
              },
            ].map((article, i) => (
              <AnimatedSection key={article.title} delay={i * 0.12}>
                <div className="group h-full p-8 rounded-xl luxury-border luxury-border-hover bg-card transition-all duration-500 flex flex-col cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 text-[10px] tracking-wider uppercase bg-primary/10 text-primary rounded-full font-semibold">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{article.date}</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3 group-hover:text-primary/90 transition-colors leading-snug flex-grow-0">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                    <span className="text-xs text-muted-foreground/60">{article.readTime}</span>
                    <span className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Read Article <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <footer className="border-t border-border/30 bg-card/30 py-16">
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
                <a href="https://linkedin.com/company/carlota-jo-consulting" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:scale-105">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://twitter.com/carlotajoconsulting" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:scale-105">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm tracking-wider uppercase mb-4 text-foreground/80">Services</h4>
              <ul className="space-y-2.5">
                {services.slice(0, 4).map((s) => (
                  <li key={s.title}>
                    <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{s.title}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-sm tracking-wider uppercase mb-4 text-foreground/80">Company</h4>
              <ul className="space-y-2.5">
                <li><a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a></li>
                <li><a href="#case-studies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Case Studies</a></li>
                <li><a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
                <li><span className="text-sm text-muted-foreground/40">Privacy Policy</span></li>
                <li><span className="text-sm text-muted-foreground/40">Terms of Service</span></li>
              </ul>
            </div>
          </div>

          <div className="section-divider mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} Carlota Jo Consulting. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-foreground transition-colors group"
            >
              Back to Top <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
