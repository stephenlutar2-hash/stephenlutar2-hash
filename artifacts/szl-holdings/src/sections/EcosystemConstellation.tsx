import { trackEvent } from "@szl-holdings/platform";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Eye, Satellite, Cloud, Zap, Flame, Sparkles, Ship,
  Lightbulb, Palette, BriefcaseBusiness, FileCheck, GraduationCap,
  Layers, MonitorCheck, ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAppUrl } from "@szl-holdings/domain-utils";

interface PlatformNode {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  status: "Live" | "Beta" | "In Development";
  category: string;
  href: string;
  x: number;
  y: number;
}

const platforms: PlatformNode[] = [
  { id: "rosie", name: "ROSIE", description: "AI-powered security monitoring and incident response", icon: Shield, color: "#06b6d4", status: "Live", category: "Security", href: "/", x: 0.25, y: 0.3 },
  { id: "aegis", name: "Aegis", description: "Enterprise defensive security and threat assessment", icon: Eye, color: "#f59e0b", status: "Live", category: "Security", href: "/aegis/", x: 0.15, y: 0.5 },
  { id: "firestorm", name: "Firestorm", description: "Controlled security simulation and red team operations", icon: Flame, color: "#ef4444", status: "Beta", category: "Security", href: "/firestorm/", x: 0.1, y: 0.7 },
  { id: "beacon", name: "Beacon", description: "Centralized telemetry and KPI dashboard", icon: Satellite, color: "#3b82f6", status: "Live", category: "Analytics", href: "/beacon/", x: 0.4, y: 0.15 },
  { id: "nimbus", name: "Nimbus", description: "Predictive analytics with confidence-scored forecasting", icon: Cloud, color: "#8b5cf6", status: "Live", category: "Analytics", href: "/nimbus/", x: 0.55, y: 0.25 },
  { id: "zeus", name: "Zeus", description: "The backbone engine powering every SZL platform", icon: Zap, color: "#eab308", status: "Live", category: "Infrastructure", href: "/zeus/", x: 0.5, y: 0.5 },
  { id: "inca", name: "INCA", description: "Intelligence platform for network and infrastructure analysis", icon: Layers, color: "#10b981", status: "Live", category: "Infrastructure", href: "/inca/", x: 0.65, y: 0.45 },
  { id: "vessels", name: "Vessels", description: "Maritime intelligence and vessel tracking", icon: Ship, color: "#6366f1", status: "Live", category: "Maritime", href: "/vessels/", x: 0.85, y: 0.35 },
  { id: "dreamera", name: "DreamEra", description: "Neural storytelling and creative synthesis", icon: Sparkles, color: "#ec4899", status: "Live", category: "Creative", href: "/dreamera/", x: 0.75, y: 0.6 },
  { id: "dreamscape", name: "Dreamscape", description: "Immersive visual storytelling environment", icon: Palette, color: "#d946ef", status: "Live", category: "Creative", href: "/dreamscape/", x: 0.85, y: 0.75 },
  { id: "lyte", name: "Lyte", description: "Intelligent observability command center", icon: Lightbulb, color: "#84cc16", status: "Live", category: "Analytics", href: "/lyte/", x: 0.7, y: 0.8 },
  { id: "alloyscape", name: "Alloyscape", description: "Unified integration platform for systems", icon: MonitorCheck, color: "#14b8a6", status: "Live", category: "Infrastructure", href: "/alloyscape/", x: 0.35, y: 0.7 },
  { id: "carlota", name: "Carlota Jo", description: "Strategic consulting for digital transformation", icon: BriefcaseBusiness, color: "#94a3b8", status: "Live", category: "Services", href: "/carlota-jo/", x: 0.2, y: 0.85 },
  { id: "readiness", name: "Readiness Report", description: "Organizational readiness assessment", icon: FileCheck, color: "#38bdf8", status: "Live", category: "Services", href: "/readiness-report/", x: 0.5, y: 0.85 },
  { id: "career", name: "Career", description: "Career development and talent management", icon: GraduationCap, color: "#818cf8", status: "Live", category: "Services", href: "/career/", x: 0.35, y: 0.4 },
];

const connections: [string, string][] = [
  ["zeus", "rosie"], ["zeus", "aegis"], ["zeus", "beacon"], ["zeus", "nimbus"],
  ["zeus", "vessels"], ["zeus", "dreamera"], ["zeus", "inca"], ["zeus", "alloyscape"],
  ["rosie", "aegis"], ["rosie", "firestorm"], ["aegis", "firestorm"],
  ["beacon", "nimbus"], ["nimbus", "lyte"],
  ["dreamera", "dreamscape"], ["dreamscape", "lyte"],
  ["alloyscape", "inca"], ["carlota", "readiness"],
  ["career", "zeus"],
];

const statusConfig = {
  Live: { dot: "bg-emerald-400", text: "text-emerald-400", label: "Live" },
  Beta: { dot: "bg-amber-400", text: "text-amber-400", label: "Beta" },
  "In Development": { dot: "bg-blue-400", text: "text-blue-400", label: "In Dev" },
};

const categories = ["All", "Security", "Analytics", "Infrastructure", "Maritime", "Creative", "Services"];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function MobileCard({ platform }: { platform: PlatformNode }) {
  const Icon = platform.icon;
  const { dot, text } = statusConfig[platform.status];

  return (
    <a
      href={getAppUrl(platform.href.replace(/\/$/, "") || "/", "/")}
      onClick={() => trackEvent("ecosystem", "click", platform.name)}
      className="group flex items-start gap-4 p-4 rounded-xl border border-white/[0.06] bg-surface-elevated/50 hover:border-gold/20 transition-all duration-300"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
        style={{ backgroundColor: `${platform.color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color: platform.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold text-foreground group-hover:text-gold-light transition-colors">{platform.name}</h4>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            <span className={`text-[10px] font-medium ${text}`}>{statusConfig[platform.status].label}</span>
          </div>
        </div>
        <p className="text-xs text-muted leading-relaxed">{platform.description}</p>
        <span className="text-[10px] uppercase tracking-wider text-gold/50 font-medium mt-1 block">{platform.category}</span>
      </div>
    </a>
  );
}

function DesktopConstellation({ filteredIds, hoveredNode, setActiveNode }: {
  filteredIds: Set<string>;
  hoveredNode: string | null;
  setActiveNode: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(height, 400) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const getPos = useCallback((node: PlatformNode) => ({
    x: node.x * dimensions.width,
    y: node.y * dimensions.height,
  }), [dimensions]);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface-elevated/30 overflow-hidden">
      <div ref={containerRef} className="relative w-full" style={{ height: "clamp(400px, 50vw, 600px)" }} role="img" aria-label="Interactive ecosystem visualization showing SZL Holdings platforms as connected nodes">
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }} aria-hidden="true">
          {connections.map(([from, to]) => {
            const fromNode = platforms.find(p => p.id === from);
            const toNode = platforms.find(p => p.id === to);
            if (!fromNode || !toNode) return null;
            const fromPos = getPos(fromNode);
            const toPos = getPos(toNode);
            const isVisible = filteredIds.has(from) && filteredIds.has(to);
            const isHighlighted = hoveredNode === from || hoveredNode === to;
            return (
              <line
                key={`${from}-${to}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={isHighlighted ? "rgba(201, 168, 76, 0.4)" : "rgba(201, 168, 76, 0.08)"}
                strokeWidth={isHighlighted ? 1.5 : 0.5}
                style={{
                  opacity: isVisible ? 1 : 0.1,
                  transition: "all 0.5s ease",
                }}
              />
            );
          })}
        </svg>

        {platforms.map((platform) => {
          const pos = getPos(platform);
          const isVisible = filteredIds.has(platform.id);
          const isActive = hoveredNode === platform.id;
          const Icon = platform.icon;
          return (
            <div
              key={platform.id}
              className="absolute"
              style={{
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -50%)",
                opacity: isVisible ? 1 : 0.15,
                transition: "all 0.5s ease",
                zIndex: isActive ? 20 : 10,
              }}
            >
              <a
                href={getAppUrl(platform.href.replace(/\/$/, "") || "/", "/")}
                onMouseEnter={() => setActiveNode(platform.id)}
                onMouseLeave={() => setActiveNode(null)}
                onFocus={() => setActiveNode(platform.id)}
                onBlur={() => setActiveNode(null)}
                className="relative cursor-pointer block outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-xl"
                aria-label={`${platform.name} — ${platform.description}. Status: ${platform.status}. Click to visit.`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: `${platform.color}15`,
                    borderColor: isActive ? `${platform.color}60` : undefined,
                    boxShadow: isActive ? `0 0 20px ${platform.color}30` : undefined,
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: platform.color }} />
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-muted" aria-hidden="true">
                  {platform.name}
                </span>
              </a>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-full mb-10 w-56 p-4 rounded-xl border border-white/10 bg-surface-elevated shadow-2xl z-30"
                    role="tooltip"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-foreground">{platform.name}</h4>
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[platform.status].dot}`} />
                        <span className={`text-[10px] font-medium ${statusConfig[platform.status].text}`}>
                          {statusConfig[platform.status].label}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted leading-relaxed mb-3">{platform.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-gold/60 font-medium">{platform.category}</span>
                      <a
                        href={getAppUrl(platform.href.replace(/\/$/, "") || "/", "/")}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-gold-light hover:text-gold transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-surface-elevated border-r border-b border-white/10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EcosystemConstellation() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const isMobile = useIsMobile();

  const filteredPlatforms = activeCategory === "All"
    ? platforms
    : platforms.filter(p => p.category === activeCategory);

  const filteredIds = new Set(filteredPlatforms.map(p => p.id));

  return (
    <section id="ecosystem" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/30 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4 block">
            Ecosystem
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6">
            <span className="text-foreground">Connected </span>
            <span className="text-gradient-gold italic">Platform Network</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto font-light">
            Explore how our platforms interconnect — each node represents a product in the SZL ecosystem, linked by shared infrastructure and data flows.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10" role="tablist" aria-label="Filter platforms by category">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-gold/20 text-gold-light border border-gold/30"
                  : "bg-surface-elevated/50 text-muted border border-white/[0.06] hover:border-gold/15 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {isMobile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="tabpanel">
              {filteredPlatforms.map((platform) => (
                <MobileCard key={platform.id} platform={platform} />
              ))}
            </div>
          ) : (
            <DesktopConstellation
              filteredIds={filteredIds}
              hoveredNode={activeNode}
              setActiveNode={setActiveNode}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
