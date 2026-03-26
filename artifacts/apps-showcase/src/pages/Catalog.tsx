import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield, Flame, Satellite, Leaf, Cloud, Zap, Sparkles, Eye,
  Crown, ExternalLink, type LucideIcon, Search, BarChart3,
  Briefcase, Ship, Coffee, Activity, Layers, Globe, Monitor,
} from "lucide-react";
import { getAppUrl } from "@szl-holdings/domain-utils";

type Status = "Active" | "In Progress" | "Planned";
type Maturity = "Production" | "Beta" | "Alpha" | "Concept";
type Environment = "Production" | "Staging" | "Development";
type Category = "Security" | "Analytics" | "Operations" | "AI/ML" | "Platform" | "Business";

interface Project {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  status: Status;
  maturity: Maturity;
  environment: Environment;
  category: Category;
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
    category: "Security",
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
    category: "Security",
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
    category: "Analytics",
    domain: "szlholdings.com",
    path: "/beacon/",
  },
  {
    name: "Lutar",
    description: "Personal command center for SZL Holdings. Track projects, assets, financial KPIs, and strategic initiatives across every division.",
    icon: Leaf,
    color: "from-emerald-500 to-green-600",
    status: "Active",
    maturity: "Production",
    environment: "Production",
    category: "Operations",
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
    category: "AI/ML",
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
    category: "Security",
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
    category: "AI/ML",
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
    category: "Platform",
    domain: "szlholdings.com",
    path: "/zeus/",
  },
  {
    name: "AlloyScape",
    description: "Infrastructure operations platform for monitoring, managing, and optimizing cloud and on-premise environments.",
    icon: Layers,
    color: "from-slate-400 to-zinc-600",
    status: "Active",
    maturity: "Production",
    environment: "Production",
    category: "Operations",
    domain: "szlholdings.com",
    path: "/alloyscape/",
  },
  {
    name: "Dreamscape",
    description: "Creative systems platform for ideation workflows, content pipelines, and design-driven project management.",
    icon: Globe,
    color: "from-indigo-500 to-purple-600",
    status: "Active",
    maturity: "Beta",
    environment: "Production",
    category: "AI/ML",
    domain: "szlholdings.com",
    path: "/dreamscape/",
  },
  {
    name: "Readiness Report",
    description: "Comprehensive project readiness assessments with scoring, risk matrices, and go/no-go decision support.",
    icon: BarChart3,
    color: "from-teal-500 to-cyan-600",
    status: "Active",
    maturity: "Production",
    environment: "Production",
    category: "Analytics",
    domain: "szlholdings.com",
    path: "/readiness-report/",
  },
  {
    name: "Career",
    description: "Professional portfolio and career showcase for SZL Holdings leadership, achievements, and technology vision.",
    icon: Briefcase,
    color: "from-blue-500 to-indigo-600",
    status: "Active",
    maturity: "Production",
    environment: "Production",
    category: "Business",
    domain: "szlholdings.com",
    path: "/career/",
  },
  {
    name: "Vessels",
    description: "Maritime intelligence platform for fleet tracking, voyage analytics, and operational monitoring of LPG carriers.",
    icon: Ship,
    color: "from-blue-600 to-cyan-500",
    status: "Active",
    maturity: "Beta",
    environment: "Production",
    category: "Operations",
    domain: "szlholdings.com",
    path: "/vessels/",
  },
  {
    name: "Carlota Jo",
    description: "Strategic advisory and portfolio management consulting platform with client engagement and project tracking.",
    icon: Coffee,
    color: "from-rose-500 to-pink-600",
    status: "Active",
    maturity: "Production",
    environment: "Production",
    category: "Business",
    domain: "szlholdings.com",
    path: "/carlota-jo/",
  },
  {
    name: "Lyte",
    description: "Executive observability command center — unified signals, AI-driven recommendations, and portfolio health across all SZL platforms.",
    icon: Activity,
    color: "from-emerald-400 to-teal-600",
    status: "Active",
    maturity: "Beta",
    environment: "Production",
    category: "Analytics",
    domain: "szlholdings.com",
    path: "/lyte/",
  },
  {
    name: "Apps Showcase",
    description: "Centralized catalog of all SZL Holdings platforms with status tracking, maturity labels, and quick navigation.",
    icon: Monitor,
    color: "from-gray-400 to-slate-600",
    status: "Active",
    maturity: "Production",
    environment: "Production",
    category: "Platform",
    domain: "szlholdings.com",
    path: "/apps-showcase/",
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

const categoryColors: Record<Category, string> = {
  Security: "text-red-400",
  Analytics: "text-cyan-400",
  Operations: "text-emerald-400",
  "AI/ML": "text-violet-400",
  Platform: "text-amber-400",
  Business: "text-pink-400",
};

const allCategories: Category[] = ["Security", "Analytics", "Operations", "AI/ML", "Platform", "Business"];

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
          <span className={`text-[10px] font-bold uppercase ${categoryColors[project.category]}`}>{project.category}</span>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          <Badge label={project.status} className={statusColors[project.status]} />
          <Badge label={project.maturity} className={maturityColors[project.maturity]} />
          <Badge label={project.environment} className={envColors[project.environment]} />
        </div>

        <a
          href={getAppUrl(project.path.replace(/\/$/, "") || "/", "/")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-semibold text-white hover:bg-white/10 transition"
        >
          Open <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");
  const [maturityFilter, setMaturityFilter] = useState<Maturity | "All">("All");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
      if (maturityFilter !== "All" && p.maturity !== maturityFilter) return false;
      return true;
    });
  }, [search, categoryFilter, maturityFilter]);

  const grouped: Record<Status, Project[]> = { Active: [], "In Progress": [], Planned: [] };
  for (const p of filtered) {
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Crown className="w-3.5 h-3.5" /> {projects.length} Platforms
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-4">Project Catalog</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A comprehensive view of every platform in the SZL Holdings portfolio, grouped by status with deployment and maturity details.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10 max-w-3xl mx-auto">
            {allCategories.map(cat => {
              const count = projects.filter(p => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? "All" : cat)}
                  aria-pressed={categoryFilter === cat}
                  aria-label={`Filter by ${cat} (${count} apps)`}
                  className={`p-3 rounded-xl text-center transition-all duration-200 border ${categoryFilter === cat ? "bg-white/10 border-white/20" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"}`}
                >
                  <p className={`text-lg font-display font-bold ${categoryColors[cat]}`}>{count}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">{cat}</p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search apps..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as Category | "All")}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={maturityFilter}
              onChange={(e) => setMaturityFilter(e.target.value as Maturity | "All")}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition appearance-none cursor-pointer"
            >
              <option value="All">All Maturity</option>
              <option value="Production">Production</option>
              <option value="Beta">Beta</option>
              <option value="Alpha">Alpha</option>
              <option value="Concept">Concept</option>
            </select>
          </div>

          <p className="text-sm text-gray-500 mb-8 text-center">{filtered.length} of {projects.length} apps</p>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No apps match your filters.</p>
              <button onClick={() => { setSearch(""); setCategoryFilter("All"); setMaturityFilter("All"); }} className="mt-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition">
                Clear Filters
              </button>
            </div>
          ) : (
            (Object.entries(grouped) as [Status, Project[]][]).map(([status, items]) =>
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
            )
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
