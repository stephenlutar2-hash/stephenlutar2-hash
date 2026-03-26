import { Router } from "express";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import {
  vesselsTable,
  vesselVoyagesTable,
  vesselAlertsTable,
  vesselShipmentsTable,
  carlotaJoInquiriesTable,
  carlotaJoEngagementsTable,
  beaconMetricsTable,
  beaconProjectsTable,
  nimbusPredictionsTable,
  nimbusAlertsTable,
  zeusModulesTable,
  zeusLogsTable,
  incaProjectsTable,
  incaExperimentsTable,
  rosieThreatsTable,
  rosieIncidentsTable,
} from "@szl-holdings/db/schema";
import { count, sql } from "drizzle-orm";
import { requireAuth } from "./auth";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../lib/errors";
import { getCachedOrFetch, CACHE_KEYS, CACHE_TTLS } from "../lib/cache";

const router = Router();

router.get("/platform/dashboard", requireAuth, asyncHandler(async (_req, res) => {
  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database unavailable");
  }

  const dashboard = await getCachedOrFetch(
    CACHE_KEYS.PLATFORM_DASHBOARD,
    async () => {
      const [vesselKpis] = await db.select({
        totalVessels: count(),
        activeVessels: count(sql`CASE WHEN ${vesselsTable.status} != 'drydock' THEN 1 END`),
        avgUtilization: sql<number>`COALESCE(AVG(${vesselsTable.utilization}), 0)`,
        avgTce: sql<number>`COALESCE(AVG(${vesselsTable.tce}), 0)`,
        totalDwt: sql<number>`COALESCE(SUM(${vesselsTable.dwt}), 0)`,
      }).from(vesselsTable);

      const [voyageKpis] = await db.select({
        totalVoyages: count(),
        activeVoyages: count(sql`CASE WHEN ${vesselVoyagesTable.status} = 'in-progress' THEN 1 END`),
        avgRiskScore: sql<number>`COALESCE(AVG(${vesselVoyagesTable.riskScore}), 0)`,
      }).from(vesselVoyagesTable);

      const [alertKpis] = await db.select({
        totalAlerts: count(),
        unacknowledged: count(sql`CASE WHEN ${vesselAlertsTable.acknowledged} = false THEN 1 END`),
        critical: count(sql`CASE WHEN ${vesselAlertsTable.severity} = 'critical' AND ${vesselAlertsTable.acknowledged} = false THEN 1 END`),
        high: count(sql`CASE WHEN ${vesselAlertsTable.severity} = 'high' AND ${vesselAlertsTable.acknowledged} = false THEN 1 END`),
      }).from(vesselAlertsTable);

      const [shipmentKpis] = await db.select({
        totalShipments: count(),
        avgProgress: sql<number>`COALESCE(AVG(${vesselShipmentsTable.progress}), 0)`,
        totalDemurrageRisk: sql<number>`COALESCE(SUM(${vesselShipmentsTable.demurrageRisk}), 0)`,
      }).from(vesselShipmentsTable);

      const [inquiryKpis] = await db.select({
        totalInquiries: count(),
        newInquiries: count(sql`CASE WHEN ${carlotaJoInquiriesTable.status} = 'new' THEN 1 END`),
        convertedInquiries: count(sql`CASE WHEN ${carlotaJoInquiriesTable.status} = 'converted' THEN 1 END`),
      }).from(carlotaJoInquiriesTable);

      const [engagementKpis] = await db.select({
        totalEngagements: count(),
        activeEngagements: count(sql`CASE WHEN ${carlotaJoEngagementsTable.status} = 'active' THEN 1 END`),
        completedEngagements: count(sql`CASE WHEN ${carlotaJoEngagementsTable.status} = 'completed' THEN 1 END`),
      }).from(carlotaJoEngagementsTable);

      const [beaconKpis] = await db.select({
        totalMetrics: count(),
      }).from(beaconMetricsTable);

      const [beaconProjectKpis] = await db.select({
        totalProjects: count(),
        activeProjects: count(sql`CASE WHEN ${beaconProjectsTable.status} = 'active' THEN 1 END`),
      }).from(beaconProjectsTable);

      const [nimbusKpis] = await db.select({
        totalPredictions: count(),
        pendingPredictions: count(sql`CASE WHEN ${nimbusPredictionsTable.status} = 'pending' THEN 1 END`),
      }).from(nimbusPredictionsTable);

      const [nimbusAlertKpis] = await db.select({
        totalAlerts: count(),
        unreadAlerts: count(sql`CASE WHEN ${nimbusAlertsTable.isRead} = false THEN 1 END`),
      }).from(nimbusAlertsTable);

      const [zeusKpis] = await db.select({
        totalModules: count(),
        activeModules: count(sql`CASE WHEN ${zeusModulesTable.status} = 'active' THEN 1 END`),
      }).from(zeusModulesTable);

      const [zeusLogKpis] = await db.select({
        totalLogs: count(),
      }).from(zeusLogsTable);

      const [incaKpis] = await db.select({
        totalProjects: count(),
      }).from(incaProjectsTable);

      const [incaExpKpis] = await db.select({
        totalExperiments: count(),
        runningExperiments: count(sql`CASE WHEN ${incaExperimentsTable.status} = 'running' THEN 1 END`),
      }).from(incaExperimentsTable);

      const [rosieKpis] = await db.select({
        totalThreats: count(),
        blockedThreats: count(sql`CASE WHEN ${rosieThreatsTable.status} = 'blocked' THEN 1 END`),
      }).from(rosieThreatsTable);

      const [rosieIncidentKpis] = await db.select({
        totalIncidents: count(),
        openIncidents: count(sql`CASE WHEN ${rosieIncidentsTable.status} = 'open' THEN 1 END`),
      }).from(rosieIncidentsTable);

      return {
        vessels: {
          total: vesselKpis.totalVessels,
          active: vesselKpis.activeVessels,
          avgUtilization: Math.round(Number(vesselKpis.avgUtilization)),
          avgTce: Math.round(Number(vesselKpis.avgTce)),
          totalDwt: Number(vesselKpis.totalDwt),
        },
        voyages: {
          total: voyageKpis.totalVoyages,
          active: voyageKpis.activeVoyages,
          avgRiskScore: Math.round(Number(voyageKpis.avgRiskScore)),
        },
        alerts: {
          total: alertKpis.totalAlerts,
          unacknowledged: alertKpis.unacknowledged,
          critical: alertKpis.critical,
          high: alertKpis.high,
        },
        shipments: {
          total: shipmentKpis.totalShipments,
          avgProgress: Math.round(Number(shipmentKpis.avgProgress)),
          totalDemurrageRisk: Number(shipmentKpis.totalDemurrageRisk),
        },
        consulting: {
          totalInquiries: inquiryKpis.totalInquiries,
          newInquiries: inquiryKpis.newInquiries,
          convertedInquiries: inquiryKpis.convertedInquiries,
          totalEngagements: engagementKpis.totalEngagements,
          activeEngagements: engagementKpis.activeEngagements,
          completedEngagements: engagementKpis.completedEngagements,
        },
        beacon: {
          totalMetrics: beaconKpis.totalMetrics,
          totalProjects: beaconProjectKpis.totalProjects,
          activeProjects: beaconProjectKpis.activeProjects,
        },
        nimbus: {
          totalPredictions: nimbusKpis.totalPredictions,
          pendingPredictions: nimbusKpis.pendingPredictions,
          totalAlerts: nimbusAlertKpis.totalAlerts,
          unreadAlerts: nimbusAlertKpis.unreadAlerts,
        },
        zeus: {
          totalModules: zeusKpis.totalModules,
          activeModules: zeusKpis.activeModules,
          totalLogs: zeusLogKpis.totalLogs,
        },
        inca: {
          totalProjects: incaKpis.totalProjects,
          totalExperiments: incaExpKpis.totalExperiments,
          runningExperiments: incaExpKpis.runningExperiments,
        },
        rosie: {
          totalThreats: rosieKpis.totalThreats,
          blockedThreats: rosieKpis.blockedThreats,
          totalIncidents: rosieIncidentKpis.totalIncidents,
          openIncidents: rosieIncidentKpis.openIncidents,
        },
        generatedAt: new Date().toISOString(),
      };
    },
    { ttlSeconds: CACHE_TTLS.PLATFORM_DASHBOARD },
  );

  res.json(dashboard);
}));

export default router;
