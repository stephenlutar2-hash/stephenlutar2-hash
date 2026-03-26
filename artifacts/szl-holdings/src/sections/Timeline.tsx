import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface Milestone {
  year: string;
  title: string;
  description: string;
  highlights: string[];
}

const milestones: Milestone[] = [
  {
    year: "Foundation",
    title: "SZL Holdings Established",
    description: "The vision for a premium technology holding company takes shape — grounded in deep expertise across cybersecurity, AI, and enterprise systems.",
    highlights: ["Vision & strategy defined", "Core architecture designed", "First platform concepts"],
  },
  {
    year: "Security Era",
    title: "ROSIE & Aegis Launch",
    description: "The security suite comes to life. ROSIE delivers AI-powered security monitoring while Aegis provides enterprise defensive capabilities and compliance frameworks.",
    highlights: ["ROSIE command center live", "Aegis threat assessment", "Firestorm simulation beta"],
  },
  {
    year: "Infrastructure",
    title: "Zeus Backbone Engine",
    description: "The Zeus backbone engine is built — the modular, scalable infrastructure layer that powers every SZL platform with shared services and data pipelines.",
    highlights: ["Modular architecture", "Shared service layer", "Real-time data processing"],
  },
  {
    year: "Analytics",
    title: "Beacon & Nimbus Platforms",
    description: "Data intelligence comes online with Beacon's centralized telemetry dashboard and Nimbus's predictive analytics with confidence-scored forecasting.",
    highlights: ["KPI dashboards", "Predictive forecasting", "Anomaly detection"],
  },
  {
    year: "Expansion",
    title: "Creative & Maritime",
    description: "The ecosystem expands into new frontiers — Vessels delivers maritime intelligence, DreamEra powers neural storytelling, and Dreamscape creates immersive creative environments.",
    highlights: ["Vessels vessel tracking", "DreamEra creative AI", "Dreamscape immersive design"],
  },
  {
    year: "Today",
    title: "Full Ecosystem Live",
    description: "15+ platforms operating across five industries. From Alloyscape's integration layer to Carlota Jo Consulting's strategic advisory — the SZL ecosystem is complete and growing.",
    highlights: ["15+ platforms", "5 industries served", "Continuous innovation"],
  },
];

function MilestoneCard({ milestone, index }: { milestone: Milestone; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex items-center gap-8 ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"}`}
    >
      <div className={`hidden lg:block lg:w-1/2 ${isEven ? "text-right pr-12" : "text-left pl-12"}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium mb-2 block">
            {milestone.year}
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-medium text-foreground mb-3 tracking-tight">
            {milestone.title}
          </h3>
          <p className="text-sm text-muted leading-relaxed mb-4">
            {milestone.description}
          </p>
          <div className={`flex flex-wrap gap-2 ${isEven ? "justify-end" : "justify-start"}`}>
            {milestone.highlights.map((h) => (
              <span key={h} className="px-3 py-1 rounded-full text-[11px] font-medium bg-gold/[0.08] text-gold-light border border-gold/10">
                {h}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 z-10">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15, type: "spring" }}
          className="w-4 h-4 rounded-full bg-gold border-4 border-background shadow-lg shadow-gold/20"
        />
      </div>

      <div className="lg:hidden pl-10 flex-1">
        <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium mb-2 block">
          {milestone.year}
        </span>
        <h3 className="text-lg font-serif font-medium text-foreground mb-2 tracking-tight">
          {milestone.title}
        </h3>
        <p className="text-sm text-muted leading-relaxed mb-3">
          {milestone.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {milestone.highlights.map((h) => (
            <span key={h} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-gold/[0.08] text-gold-light border border-gold/10">
              {h}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2" />
    </motion.div>
  );
}

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="timeline" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-background" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4 block">
            Our Journey
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6">
            <span className="text-foreground">Milestones of </span>
            <span className="text-gradient-gold italic">Innovation</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto font-light">
            From a bold vision to a full ecosystem — the key moments that shaped SZL Holdings.
          </p>
        </motion.div>

        <div ref={containerRef} className="relative" style={{ position: "relative" }}>
          <div className="absolute left-0 lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-px bg-white/[0.06]" />
          <motion.div
            className="absolute left-0 lg:left-1/2 lg:-translate-x-px top-0 w-px bg-gradient-to-b from-gold to-gold/30"
            style={{ height: lineHeight }}
          />

          <div className="space-y-12 lg:space-y-16">
            {milestones.map((milestone, i) => (
              <MilestoneCard key={milestone.year} milestone={milestone} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
