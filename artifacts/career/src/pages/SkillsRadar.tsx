import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Award, Target, Sparkles, BookOpen, Code, Briefcase } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Link } from "wouter";

const defaultSkillsData = [
  { subject: "Frontend", current: 92, target: 95 },
  { subject: "Backend", current: 88, target: 90 },
  { subject: "DevOps", current: 75, target: 85 },
  { subject: "Security", current: 70, target: 80 },
  { subject: "AI/ML", current: 82, target: 90 },
  { subject: "Leadership", current: 85, target: 90 },
  { subject: "Architecture", current: 78, target: 85 },
  { subject: "Communication", current: 90, target: 92 },
];

const defaultGrowthAreas = [
  { skill: "Kubernetes & Container Orchestration", gap: 15, priority: "High", recommendation: "Complete CKA certification track — estimated 40 hours", resources: ["KodeKloud CKA Course", "Kubernetes the Hard Way", "Practice Labs"] },
  { skill: "Zero-Trust Security Architecture", gap: 12, priority: "High", recommendation: "Deep dive into NIST Zero Trust framework and implement proof-of-concept with Aegis", resources: ["NIST SP 800-207", "Zero Trust Architecture (O'Reilly)", "Aegis codebase study"] },
  { skill: "MLOps & Model Deployment", gap: 10, priority: "Medium", recommendation: "Build end-to-end ML pipeline with INCA experiment platform", resources: ["MLOps Zoomcamp", "Weights & Biases tutorials", "INCA ML pipeline docs"] },
  { skill: "System Design at Scale", gap: 8, priority: "Medium", recommendation: "Study Zeus architecture patterns and contribute to capacity planning", resources: ["Designing Data-Intensive Apps", "Zeus architecture docs", "System Design Interview prep"] },
];

const defaultCertifications = [
  { name: "AWS Solutions Architect Professional", status: "completed", date: "2025-11-15", progress: 100 },
  { name: "Certified Kubernetes Administrator", status: "in-progress", date: null, progress: 65 },
  { name: "CISSP (Security)", status: "planned", date: "2026-Q3", progress: 0 },
  { name: "Google Cloud ML Engineer", status: "planned", date: "2026-Q4", progress: 0 },
];

export default function SkillsRadar() {
  const API_BASE = import.meta.env.VITE_API_URL || "/api";
  const [skillsData, setSkillsData] = useState(defaultSkillsData);
  const [growthAreas, setGrowthAreas] = useState(defaultGrowthAreas);
  const [certifications, setCertifications] = useState(defaultCertifications);
  const [overallScore, setOverallScore] = useState(Math.round(defaultSkillsData.reduce((s, d) => s + d.current, 0) / defaultSkillsData.length));

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/career/skills`).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/career/certifications`).then(r => r.ok ? r.json() : null),
    ]).then(([skillsRes, certsRes]) => {
      if (skillsRes) {
        if (skillsRes.radar) setSkillsData(skillsRes.radar);
        if (skillsRes.growthAreas) setGrowthAreas(skillsRes.growthAreas);
        if (skillsRes.overallScore) setOverallScore(skillsRes.overallScore);
      }
      if (certsRes?.certifications) setCertifications(certsRes.certifications);
    }).catch(() => {});
  }, [API_BASE]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-bold">Skills Radar</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to Career</Link>
        </div>
      </header>

      <main className="pt-20 pb-16 max-w-6xl mx-auto px-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Skills Intelligence Radar</h1>
          <p className="text-muted-foreground text-sm">AI-analyzed skill assessment with personalized growth recommendations and certification tracking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Overall Proficiency</p>
            <p className={`text-5xl font-bold ${overallScore >= 85 ? "text-emerald-400" : "text-amber-400"}`}>{overallScore}%</p>
            <p className="text-xs text-muted-foreground mt-1">Senior+ Level</p>
          </div>
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Skills vs Target</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillsData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} />
                  <Radar name="Current" dataKey="current" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Target" dataKey="target" stroke="#10b981" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-amber-400" /> AI Growth Recommendations</h3>
          <div className="space-y-3">
            {growthAreas.map((g, idx) => (
              <motion.div key={g.skill} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold">{g.skill}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-amber-400">Gap: {g.gap}pts</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${g.priority === "High" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>{g.priority}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{g.recommendation}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.resources.map(r => <span key={r} className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/10">{r}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-cyan-400" /> Certification Tracker</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {certifications.map((c, idx) => (
              <motion.div key={c.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.06 }} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">{c.name}</h4>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${c.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : c.status === "in-progress" ? "bg-cyan-500/10 text-cyan-400" : "bg-gray-500/10 text-gray-400"}`}>{c.status}</span>
                </div>
                {c.progress !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-mono">{c.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${c.progress}%` }} transition={{ delay: 0.5, duration: 0.8 }} className="h-full rounded-full bg-cyan-400" />
                    </div>
                  </div>
                )}
                {c.date && <p className="text-[10px] text-muted-foreground mt-1 font-mono">{c.date}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
