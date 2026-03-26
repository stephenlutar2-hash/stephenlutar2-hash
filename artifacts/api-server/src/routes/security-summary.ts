import { Router } from "express";
import { requireAuth } from "./auth";
import { asyncHandler } from "../middleware/errorHandler";
import { rosieService } from "../services/rosie";
import { getFirestormMetrics } from "./firestorm";

const router = Router();

router.get("/security/summary", requireAuth, asyncHandler(async (_req, res) => {
  const crossSummary = await rosieService.getCrossSecuritySummary();
  const scanCoverage = await rosieService.getScanCoverageSummary();
  const incidentMetrics = await rosieService.getIncidentResolutionMetrics();
  const firestormMetrics = getFirestormMetrics();

  const threatScore = crossSummary.threats.total > 0
    ? Math.max(0, 100 - (crossSummary.threats.critical * 15 + crossSummary.threats.high * 10 + crossSummary.threats.medium * 5 + crossSummary.threats.low * 2))
    : 100;

  const incidentScore = crossSummary.incidents.total > 0
    ? Math.round((crossSummary.incidents.resolved / crossSummary.incidents.total) * 100)
    : 100;

  const overallScore = Math.round((threatScore * 0.4) + (incidentScore * 0.3) + (scanCoverage.blockRate * 0.3));

  res.json({
    overallSecurityScore: overallScore,
    rosie: {
      threats: crossSummary.threats,
      incidents: crossSummary.incidents,
      scans: crossSummary.scans,
      incidentResolutionRate: incidentMetrics.resolutionRate,
    },
    aegis: {
      postureScore: overallScore,
      grade: overallScore >= 90 ? "A" : overallScore >= 80 ? "B" : overallScore >= 70 ? "C" : overallScore >= 60 ? "D" : "F",
      vulnerabilities: {
        total: crossSummary.threats.total,
        active: crossSummary.threats.active,
        mitigated: crossSummary.threats.blocked,
      },
    },
    firestorm: {
      totalScenarios: firestormMetrics.totalScenarios,
      runningScenarios: firestormMetrics.runningScenarios,
      completedScenarios: firestormMetrics.completedScenarios,
      totalEvents: firestormMetrics.totalEvents,
      detectedEvents: firestormMetrics.detectedEvents,
      missedEvents: firestormMetrics.missedEvents,
      detectionRate: firestormMetrics.detectionRate,
    },
    scanCoverage: {
      totalScans: scanCoverage.totals.totalScans,
      threatsFound: scanCoverage.totals.totalThreatsFound,
      threatsBlocked: scanCoverage.totals.totalThreatsBlocked,
      blockRate: scanCoverage.blockRate,
      platformCoverage: scanCoverage.byPlatform,
    },
    timestamp: new Date().toISOString(),
  });
}));

export default router;
