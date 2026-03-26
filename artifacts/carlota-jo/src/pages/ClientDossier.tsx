import { motion } from "framer-motion";
import { Users, Building2, Calendar, TrendingUp, Mail, Phone, Globe, FileText, Activity, DollarSign } from "lucide-react";
import { Link } from "wouter";

const clients = [
  {
    id: 1, company: "Meridian Capital Partners", contact: "Victoria Ashworth-Reid", title: "Chief Investment Officer", email: "v.ashworth-reid@meridiancap.com", phone: "+1 (212) 555-0142", website: "meridiancap.com",
    industry: "Investment Management", size: "$8.2B AUM", since: "2024-06-15",
    engagements: [{ service: "Portfolio Optimization", value: "$450K", status: "Active", period: "2026 Q1-Q2" }, { service: "ESG Integration", value: "$180K", status: "Pipeline", period: "2026 Q3" }],
    interactions: 24, lastContact: "2026-03-24", sentiment: "strong",
    intelligence: "Victoria was promoted to CIO in 2025 after leading the firm's alternative investment expansion. Previously at BlackRock. Strong advocate for data-driven portfolio management. Key decision maker with direct board reporting. Prefers detailed analytical presentations over high-level strategy decks.",
    metrics: [{ label: "Total Revenue", value: "$632K" }, { label: "Engagement Score", value: "94/100" }, { label: "Interactions", value: "24" }, { label: "NPS Score", value: "9/10" }],
  },
  {
    id: 2, company: "Silverstone Group", contact: "Catherine Blackwell", title: "Managing Director", email: "c.blackwell@silverstonegroup.co.uk", phone: "+44 20 7555 0198", website: "silverstonegroup.co.uk",
    industry: "Financial Services", size: "$3.4B Revenue", since: "2025-11-02",
    engagements: [{ service: "M&A Advisory", value: "$820K", status: "Qualified", period: "2026 Q2-Q3" }],
    interactions: 8, lastContact: "2026-03-22", sentiment: "developing",
    intelligence: "Catherine leads the Corporate Development team. Previously at Lazard for 12 years. Highly analytical, values technical due diligence depth. Had a negative experience with a previous advisor on tech assessment — key differentiator for us. Reports to CEO Marcus Wellington who has final approval on advisory mandates.",
    metrics: [{ label: "Pipeline Value", value: "$820K" }, { label: "Engagement Score", value: "72/100" }, { label: "Interactions", value: "8" }, { label: "Win Probability", value: "40%" }],
  },
  {
    id: 3, company: "Atlas Family Office", contact: "James Harrington III", title: "Board Chair", email: "j.harrington@atlasfamilyoffice.com", phone: "+1 (617) 555-0267", website: "atlasfamilyoffice.com",
    industry: "Wealth Management", size: "$4.2B AUM", since: "2025-01-10",
    engagements: [{ service: "Risk & Compliance", value: "$350K", status: "Prospect", period: "2026 Q2" }, { service: "Governance Framework", value: "$280K", status: "Completed", period: "2025 Q1-Q3" }],
    interactions: 31, lastContact: "2026-03-21", sentiment: "strong",
    intelligence: "James represents the third generation of the Harrington family. Focused on governance modernization and generational transition. Previously engaged us for governance framework — 10/10 satisfaction. Strong internal champion. His daughter Alexandra (VP Operations) is increasingly involved in advisory selection decisions.",
    metrics: [{ label: "Total Revenue", value: "$280K" }, { label: "Engagement Score", value: "98/100" }, { label: "Interactions", value: "31" }, { label: "NPS Score", value: "10/10" }],
  },
];

const sentimentColor = (s: string) => s === "strong" ? "text-emerald-400" : s === "developing" ? "text-amber-400" : "text-muted-foreground";

export default function ClientDossier() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground font-serif">CJ</span>
            </div>
            <span className="font-serif text-lg font-semibold">Client Dossiers</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/pipeline" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pipeline</Link>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-16 max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Client Intelligence Dossiers</h1>
          <p className="text-muted-foreground">Auto-generated intelligence briefs from inquiry data, interaction history, and engagement patterns</p>
        </div>

        <div className="space-y-6">
          {clients.map((client, idx) => (
            <motion.div key={client.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="rounded-xl border border-border overflow-hidden">
              <div className="p-6 bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-amber-800/20 flex items-center justify-center ring-2 ring-primary/10">
                      <span className="text-lg font-bold text-primary">{client.contact.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold">{client.company}</h3>
                      <p className="text-sm text-foreground/80">{client.contact} — {client.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{client.industry}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{client.size}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Since {new Date(client.since).toLocaleDateString("en-US", { year: "numeric", month: "short" })}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${sentimentColor(client.sentiment)} bg-current/10`} style={{ backgroundColor: client.sentiment === "strong" ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)" }}>
                    {client.sentiment}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {client.metrics.map(m => (
                    <div key={m.label} className="p-3 rounded-lg bg-background border border-border text-center">
                      <p className="text-lg font-bold text-foreground">{m.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{m.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-primary" /> Intelligence Brief
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed bg-primary/5 border border-primary/10 rounded-lg p-4">{client.intelligence}</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" /> Engagements
                  </h4>
                  <div className="space-y-2">
                    {client.engagements.map((eng, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                        <div>
                          <span className="text-sm font-medium">{eng.service}</span>
                          <span className="text-xs text-muted-foreground ml-2">{eng.period}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-primary font-bold">{eng.value}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${eng.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : eng.status === "Completed" ? "bg-blue-500/10 text-blue-400" : eng.status === "Pipeline" ? "bg-amber-500/10 text-amber-400" : "bg-gray-500/10 text-gray-400"}`}>{eng.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{client.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</span>
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{client.website}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
