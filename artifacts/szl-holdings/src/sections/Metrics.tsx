import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Boxes, Globe, BarChart3, Cpu } from "lucide-react";

interface Metric {
  icon: typeof Boxes;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

const metrics: Metric[] = [
  {
    icon: Boxes,
    value: 15,
    suffix: "+",
    label: "Platforms Built",
    description: "Production-grade applications spanning security, analytics, maritime, and creative industries",
  },
  {
    icon: Globe,
    value: 5,
    suffix: "",
    label: "Industries Served",
    description: "Cybersecurity, maritime, artificial intelligence, creative technology, and strategic consulting",
  },
  {
    icon: BarChart3,
    value: 100,
    suffix: "%",
    label: "Founder-Built",
    description: "Every platform conceived, designed, and engineered by a single visionary founder",
  },
  {
    icon: Cpu,
    value: 3,
    suffix: "",
    label: "Core Engines",
    description: "Zeus backbone, AI inference pipeline, and real-time data processing infrastructure",
  },
];

function AnimatedCounter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * value);
      setCount(start);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [inView, value]);

  return (
    <span className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

export default function Metrics() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="metrics" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4 block">
            By the Numbers
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6">
            <span className="text-foreground">Impact at </span>
            <span className="text-gradient-gold italic">Scale</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative p-8 rounded-2xl border border-white/[0.06] bg-surface-elevated/50 hover:border-gold/20 transition-all duration-500 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
                <metric.icon className="w-6 h-6 text-gold" />
              </div>
              <div className="text-4xl sm:text-5xl font-serif font-medium text-foreground mb-2">
                <AnimatedCounter value={metric.value} suffix={metric.suffix} inView={inView} />
              </div>
              <h3 className="text-sm font-semibold text-gold-light mb-3 tracking-wide uppercase">
                {metric.label}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {metric.description}
              </p>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
