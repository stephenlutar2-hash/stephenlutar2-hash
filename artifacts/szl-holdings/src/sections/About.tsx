import { motion } from "framer-motion";
import { Award, Target, TrendingUp, Users } from "lucide-react";

const credentials = [
  {
    icon: Award,
    label: "Founded",
    value: "Visionary-Led",
    detail: "Built on deep expertise in security, AI, and enterprise systems",
  },
  {
    icon: Target,
    label: "Portfolio",
    value: "15+ Products",
    detail: "Spanning security, analytics, maritime, and creative technology",
  },
  {
    icon: TrendingUp,
    label: "Focus",
    value: "Full-Stack",
    detail: "End-to-end platforms from concept through enterprise deployment",
  },
  {
    icon: Users,
    label: "Approach",
    value: "Precision-Driven",
    detail: "Every product engineered with meticulous attention to craft",
  },
];

export default function About() {
  return (
    <section id="about" className="relative py-32 lg:py-40">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium mb-6 block">
              About & Leadership
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-8 leading-[1.1]">
              <span className="text-foreground">Led by vision, </span>
              <span className="text-gradient-gold italic">driven by craft</span>
            </h2>
            <div className="space-y-5 text-muted leading-relaxed">
              <p>
                SZL Holdings is the creation of a founder who believes that
                exceptional technology is built at the intersection of deep
                technical expertise and bold strategic vision. Every venture in
                the portfolio reflects this philosophy — products that don&apos;t
                just solve problems, but redefine how industries operate.
              </p>
              <p>
                With a background spanning cybersecurity, artificial intelligence,
                data analytics, and enterprise architecture, the leadership behind
                SZL Holdings brings a rare breadth of capability to every project.
                From ROSIE&apos;s AI-powered security operations to Vessels&apos;
                maritime intelligence, each platform is a testament to the power of
                focused, founder-driven innovation.
              </p>
              <p>
                The SZL Holdings approach is uncompromising: identify
                high-impact opportunities, engineer world-class solutions, and
                scale them with precision. No shortcuts. No half-measures.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {credentials.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="p-6 rounded-2xl border border-white/[0.06] bg-surface-elevated/50"
                >
                  <item.icon className="w-5 h-5 text-gold mb-4" />
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-lg font-semibold text-foreground mb-2">
                    {item.value}
                  </p>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
