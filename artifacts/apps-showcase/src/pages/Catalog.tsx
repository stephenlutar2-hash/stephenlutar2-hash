import { motion } from "framer-motion";
import {
  Shield, Flame, Satellite, Leaf, Cloud, Zap, Sparkles, Eye,
  Crown, ExternalLink, type LucideIcon,
} from "lucide-react";

type Status = "Active" | "In Progress" | "Planned";
type Maturity = "Production" | "Beta" | "Alpha" | "Concept";
type Environment = "Production" | "Staging" | "Development";

interface Project {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  status: Status;
  maturity: Maturity;
  environment: Environment;
  domain: string;
  path: string;
}

const projects: Project[] = [
  {
    name: "ROSIE",
    description: "AI-powered security monitoring and incident response command center with the Alloy conversational agent.",
    icon: Shield,
    color: "from-cyan-500 to-violet-600",
    status: "Active",
    maturity: "Production",
    environment: "Production",
    domain: "szlholdings.com",
    path: "/",
  },
  {
    name: "Aegis",
    description: "Enterprise defensive security suite with threat assessment, vulnerability scanning, and compliance monitoring.",
    icon: Eye,
    color: "from-amber-500 to-yellow-600",
    status: "Active",
    maturity: "Production",
    environment: "Production",
    domain: "szlholdings.com",
    path: "/aegis/",
  },
  {
    name: "Beacon",
    description: "Centralized telemetry dashboard for tracking KPIs, project initiatives, and organizational metrics.",
    icon: Satellite,
    color: "from-cyan-400 to-blue-600",
    status: "Active",
    maturity: "Production",
    environment: "Production",
    domain: "szlholdings.com",
    path: "/beacon/",
  },
  {
    name: "Lutar",
    description: "Environmental impact tracking and sustainability project management with carbon emissions monitoring.",
    icon: Leaf,
    color: "from-emerald-500 to-green-600",
    status: "Active",
    maturity: "Production",
    environment: "Production",
    domain: "szlholdings.com",
    path: "/lutar/",
  },
  {
    name: "Nimbus",
    description: "AI-powered predictive analytics with confidence-scored forecasting and neural network anomaly detection.",
    icon: Cloud,
    color: "from-cyan-500 to-violet-600",
    status: "Active",
    maturity: "Production",
    environment: "Production",
    domain: "szlholdings.com",
    path: "/nimbus/",
  },
  {
    name: "Firestorm",
    description: "Controlled security simulation environment for testing defensive strategies and training security teams.",
    icon: Flame,
    color: "from-orange-500 to-red-600",
    status: "Active",
    maturity: "Beta",
    environment: "Staging",
    domain: "szlholdings.com",
    path: "/firestorm/",
  },
  {
    name: "DreamEra",
    description: "Neural storytelling engine with artifact mapping and creative synthesis capabilities.",
    icon: Sparkles,
    color: "from-violet-500 to-blue-600",
    status: "Active",
    maturity: "Beta",
    environment: "Production",
    domain: "szlholdings.com",
    path: "/dreamera/",
  },
  {
    name: "Zeus",
    description: "The backbone engine powering every SZL platform with modular design and horizontal scalability.",
    icon: Zap,
    color: "from-yellow-500 to-amber-600",
    status: "Active",
    maturity: "Production",
    environment: "Production",
    domain: "szlholdings.com",
    path: "/zeus/",
  },
];

const statusColors: Record<Status, string> = {
  Active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "In Progress": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Planned: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const maturityColors: Record<Maturity, string> = {
  Production: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Beta: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Alpha: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Concept: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const envColors: Record<Environment, string> = {
  Production: "bg-emerald-500/10 text-emerald-400",
  Staging: "bg-amber-500/10 text-amber-400",
  Development: "bg-blue-500/10 text-blue-400",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${className}`}>
      {label}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all duration-300 overflow-hidden"
    >
      <div className={`h-2 bg-gradient-to-r ${project.color}`} />
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center shrink-0`}>
            <project.icon className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-white text-lg">{project.name}</h3>
            <p className="text-xs text-gray-500">{project.domain}</p>
          </div>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          <Badge label={project.status} className={statusColors[project.status]} />
          <Badge label={project.maturity} className={maturityColors[project.maturity]} />
          <Badge label={project.environment} className={envColors[project.environment]} />
        </div>

        <a
          href={project.path}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-semibold text-white hover:bg-white/10 transition"
        >
          Open <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

export default function Catalog() {
  const grouped: Record<Status, Project[]> = { Active: [], "In Progress": [], Planned: [] };
  for (const p of projects) {
    grouped[p.status].push(p);
  }

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-cyan-600 focus:text-white focus:outline-none">
        Skip to content
      </a>

      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold tracking-wider text-lg">SZL HOLDINGS</span>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase -mt-0.5">Project Catalog</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <a href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/`} className="text-sm text-gray-400 hover:text-white transition">Showcase</a>
            <a href="/" className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition">
              Go to ROSIE
            </a>
          </div>
        </div>
      </nav>

      <main id="main-content" className="pt-28 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-4">Project Catalog</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A comprehensive view of every platform in the SZL Holdings portfolio, grouped by status with deployment and maturity details.
            </p>
          </div>

          {(Object.entries(grouped) as [Status, Project[]][]).map(([status, items]) =>
            items.length > 0 ? (
              <section key={status} className="mb-16">
                <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${status === "Active" ? "bg-emerald-400" : status === "In Progress" ? "bg-amber-400" : "bg-gray-400"}`} />
                  {status}
                  <span className="text-sm font-normal text-gray-500">({items.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((p) => (
                    <ProjectCard key={p.name} project={p} />
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-500">SZL Holdings — Project Catalog</span>
          </div>
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} SZL Holdings. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
