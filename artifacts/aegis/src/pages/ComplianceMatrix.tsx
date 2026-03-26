import { motion } from "framer-motion";
import { Shield, CheckCircle2, AlertCircle, Clock, FileText, TrendingUp, Brain, Lock } from "lucide-react";

const frameworks = [
  {
    name: "SOC 2 Type II", status: "in-progress", coverage: 84, deadline: "2026-06-15",
    controls: [
      { id: "CC6.1", name: "Logical Access Controls", status: "compliant", evidence: "Automated" },
      { id: "CC6.2", name: "Authentication Mechanisms", status: "compliant", evidence: "Automated" },
      { id: "CC6.3", name: "Access Provisioning", status: "partial", evidence: "Manual review needed" },
      { id: "CC7.1", name: "Change Management", status: "gap", evidence: "Documentation incomplete" },
      { id: "CC7.2", name: "System Monitoring", status: "compliant", evidence: "Beacon integrated" },
      { id: "CC8.1", name: "Incident Response", status: "partial", evidence: "Tabletop exercise pending" },
    ],
  },
  {
    name: "ISO 27001", status: "certified", coverage: 96, deadline: "2026-12-01",
    controls: [
      { id: "A.5", name: "Information Security Policies", status: "compliant", evidence: "Annual review completed" },
      { id: "A.6", name: "Organization of InfoSec", status: "compliant", evidence: "RACI matrix current" },
      { id: "A.8", name: "Asset Management", status: "compliant", evidence: "CMDB integrated" },
      { id: "A.9", name: "Access Control", status: "compliant", evidence: "IAM automated" },
      { id: "A.12", name: "Operations Security", status: "compliant", evidence: "Rosie monitoring active" },
      { id: "A.18", name: "Compliance", status: "partial", evidence: "Legal review Q2" },
    ],
  },
  {
    name: "GDPR", status: "compliant", coverage: 91, deadline: "Ongoing",
    controls: [
      { id: "Art.5", name: "Data Processing Principles", status: "compliant", evidence: "DPA signed" },
      { id: "Art.25", name: "Data Protection by Design", status: "compliant", evidence: "Architecture review" },
      { id: "Art.30", name: "Records of Processing", status: "compliant", evidence: "Data map current" },
      { id: "Art.32", name: "Security of Processing", status: "compliant", evidence: "Encryption validated" },
      { id: "Art.33", name: "Breach Notification", status: "partial", evidence: "Process defined, not tested" },
      { id: "Art.35", name: "Impact Assessment", status: "compliant", evidence: "DPIA completed" },
    ],
  },
];

const statusIcon = (s: string) => s === "compliant" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : s === "partial" ? <Clock className="w-3.5 h-3.5 text-amber-400" /> : <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
const frameworkStatus = (s: string) => s === "certified" ? "bg-emerald-500/10 text-emerald-400" : s === "compliant" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400";

export default function ComplianceMatrix() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Regulatory Compliance Intelligence</p>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Matrix</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time compliance posture across all regulatory frameworks with gap analysis</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {frameworks.map((fw, i) => (
            <motion.div key={fw.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{fw.name}</h3>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${frameworkStatus(fw.status)}`}>{fw.status}</span>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Coverage</span>
                  <span className="font-mono text-white">{fw.coverage}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${fw.coverage}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }} className={`h-full rounded-full ${fw.coverage >= 90 ? "bg-emerald-400" : fw.coverage >= 75 ? "bg-amber-400" : "bg-red-400"}`} />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-mono">Deadline: {fw.deadline}</p>
            </motion.div>
          ))}
        </div>

        {frameworks.map((fw, fwIdx) => (
          <motion.div key={fw.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + fwIdx * 0.1 }} className="rounded-xl border border-white/5 overflow-hidden">
            <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold">{fw.name} — Control Status</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-white/[0.01]">
                <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                  <th className="px-5 py-2">Control ID</th><th className="px-5 py-2">Control Name</th><th className="px-5 py-2">Status</th><th className="px-5 py-2">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {fw.controls.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-5 py-2.5 text-xs font-mono text-cyan-400">{c.id}</td>
                    <td className="px-5 py-2.5 text-sm">{c.name}</td>
                    <td className="px-5 py-2.5"><div className="flex items-center gap-1.5">{statusIcon(c.status)}<span className="text-xs capitalize">{c.status}</span></div></td>
                    <td className="px-5 py-2.5 text-xs text-gray-400">{c.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
