import { Router } from "express";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import {
  vesselsTable,
  vesselVoyagesTable,
  vesselAlertsTable,
  carlotaJoInquiriesTable,
  carlotaJoEngagementsTable,
} from "@szl-holdings/db/schema";
import { count, eq, sql } from "drizzle-orm";
import { requireAuth } from "./auth";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../lib/errors";
import { getCachedOrFetch, invalidateCache, CACHE_KEYS, CACHE_TTLS } from "../lib/cache";
import { isRedisReady, isRedisConfigured } from "../lib/redis";
import { isKeyVaultConfigured } from "../lib/keyvault";
import { isBlobStorageConfigured } from "../lib/blobStorage";

const router = Router();

const CHILD_APPS = [
  { name: "Vessels", slug: "vessels", description: "Maritime intelligence & fleet management" },
  { name: "INCA", slug: "inca", description: "Intelligence platform" },
  { name: "Carlota Jo", slug: "carlota-jo", description: "Consulting services" },
  { name: "Beacon", slug: "beacon", description: "Financial tracking" },
  { name: "Nimbus", slug: "nimbus", description: "Cloud operations" },
  { name: "Zeus", slug: "zeus", description: "Strategic planning" },
  { name: "Dreamera", slug: "dreamera", description: "Creative platform" },
  { name: "Firestorm", slug: "firestorm", description: "Social media management" },
  { name: "Lyte", slug: "lyte", description: "Utility management" },
  { name: "Alloy", slug: "alloy", description: "Integration & monitoring" },
];

router.get("/szl-holdings/health", (_req, res) => {
  res.json({ ok: true, group: "szl-holdings", timestamp: new Date().toISOString() });
});

router.get("/szl-holdings/portfolio", requireAuth, asyncHandler(async (_req, res) => {
  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database unavailable");
  }

  const summary = await getCachedOrFetch(
    CACHE_KEYS.PORTFOLIO_SUMMARY,
    async () => {
      const [vesselStats] = await db.select({
        totalVessels: count(),
        activeVessels: count(sql`CASE WHEN ${vesselsTable.status} != 'drydock' THEN 1 END`),
        ladenVessels: count(sql`CASE WHEN ${vesselsTable.status} = 'laden' THEN 1 END`),
        avgUtilization: sql<number>`COALESCE(AVG(${vesselsTable.utilization}), 0)`,
        avgTce: sql<number>`COALESCE(AVG(${vesselsTable.tce}), 0)`,
      }).from(vesselsTable);

      const [voyageStats] = await db.select({
        totalVoyages: count(),
        activeVoyages: count(sql`CASE WHEN ${vesselVoyagesTable.status} = 'in-progress' THEN 1 END`),
        avgProgress: sql<number>`COALESCE(AVG(${vesselVoyagesTable.progress}), 0)`,
      }).from(vesselVoyagesTable);

      const [alertStats] = await db.select({
        totalAlerts: count(),
        unacknowledged: count(sql`CASE WHEN ${vesselAlertsTable.acknowledged} = false THEN 1 END`),
        criticalAlerts: count(sql`CASE WHEN ${vesselAlertsTable.severity} = 'critical' AND ${vesselAlertsTable.acknowledged} = false THEN 1 END`),
      }).from(vesselAlertsTable);

      const [inquiryStats] = await db.select({
        totalInquiries: count(),
        newInquiries: count(sql`CASE WHEN ${carlotaJoInquiriesTable.status} = 'new' THEN 1 END`),
      }).from(carlotaJoInquiriesTable);

      const [engagementStats] = await db.select({
        totalEngagements: count(),
        activeEngagements: count(sql`CASE WHEN ${carlotaJoEngagementsTable.status} = 'active' THEN 1 END`),
      }).from(carlotaJoEngagementsTable);

      return {
        vessels: {
          total: vesselStats.totalVessels,
          active: vesselStats.activeVessels,
          laden: vesselStats.ladenVessels,
          avgUtilization: Math.round(Number(vesselStats.avgUtilization)),
          avgTce: Math.round(Number(vesselStats.avgTce)),
        },
        voyages: {
          total: voyageStats.totalVoyages,
          active: voyageStats.activeVoyages,
          avgProgress: Math.round(Number(voyageStats.avgProgress)),
        },
        alerts: {
          total: alertStats.totalAlerts,
          unacknowledged: alertStats.unacknowledged,
          critical: alertStats.criticalAlerts,
        },
        consulting: {
          totalInquiries: inquiryStats.totalInquiries,
          newInquiries: inquiryStats.newInquiries,
          totalEngagements: engagementStats.totalEngagements,
          activeEngagements: engagementStats.activeEngagements,
        },
        childApps: CHILD_APPS,
        generatedAt: new Date().toISOString(),
      };
    },
    { ttlSeconds: CACHE_TTLS.PORTFOLIO_SUMMARY },
  );

  res.json(summary);
}));

router.get("/szl-holdings/ecosystem-health", requireAuth, asyncHandler(async (_req, res) => {
  const health = await getCachedOrFetch(
    CACHE_KEYS.ECOSYSTEM_HEALTH,
    async () => {
      const services: Record<string, { status: string; details?: string }> = {};

      services.database = {
        status: isDatabaseAvailable() ? "healthy" : "unavailable",
      };

      services.redis = {
        status: isRedisConfigured()
          ? isRedisReady() ? "healthy" : "degraded"
          : "not_configured",
      };

      services.keyVault = {
        status: isKeyVaultConfigured() ? "configured" : "not_configured",
      };

      services.blobStorage = {
        status: isBlobStorageConfigured() ? "configured" : "not_configured",
      };

      const appHealthChecks = CHILD_APPS.map((app) => ({
        name: app.name,
        slug: app.slug,
        status: "operational" as const,
        endpoint: `/api/${app.slug}/health`,
      }));

      const overallHealthy = services.database.status === "healthy";

      return {
        ok: overallHealthy,
        timestamp: new Date().toISOString(),
        services,
        apps: appHealthChecks,
      };
    },
    { ttlSeconds: CACHE_TTLS.ECOSYSTEM_HEALTH },
  );

  res.json(health);
}));

router.get("/szl-holdings/company", (_req, res) => {
  res.json({
    name: "SZL Holdings",
    description: "A diversified holding company with a portfolio of technology and maritime businesses.",
    founded: "2020",
    headquarters: "Global",
    divisions: [
      {
        name: "Maritime & Logistics",
        apps: ["Vessels"],
        description: "Fleet management, voyage tracking, compliance, and commercial operations.",
      },
      {
        name: "Intelligence & Analytics",
        apps: ["INCA", "Alloy"],
        description: "Data intelligence platforms and integration monitoring.",
      },
      {
        name: "Professional Services",
        apps: ["Carlota Jo"],
        description: "Consulting and advisory services.",
      },
      {
        name: "Digital Products",
        apps: ["Beacon", "Nimbus", "Zeus", "Dreamera", "Firestorm", "Lyte"],
        description: "Financial tools, cloud ops, strategic planning, creative, social, and utility apps.",
      },
    ],
    timestamp: new Date().toISOString(),
  });
});

router.get("/szl-holdings/team", (_req, res) => {
  res.json({
    departments: [
      { name: "Engineering", headcount: 45, lead: "CTO" },
      { name: "Operations", headcount: 30, lead: "COO" },
      { name: "Maritime Operations", headcount: 25, lead: "VP Maritime" },
      { name: "Business Development", headcount: 15, lead: "VP BD" },
      { name: "Data Science", headcount: 12, lead: "Head of Data" },
      { name: "Product", headcount: 10, lead: "VP Product" },
    ],
    totalHeadcount: 137,
    timestamp: new Date().toISOString(),
  });
});

export default router;
