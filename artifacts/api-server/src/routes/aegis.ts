import { Router } from "express";
import { requireAuth } from "./auth";
import { asyncHandler } from "../middleware/errorHandler";
import { rosieService } from "../services/rosie";
import { db } from "@szl-holdings/db";
import {
  aegisComplianceFrameworksTable,
  aegisVulnerabilitiesTable,
  aegisMitreTechniquesTable,
} from "@szl-holdings/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";

const router = Router();

router.use("/aegis", requireAuth);

router.get("/aegis/health", (_req, res) => {
  res.json({ ok: true, group: "aegis", timestamp: new Date().toISOString() });
});

router.get("/aegis/posture-score", asyncHandler(async (_req, res) => {
  const summary = await rosieService.getCrossSecuritySummary();
  const threats = summary.threats;
  const incidents = summary.incidents;
  const scans = summary.scans;

  const threatScore = threats.total > 0
    ? Math.max(0, 100 - (threats.critical * 15 + threats.high * 10 + threats.medium * 5 + threats.low * 2))
    : 100;

  const incidentScore = incidents.total > 0
    ? Math.round((incidents.resolved / incidents.total) * 100)
    : 100;

  const scanBlockRate = scans.threatsFound > 0
    ? Math.round((scans.threatsBlocked / scans.threatsFound) * 100)
    : 100;

  const overallScore = Math.round((threatScore * 0.4) + (incidentScore * 0.3) + (scanBlockRate * 0.3));

  const grade = overallScore >= 90 ? "A"
    : overallScore >= 80 ? "B"
    : overallScore >= 70 ? "C"
    : overallScore >= 60 ? "D"
    : "F";

  res.json({
    overallScore,
    grade,
    breakdown: {
      threatMitigation: { score: threatScore, weight: 0.4 },
      incidentResolution: { score: incidentScore, weight: 0.3 },
      scanEffectiveness: { score: scanBlockRate, weight: 0.3 },
    },
    timestamp: new Date().toISOString(),
  });
}));

router.get("/aegis/vulnerability-summary", asyncHandler(async (_req, res) => {
  const summary = await rosieService.getCrossSecuritySummary();
  const distribution = await rosieService.getSeverityDistribution();

  const totalVulnerabilities = summary.threats.total;
  const mitigated = summary.threats.blocked;
  const active = summary.threats.active;

  res.json({
    totalVulnerabilities,
    mitigated,
    active,
    mitigationRate: totalVulnerabilities > 0 ? Math.round((mitigated / totalVulnerabilities) * 100) : 100,
    bySeverity: distribution.threats,
    riskLevel: active > 10 ? "critical"
      : active > 5 ? "high"
      : active > 0 ? "medium"
      : "low",
    timestamp: new Date().toISOString(),
  });
}));

router.get("/aegis/compliance", asyncHandler(async (_req, res) => {
  const summary = await rosieService.getCrossSecuritySummary();
  const scanCoverage = await rosieService.getScanCoverageSummary();
  const incidentMetrics = await rosieService.getIncidentResolutionMetrics();

  const checks = [
    {
      id: "threat-monitoring",
      name: "Continuous Threat Monitoring",
      status: summary.threats.total > 0 ? "active" : "inactive",
      compliant: summary.threats.total > 0,
    },
    {
      id: "incident-response",
      name: "Incident Response Program",
      status: incidentMetrics.resolutionRate >= 80 ? "compliant" : "needs-attention",
      compliant: incidentMetrics.resolutionRate >= 80,
    },
    {
      id: "vulnerability-scanning",
      name: "Regular Vulnerability Scanning",
      status: scanCoverage.totals.totalScans > 0 ? "active" : "inactive",
      compliant: scanCoverage.totals.totalScans > 0,
    },
    {
      id: "threat-mitigation",
      name: "Threat Mitigation Rate",
      status: scanCoverage.blockRate >= 90 ? "compliant" : "needs-improvement",
      compliant: scanCoverage.blockRate >= 90,
    },
    {
      id: "multi-platform-coverage",
      name: "Multi-Platform Security Coverage",
      status: scanCoverage.byPlatform.length >= 2 ? "compliant" : "partial",
      compliant: scanCoverage.byPlatform.length >= 2,
    },
  ];

  const compliantCount = checks.filter(c => c.compliant).length;

  res.json({
    overallCompliance: Math.round((compliantCount / checks.length) * 100),
    checks,
    summary: {
      total: checks.length,
      compliant: compliantCount,
      nonCompliant: checks.length - compliantCount,
    },
    timestamp: new Date().toISOString(),
  });
}));

router.get("/aegis/compliance-frameworks", asyncHandler(async (_req, res) => {
  const frameworks = await db
    .select()
    .from(aegisComplianceFrameworksTable)
    .orderBy(asc(aegisComplianceFrameworksTable.name));

  res.json({ frameworks, timestamp: new Date().toISOString() });
}));

router.get("/aegis/vulnerabilities", asyncHandler(async (_req, res) => {
  const vulnerabilities = await db
    .select()
    .from(aegisVulnerabilitiesTable)
    .orderBy(desc(aegisVulnerabilitiesTable.cvss));

  res.json({ vulnerabilities, timestamp: new Date().toISOString() });
}));

router.get("/aegis/mitre-coverage", asyncHandler(async (_req, res) => {
  const techniques = await db
    .select()
    .from(aegisMitreTechniquesTable)
    .orderBy(asc(aegisMitreTechniquesTable.tactic), asc(aegisMitreTechniquesTable.name));

  const byTactic: Record<string, { id: string; name: string; coverage: number }[]> = {};
  for (const t of techniques) {
    if (!byTactic[t.tactic]) byTactic[t.tactic] = [];
    byTactic[t.tactic].push({ id: t.techniqueId, name: t.name, coverage: t.coverage });
  }

  const tactics = [
    "Reconnaissance", "Resource Dev", "Initial Access", "Execution",
    "Persistence", "Priv Escalation", "Defense Evasion", "Credential Access",
    "Discovery", "Lateral Movement", "Collection", "C2", "Exfiltration", "Impact"
  ];

  const allTechniques = techniques.map(t => ({ id: t.techniqueId, name: t.name, coverage: t.coverage }));
  const totalTechniques = allTechniques.length;
  const covered = allTechniques.filter(t => t.coverage >= 75).length;
  const avgCoverage = totalTechniques > 0
    ? Math.round(allTechniques.reduce((a, t) => a + t.coverage, 0) / totalTechniques)
    : 0;

  res.json({
    tactics,
    techniques: byTactic,
    stats: { totalTechniques, covered, avgCoverage },
    timestamp: new Date().toISOString(),
  });
}));

router.get("/aegis/threat-feed", asyncHandler(async (_req, res) => {
  const timeline = await rosieService.getIncidentTimeline(20);
  const threats = timeline.map((entry, i) => ({
    id: `thr-${entry.id}-${i}`,
    time: new Date(entry.timestamp).toLocaleTimeString("en-US", { hour12: false }),
    type: entry.title,
    origin: entry.description?.substring(0, 40) || "Unknown",
    severity: entry.severity === "critical" ? "CRITICAL" : entry.severity === "high" ? "HIGH" : "ELEVATED",
    status: entry.status === "blocked" ? "BLOCKED" : entry.status === "resolved" ? "RESOLVED" : "DETECTED",
  }));

  res.json({ threats, timestamp: new Date().toISOString() });
}));

router.get("/aegis/cross-app-summary", asyncHandler(async (_req, res) => {
  const summary = await rosieService.getCrossSecuritySummary();
  const scanCoverage = await rosieService.getScanCoverageSummary();

  const overallScore = summary.threats.total > 0
    ? Math.max(0, 100 - (summary.threats.critical * 5 + summary.threats.high * 3 + summary.threats.medium * 1))
    : 100;

  const apps = [
    {
      name: "Aegis",
      status: "nominal",
      score: Math.min(100, overallScore + 5),
      threats: summary.threats.active,
      color: "#f59e0b",
      gradient: "from-amber-500/20 to-amber-500/5",
    },
    {
      name: "Firestorm",
      status: "simulating",
      score: Math.max(0, Math.min(100, scanCoverage.blockRate - 10)),
      threats: summary.threats.critical,
      color: "#f97316",
      gradient: "from-orange-500/20 to-orange-500/5",
    },
    {
      name: "ROSIE",
      status: "monitoring",
      score: Math.min(100, Math.round((summary.incidents.resolved / Math.max(1, summary.incidents.total)) * 100)),
      threats: summary.incidents.open,
      color: "#06b6d4",
      gradient: "from-cyan-500/20 to-cyan-500/5",
    },
  ];

  const avgScore = Math.round(apps.reduce((a, b) => a + b.score, 0) / apps.length);
  const totalThreats = apps.reduce((a, b) => a + b.threats, 0);

  res.json({ apps, overallScore: avgScore, totalThreats, timestamp: new Date().toISOString() });
}));

export default router;
