import { motion } from "framer-motion";
import {
  Shield, Eye, Satellite, Cloud, Zap, Flame, Sparkles, Ship,
  Lightbulb, Palette, BriefcaseBusiness, FileCheck, GraduationCap,
  Layers, MonitorCheck, ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAppUrl } from "@szl-holdings/domain-utils";

type Status = "Live" | "Beta" | "In Development";

interface Product {
  name: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  status: Status;
  href: string;
  techStack: string[];
  category: string;
}

const products: Product[] = [
  {
    name: "ROSIE",
    description: "AI-powered security monitoring and incident response command center.",
    icon: Shield,
    gradient: "from-cyan-500 to-blue-600",
    status: "Live",
    href: "/",
    techStack: ["AI/ML", "React", "Real-time"],
    category: "Security",
  },
  {
    name: "Aegis",
    description: "Enterprise defensive security with threat assessment and compliance.",
    icon: Eye,
    gradient: "from-amber-500 to-yellow-600",
    status: "Live",
    href: "/aegis/",
    techStack: ["Security", "Analytics", "Compliance"],
    category: "Security",
  },
  {
    name: "Beacon",
    description: "Centralized telemetry dashboard for KPIs and organizational metrics.",
    icon: Satellite,
    gradient: "from-cyan-400 to-blue-500",
    status: "Live",
    href: "/beacon/",
    techStack: ["Dashboards", "Real-time", "D3"],
    category: "Analytics",
  },
  {
    name: "Nimbus",
    description: "Predictive analytics with confidence-scored forecasting and anomaly detection.",
    icon: Cloud,
    gradient: "from-violet-500 to-purple-600",
    status: "Live",
    href: "/nimbus/",
    techStack: ["ML", "Forecasting", "Statistics"],
    category: "Analytics",
  },
  {
    name: "Zeus",
    description: "The backbone engine powering every SZL platform with modular scalability.",
    icon: Zap,
    gradient: "from-yellow-500 to-amber-600",
    status: "Live",
    href: "/zeus/",
    techStack: ["Core Engine", "APIs", "Microservices"],
    category: "Infrastructure",
  },
  {
    name: "INCA",
    description: "Intelligent network configuration and automation for infrastructure management.",
    icon: Layers,
    gradient: "from-emerald-500 to-teal-600",
    status: "In Development",
    href: "/apps-showcase/",
    techStack: ["NetOps", "Automation", "Config"],
    category: "Infrastructure",
  },
  {
    name: "DreamEra",
    description: "Neural storytelling engine with artifact mapping and creative synthesis.",
    icon: Sparkles,
    gradient: "from-pink-500 to-violet-600",
    status: "Live",
    href: "/dreamera/",
    techStack: ["NLP", "Generative AI", "Narrative"],
    category: "Creative",
  },
  {
    name: "Firestorm",
    description: "Controlled security simulation for testing defensive strategies.",
    icon: Flame,
    gradient: "from-orange-500 to-red-600",
    status: "Beta",
    href: "/firestorm/",
    techStack: ["Red Team", "Simulation", "Testing"],
    category: "Security",
  },
  {
    name: "Vessels",
    description: "Maritime intelligence platform for vessel tracking and fleet analytics.",
    icon: Ship,
    gradient: "from-blue-500 to-indigo-600",
    status: "Live",
    href: "/vessels/",
    techStack: ["AIS", "Geospatial", "Real-time"],
    category: "Maritime",
  },
  {
    name: "Lyte",
    description: "Lightweight analytics and performance monitoring for modern applications.",
    icon: Lightbulb,
    gradient: "from-lime-400 to-green-600",
    status: "In Development",
    href: "/apps-showcase/",
    techStack: ["APM", "Metrics", "Lightweight"],
    category: "Analytics",
  },
  {
    name: "Dreamscape",
    description: "Immersive creative environment for visual storytelling and design exploration.",
    icon: Palette,
    gradient: "from-fuchsia-500 to-pink-600",
    status: "Live",
    href: "/dreamscape/",
    techStack: ["WebGL", "3D", "Creative"],
    category: "Creative",
  },
  {
    name: "Carlota Jo Consulting",
    description: "Strategic consulting for digital transformation and technology adoption.",
    icon: BriefcaseBusiness,
    gradient: "from-slate-400 to-gray-600",
    status: "Live",
    href: "/carlota-jo/",
    techStack: ["Strategy", "Transformation", "Advisory"],
    category: "Services",
  },
  {
    name: "Alloyscape",
    description: "Unified integration platform connecting disparate systems and workflows.",
    icon: MonitorCheck,
    gradient: "from-teal-400 to-cyan-600",
    status: "Live",
    href: "/alloyscape/",
    techStack: ["Integration", "APIs", "ETL"],
    category: "Infrastructure",
  },
  {
    name: "Readiness Report",
    description: "Organizational readiness assessment and strategic planning tool.",
    icon: FileCheck,
    gradient: "from-sky-400 to-blue-600",
    status: "Live",
    href: "/readiness-report/",
    techStack: ["Assessment", "Scoring", "Reports"],
    category: "Services",
  },
  {
    name: "Career",
    description: "Career development and talent management platform.",
    icon: GraduationCap,
    gradient: "from-indigo-400 to-violet-600",
    status: "Live",
    href: "/career/",
    techStack: ["Portfolio", "Profiles", "Analytics"],
    category: "Services",
  },
];

const statusConfig: Record<Status, { dot: string; text: string; bg: string }> = {
  Live: { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-400/10" },
  Beta: { dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-400/10" },
  "In Development": { dot: "bg-blue-400", text: "text-blue-400", bg: "bg-blue-400/10" },
};

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { dot, text, bg } = statusConfig[product.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.5,
        delay: (index % 5) * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <a
        href={getAppUrl(product.href.replace(/\/$/, "") || "/", "/")}
        className="group block h-full rounded-2xl border border-white/[0.06] bg-surface-elevated/50 hover:border-gold/20 hover:bg-surface-elevated transition-all duration-500 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gold/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-5">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
            >
              <product.icon className="w-5 h-5 text-white" />
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bg}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              <span className={`text-[10px] font-semibold tracking-wide ${text}`}>
                {product.status}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-foreground group-hover:text-gold-light transition-colors duration-300">
              {product.name}
            </h3>
            <ExternalLink className="w-3.5 h-3.5 text-muted/40 group-hover:text-gold/60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          <p className="text-sm text-muted leading-relaxed mb-4">
            {product.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {product.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] text-muted/80 border border-white/[0.04]"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted/50 font-medium">
              {product.category}
            </span>
            <span className="text-xs text-gold/50 group-hover:text-gold transition-colors duration-300 font-medium">
              Explore →
            </span>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

export default function Portfolio() {
  return (
    <section id="portfolio" className="relative py-28 lg:py-36">
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
            Our Portfolio
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6">
            <span className="text-foreground">Products & </span>
            <span className="text-gradient-gold italic">Ventures</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto font-light">
            A curated ecosystem of platforms engineered to transform industries — from
            enterprise security to creative AI and maritime intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product, i) => (
            <ProductCard key={product.name} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
