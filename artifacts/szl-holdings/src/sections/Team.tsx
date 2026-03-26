import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const team = [
  {
    name: "Stephen Lutar",
    role: "Founder & CEO",
    initials: "SL",
    bio: "Visionary technologist with 10+ years building enterprise platforms across security, AI, and infrastructure. Architected the entire SZL Holdings ecosystem from a single-founder vision into a portfolio of 15+ production-grade platforms.",
    expertise: ["Enterprise Architecture", "AI/ML Systems", "Cybersecurity", "Strategic Leadership"],
    gradient: "from-gold to-gold-dark",
  },
  {
    name: "Alloy AI",
    role: "Chief Intelligence Officer",
    initials: "AI",
    bio: "SZL Holdings' proprietary AI engine powering threat detection, predictive analytics, and intelligent automation across the entire platform ecosystem. Built on custom neural architectures optimized for enterprise workloads.",
    expertise: ["Threat Intelligence", "Predictive Analytics", "Natural Language Processing", "Anomaly Detection"],
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    name: "Zeus Engine",
    role: "Core Infrastructure",
    initials: "ZE",
    bio: "The backbone architecture powering every SZL platform. Zeus provides modular, auto-scaling infrastructure with built-in health monitoring, service mesh orchestration, and zero-downtime deployments.",
    expertise: ["Auto-Scaling", "Service Mesh", "Health Monitoring", "Module Management"],
    gradient: "from-amber-500 to-yellow-600",
  },
  {
    name: "Nuro Engine",
    role: "AI Processing Pipeline",
    initials: "NE",
    bio: "Advanced AI inference pipeline handling real-time data processing, model serving, and intelligent routing across the SZL ecosystem. Processes millions of events daily with sub-second latency.",
    expertise: ["Real-time Processing", "Model Serving", "Event Streaming", "Edge Computing"],
    gradient: "from-violet-500 to-purple-600",
  },
];

export default function Team() {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);

  return (
    <section className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/20 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4 block">
            Leadership
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6">
            <span className="text-foreground">The Minds </span>
            <span className="text-gradient-gold italic">Behind the Vision</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto font-light">
            A founder-driven organization powered by cutting-edge AI engines and architectural systems.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative"
              onMouseEnter={() => setHoveredMember(i)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              <div className="relative rounded-2xl border border-white/[0.06] bg-surface-elevated/50 overflow-hidden hover:border-gold/20 transition-all duration-500">
                <div className={`h-40 bg-gradient-to-br ${member.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-serif font-bold text-white/90">{member.initials}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-elevated/80 to-transparent" />
                </div>

                <div className="p-6 -mt-4 relative">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-xs text-gold uppercase tracking-wider mb-4">{member.role}</p>

                  <AnimatePresence>
                    {hoveredMember === i ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-muted leading-relaxed mb-4">{member.bio}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {member.expertise.map((skill) => (
                            <span key={skill} className="px-2 py-0.5 text-[10px] font-medium bg-gold/10 text-gold-light rounded-full border border-gold/15">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-muted line-clamp-2"
                      >
                        {member.bio}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
