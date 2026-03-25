import { Router } from "express";
import { getHealthSummary, isAppInsightsConfigured } from "../lib/appInsights";
import { isEntraConfigured } from "../lib/entra";

const router = Router();

router.get("/monitoring/health", (_req, res) => {
  const appInsights = getHealthSummary();
  const entraConfigured = isEntraConfigured();

  const uptime = process.uptime();
  const memUsage = process.memoryUsage();

  return res.json({
    server: {
      uptime: Math.round(uptime),
      uptimeFormatted: formatUptime(uptime),
      memoryUsageMB: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      },
      nodeVersion: process.version,
      env: process.env.NODE_ENV || "development",
    },
    appInsights,
    identity: {
      provider: entraConfigured ? "Entra External ID" : "Demo Credentials",
      configured: entraConfigured,
    },
    timestamp: new Date().toISOString(),
  });
});

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

export default router;
