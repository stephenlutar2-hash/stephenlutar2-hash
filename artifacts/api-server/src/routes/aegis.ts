import { Router } from "express";
import { requireAuth } from "./auth";
import { asyncHandler } from "../middleware/errorHandler";
import { rosieService } from "../services/rosie";

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

export default router;
