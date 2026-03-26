import { motion } from "framer-motion";
import { Download, Palette, Building2, User, BarChart3, FileText, ArrowLeft } from "lucide-react";

const brandColors = [
  { name: "Gold Primary", hex: "#c9a84c", usage: "Brand accent, CTAs, highlights" },
  { name: "Gold Light", hex: "#d4b85c", usage: "Hover states, secondary accent" },
  { name: "Dark Background", hex: "#06060b", usage: "Primary background" },
  { name: "Surface", hex: "#0a0a0f", usage: "Card backgrounds, elevated surfaces" },
  { name: "Foreground", hex: "#e8e4dd", usage: "Primary text" },
  { name: "Muted", hex: "#9ca3af", usage: "Secondary text, captions" },
];

const metrics = [
  { label: "Platforms Built", value: "15+" },
  { label: "Industries Served", value: "5" },
  { label: "Architecture", value: "Monorepo" },
  { label: "Tech Stack", value: "React + Node.js" },
  { label: "Single Founder", value: "Yes" },
  { label: "Open for Partnership", value: "Yes" },
];

export default function PressKit() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <a
          href={import.meta.env.BASE_URL}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to SZL Holdings
        </a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight mb-4">
            <span className="text-foreground">Press </span>
            <span className="text-gradient-gold italic">Kit</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mb-16">
            Official brand assets, company information, and media resources for SZL Holdings.
            For press inquiries, contact <a href="mailto:press@szlholdings.com" className="text-gold hover:underline">press@szlholdings.com</a>.
          </p>
        </motion.div>

        <div className="space-y-16">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-semibold">About SZL Holdings</h2>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-surface-elevated/50 p-8">
              <p className="text-muted leading-relaxed mb-4">
                SZL Holdings is a premium innovation and venture platform engineered by a single visionary founder.
                The company builds transformative technology across five core industries: cybersecurity, artificial intelligence,
                maritime intelligence, creative technology, and enterprise infrastructure.
              </p>
              <p className="text-muted leading-relaxed mb-4">
                With 15+ fully operational platforms — including ROSIE (AI security monitoring), Aegis (enterprise defense),
                Vessels (maritime intelligence), Beacon (business analytics), and Nimbus (predictive AI) — SZL Holdings
                demonstrates that a focused, architecture-first approach can rival the output of large engineering teams.
              </p>
              <p className="text-muted leading-relaxed">
                Every platform in the SZL ecosystem is built on a unified TypeScript monorepo architecture,
                sharing authentication, design systems, and infrastructure. This approach enables rapid innovation
                while maintaining enterprise-grade quality across the entire portfolio.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-semibold">Founder</h2>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-surface-elevated/50 p-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-background">SL</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Stephen Lutar</h3>
                  <p className="text-sm text-gold mb-3">Founder & CEO</p>
                  <p className="text-muted leading-relaxed">
                    Stephen Lutar is a technology strategist and hands-on architect with deep expertise in
                    full-stack development, cybersecurity, and AI systems. As the sole founder and engineer
                    behind SZL Holdings, he has designed and built 15+ enterprise-grade platforms spanning
                    security operations, predictive analytics, maritime intelligence, and creative technology.
                    His architecture-first philosophy prioritizes scalable, production-ready systems that
                    deliver real operational value.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-semibold">Key Metrics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-white/[0.06] bg-surface-elevated/50 p-5 text-center"
                >
                  <div className="text-2xl font-bold text-gold mb-1">{metric.value}</div>
                  <div className="text-xs text-muted uppercase tracking-wider">{metric.label}</div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-semibold">Brand Colors</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {brandColors.map((color) => (
                <div
                  key={color.hex}
                  className="rounded-xl border border-white/[0.06] bg-surface-elevated/50 p-4"
                >
                  <div
                    className="w-full h-16 rounded-lg mb-3 border border-white/[0.06]"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-sm font-medium text-foreground">{color.name}</div>
                  <div className="text-xs text-muted font-mono">{color.hex}</div>
                  <div className="text-xs text-muted mt-1">{color.usage}</div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Download className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-semibold">Brand Assets</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "SZL Holdings Logo (SVG)", desc: "Vector logo — scalable for print and web", href: `${import.meta.env.BASE_URL}favicon.svg` },
                { name: "SZL Holdings Social Card", desc: "1200x630 JPG — Open Graph preview", href: `${import.meta.env.BASE_URL}opengraph.jpg` },
                { name: "ROSIE Logo (SVG)", desc: "AI security monitoring brand mark", href: "/favicon.svg" },
                { name: "Aegis Logo (SVG)", desc: "Enterprise security brand mark", href: "/aegis/favicon.svg" },
                { name: "Beacon Logo (SVG)", desc: "Analytics dashboard brand mark", href: "/beacon/favicon.svg" },
                { name: "Nimbus Logo (SVG)", desc: "Predictive AI brand mark", href: "/nimbus/favicon.svg" },
                { name: "Vessels Logo (SVG)", desc: "Maritime intelligence brand mark", href: "/vessels/favicon.svg" },
                { name: "Firestorm Logo (SVG)", desc: "Security simulation brand mark", href: "/firestorm/favicon.svg" },
              ].map((asset) => (
                <a
                  key={asset.name}
                  href={asset.href}
                  download
                  className="rounded-xl border border-white/[0.06] bg-surface-elevated/50 p-6 hover:border-gold/20 transition-colors group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground group-hover:text-gold transition-colors">
                      {asset.name}
                    </div>
                    <div className="text-xs text-muted">{asset.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="rounded-2xl border border-gold/10 bg-gold/[0.03] p-8 text-center">
              <h3 className="text-lg font-semibold text-gold-light mb-2">Boilerplate</h3>
              <p className="text-sm text-muted leading-relaxed max-w-2xl mx-auto italic">
                "SZL Holdings is a premium innovation and venture platform building transformative technology
                across security, AI analytics, maritime intelligence, and creative industries. Founded by
                Stephen Lutar, the company operates 15+ enterprise-grade platforms from a unified architecture,
                demonstrating that visionary engineering can rival the output of large teams."
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
