import { motion } from "framer-motion";
import { Brain, ShieldCheck, Ship, Palette, Handshake } from "lucide-react";

const areas = [
  {
    icon: Brain,
    title: "Artificial Intelligence & Machine Learning",
    description:
      "From predictive analytics in Nimbus to neural storytelling in DreamEra, AI is the core engine across our portfolio — powering intelligent automation, natural language interfaces, and data-driven decision-making.",
    products: ["Nimbus", "DreamEra", "ROSIE", "Alloyscape"],
  },
  {
    icon: ShieldCheck,
    title: "Cybersecurity & Defense",
    description:
      "Enterprise-grade security platforms that protect organizations from evolving threats. Our security suite spans monitoring, simulation, compliance, and incident response.",
    products: ["ROSIE", "Aegis", "Firestorm"],
  },
  {
    icon: Ship,
    title: "Maritime Intelligence",
    description:
      "Advanced vessel tracking, fleet analytics, and maritime domain awareness. Vessels delivers real-time intelligence for one of the world's most critical industries.",
    products: ["Vessels"],
  },
  {
    icon: Palette,
    title: "Creative Technology",
    description:
      "Platforms that bridge technology and creativity — immersive storytelling engines, visual design environments, and tools that empower creators to push boundaries.",
    products: ["DreamEra", "Dreamscape", "Lyte"],
  },
  {
    icon: Handshake,
    title: "Strategic Consulting",
    description:
      "Expert guidance for organizations navigating digital transformation, technology adoption, and operational readiness through Carlota Jo Consulting.",
    products: ["Carlota Jo Consulting", "Readiness Report"],
  },
];

export default function Innovation() {
  return (
    <section id="innovation" className="relative py-32 lg:py-40">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/30 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4 block">
            Strategic Focus
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6">
            <span className="text-foreground">Innovation </span>
            <span className="text-gradient-gold italic">Areas</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto font-light">
            Five strategic pillars driving our portfolio forward — each
            representing a domain where SZL Holdings is building category-defining
            technology.
          </p>
        </motion.div>

        <div className="space-y-6">
          {areas.map((area, i) => (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="rounded-2xl border border-white/[0.06] bg-surface-elevated/50 hover:border-gold/15 transition-all duration-500 overflow-hidden"
            >
              <div className="p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-10">
                  <div className="flex items-center gap-4 lg:min-w-[280px]">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                      <area.icon className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">
                      {area.title}
                    </h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted leading-relaxed mb-4">
                      {area.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {area.products.map((p) => (
                        <span
                          key={p}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-gold/[0.08] text-gold-light border border-gold/10"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
