import { motion } from "framer-motion";
import { ArrowRight, Clock, BookOpen } from "lucide-react";

const articles = [
  {
    category: "AI & Security",
    title: "Why Zero-Trust Architecture Is the Foundation of Modern Enterprise Security",
    excerpt: "Traditional perimeter-based security models are fundamentally broken. Here's how zero-trust principles are reshaping how we protect digital assets at scale.",
    readTime: "8 min read",
    date: "Mar 2026",
    featured: true,
  },
  {
    category: "Maritime Intelligence",
    title: "The Future of Fleet Intelligence: From GPS Tracking to Predictive Operations",
    excerpt: "How real-time data fusion from 12+ sources is transforming maritime logistics from reactive monitoring to proactive decision-making.",
    readTime: "6 min read",
    date: "Feb 2026",
    featured: false,
  },
  {
    category: "Platform Engineering",
    title: "Building 15 Platforms in a Unified Monorepo: Lessons from the SZL Ecosystem",
    excerpt: "A deep dive into the architectural decisions, shared infrastructure patterns, and developer experience innovations that power our multi-platform portfolio.",
    readTime: "12 min read",
    date: "Jan 2026",
    featured: false,
  },
  {
    category: "Predictive Analytics",
    title: "From Observability to Intelligence: The Next Evolution of Enterprise Monitoring",
    excerpt: "Why the industry is shifting from dashboards that show what happened to systems that predict what will happen next — and how to get there.",
    readTime: "7 min read",
    date: "Dec 2025",
    featured: false,
  },
];

export default function ThoughtLeadership() {
  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <section id="insights" className="relative py-24 lg:py-32">
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
            Insights
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6">
            <span className="text-foreground">Thought </span>
            <span className="text-gradient-gold italic">Leadership</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto font-light">
            Perspectives on technology, security, and building the next generation of enterprise platforms.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featured && (
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-2xl border border-white/[0.06] bg-surface-elevated/50 overflow-hidden cursor-pointer hover:border-gold/20 transition-all duration-500"
            >
              <div className="h-48 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(201,168,76,0.15),transparent_70%)]" />
                <div className="absolute bottom-4 left-6">
                  <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider bg-gold/20 text-gold-light rounded-full border border-gold/20">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[11px] font-medium text-gold uppercase tracking-wider">{featured.category}</span>
                  <span className="text-muted/30">·</span>
                  <span className="text-[11px] text-muted">{featured.date}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-medium text-foreground mb-4 leading-snug group-hover:text-gold-light transition-colors">
                  {featured.title}
                </h3>
                <p className="text-muted leading-relaxed mb-6">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{featured.readTime}</span>
                  </div>
                  <span className="text-sm text-gold-light flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.article>
          )}

          <div className="flex flex-col gap-6">
            {rest.map((article, i) => (
              <motion.article
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group p-6 rounded-2xl border border-white/[0.06] bg-surface-elevated/50 cursor-pointer hover:border-gold/20 transition-all duration-500"
              >
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-4 h-4 text-gold/60" />
                  <span className="text-[11px] font-medium text-gold uppercase tracking-wider">{article.category}</span>
                  <span className="text-muted/30">·</span>
                  <span className="text-[11px] text-muted">{article.date}</span>
                </div>
                <h3 className="text-lg font-serif font-medium text-foreground mb-2 leading-snug group-hover:text-gold-light transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{article.readTime}</span>
                  </div>
                  <span className="text-xs text-gold-light flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
