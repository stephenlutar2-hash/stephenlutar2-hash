import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, Clock, TrendingUp, Brain, Activity, Zap } from "lucide-react";
import { RadarChart, Radar as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Link } from "wouter";

const readinessScores = [
  { subject: "Security", A: 92, fullMark: 100 },
  { subject: "Infrastructure", A: 87, fullMark: 100 },
  { subject: "Compliance", A: 78, fullMark: 100 },
  { subject: "Incident Response", A: 85, fullMark: 100 },
  { subject: "Documentation", A: 71, fullMark: 100 },
  { subject: "Testing", A: 89, fullMark: 100 },
  { subject: "Monitoring", A: 94, fullMark: 100 },
  { subject: "Recovery", A: 76, fullMark: 100 },
];

const predictions = [
  { id: 1, area: "Compliance Gap — SOC 2 Type II Audit", risk: "high", probability: "78%", timeframe: "45 days", prediction: "Based on current documentation velocity and open remediation items, SOC 2 Type II audit preparation will not be complete by the June 15 deadline. 3 control gaps remain unaddressed: change management documentation, access review cadence, and incident response testing evidence.", recommended: ["Accelerate change management documentation — assign dedicated owner", "Complete quarterly access review by April 15", "Schedule incident response tabletop exercise for April 20"] },
  { id: 2, area: "Infrastructure Capacity — Database Tier", risk: "medium", probability: "64%", timeframe: "30 days", prediction: "Database connection pool projected to reach 85% utilization within 25 days based on current growth trajectory. Vessels Q1 reporting season driving query volume increase. Historical pattern shows performance degradation begins at 82% capacity.", recommended: ["Pre-scale database read replicas before Q1 peak", "Optimize top-10 slow queries in Vessels dashboard", "Enable connection pooling with PgBouncer"] },
  { id: 3, area: "Security Posture — Dependency Vulnerabilities", risk: "medium", probability: "72%", timeframe: "14 days", prediction: "3 high-severity CVEs projected for Node.js dependencies based on upstream security advisory patterns. Current average patch time is 8 days — within SLA but trending slower. Automated dependency scanning coverage at 94% — 2 services not yet integrated.", recommended: ["Integrate remaining 2 services into automated scanning", "Reduce patch deployment pipeline from 8 days to 5 days", "Enable automated PR creation for critical CVE patches"] },
  { id: 4, area: "Team Readiness — On-Call Coverage", risk: "low", probability: "45%", timeframe: "60 days", prediction: "On-call rotation showing fatigue indicators: average response time increased 34% over 3 months, and 2 engineers have flagged burnout concerns. Current 4-person rotation may be insufficient for growing platform count. Risk of missed SLA if not addressed.", recommended: ["Expand on-call rotation to 6 engineers", "Implement tiered alerting to reduce noise by 40%", "Schedule on-call review with team by April 1"] },
];

const overallScore = Math.round(readinessScores.reduce((sum, s) => sum + s.A, 0) / readinessScores.length);

export default function PredictiveReadiness() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold">Predictive Readiness</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to Report</Link>
        </div>
      </header>

      <main className="pt-20 pb-16 max-w-6xl mx-auto px-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Predictive Readiness Analysis</h1>
          <p className="text-muted-foreground text-sm">AI-driven risk prediction and gap analysis across all operational dimensions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Overall Readiness</p>
            <p className={`text-5xl font-bold ${overallScore >= 85 ? "text-emerald-400" : overallScore >= 70 ? "text-amber-400" : "text-red-400"}`}>{overallScore}%</p>
            <p className="text-xs text-muted-foreground mt-1">{overallScore >= 85 ? "Strong" : overallScore >= 70 ? "Adequate — Improvements Needed" : "At Risk"}</p>
          </div>
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Readiness Radar</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={readinessScores}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} />
                  <RechartsRadar name="Readiness" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-amber-400" /> Predictive Risk Analysis</h3>
          <div className="space-y-4">
            {predictions.map((p, idx) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }} className={`rounded-xl border overflow-hidden ${p.risk === "high" ? "border-red-500/20" : p.risk === "medium" ? "border-amber-500/20" : "border-border"}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${p.risk === "high" ? "bg-red-500/10 text-red-400" : p.risk === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>{p.risk} risk</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{p.probability} probability · {p.timeframe} horizon</span>
                      </div>
                      <h4 className="text-sm font-semibold">{p.area}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.prediction}</p>
                  <div>
                    <h5 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> Recommended Actions</h5>
                    <ul className="space-y-1.5">
                      {p.recommended.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                          <span className="w-4 h-4 rounded bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
