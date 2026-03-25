import { motion } from "framer-motion";

export default function Vision() {
  return (
    <section id="vision" className="relative py-32 lg:py-40">
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-background to-background" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium">
            Our Vision
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1] tracking-tight mb-8">
            <span className="text-foreground">Where bold ideas meet </span>
            <span className="text-gradient-gold italic">relentless execution</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted max-w-3xl mx-auto leading-relaxed font-light">
            We exist to transform industries through precision-engineered technology.
            From enterprise security to creative AI, every platform we build is
            designed to redefine what&apos;s possible — setting new standards of
            excellence and pushing the boundaries of innovation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {[
            {
              number: "01",
              title: "Engineer Excellence",
              description:
                "Every product is built with meticulous attention to craft, performance, and reliability — no shortcuts, no compromises.",
            },
            {
              number: "02",
              title: "Scale with Purpose",
              description:
                "We build platforms that grow from concept to enterprise scale, solving real problems for real organizations.",
            },
            {
              number: "03",
              title: "Lead Through Innovation",
              description:
                "We invest in emerging technology and bold ideas, staying ahead of the curve to deliver transformative outcomes.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: 0.2 + i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-center md:text-left"
            >
              <span className="text-sm font-mono text-gold/50 mb-3 block">
                {item.number}
              </span>
              <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
