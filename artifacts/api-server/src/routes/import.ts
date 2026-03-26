import { Router } from "express";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import {
  incaProjectsTable,
  incaExperimentsTable,
  vesselsTable,
  vesselEmissionsTable,
  vesselVoyagesTable,
  vesselPortsTable,
  vesselShipmentsTable,
  rosieThreatsTable,
  rosieIncidentsTable,
  rosieScansTable,
  beaconMetricsTable,
  beaconProjectsTable,
  nimbusPredictionsTable,
  nimbusAlertsTable,
  dreameraContentTable,
  dreameraCampaignsTable,
  zeusModulesTable,
  zeusLogsTable,
} from "@szl-holdings/db/schema";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "./auth";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

const router = Router();

router.get("/import/health", (_req, res) => {
  res.json({ ok: true, group: "import", timestamp: new Date().toISOString() });
});

interface ImportHandler {
  table: any;
  mapRow: (row: Record<string, any>) => Record<string, any>;
}

const importHandlers: Record<string, Record<string, ImportHandler>> = {
  inca: {
    projects: {
      table: incaProjectsTable,
      mapRow: (row) => ({
        name: String(row.name || "Untitled"),
        description: String(row.description || ""),
        status: String(row.status || "research"),
        aiModel: String(row.aiModel || row.ai_model || row.model || "Unknown"),
        accuracy: String(row.accuracy || "0"),
      }),
    },
    experiments: {
      table: incaExperimentsTable,
      mapRow: (row) => ({
        projectId: Number(row.projectId || row.project_id || 1),
        name: String(row.name || "Untitled"),
        hypothesis: String(row.hypothesis || ""),
        result: String(row.result || ""),
        status: String(row.status || "running"),
        accuracy: String(row.accuracy || "0"),
      }),
    },
  },
  vessels: {
    fleet: {
      table: vesselsTable,
      mapRow: (row) => ({
        vesselCode: String(row.vesselCode || row.vessel_code || `V-${Date.now()}`),
        name: String(row.name || "Unknown"),
        imo: String(row.imo || "0000000"),
        flag: String(row.flag || "Unknown"),
        type: String(row.type || "VLGC"),
        dwt: Number(row.dwt || 0),
        cbm: Number(row.cbm || 0),
        built: Number(row.built || 2020),
        class: String(row.class || "Unknown"),
        status: String(row.status || "ballast"),
        speed: Number(row.speed || 0),
        lat: Number(row.lat || 0),
        lng: Number(row.lng || 0),
      }),
    },
    emissions: {
      table: vesselEmissionsTable,
      mapRow: (row) => ({
        vesselId: Number(row.vesselId || row.vessel_id || 1),
        date: String(row.date || new Date().toISOString().split("T")[0]),
        co2Tons: Number(row.co2Tons || row.co2_tons || 0),
        fuelConsumedTons: Number(row.fuelConsumedTons || row.fuel_consumed_tons || 0),
        fuelType: String(row.fuelType || row.fuel_type || "VLSFO"),
        distanceNm: row.distanceNm != null ? Number(row.distanceNm) : null,
      }),
    },
    voyages: {
      table: vesselVoyagesTable,
      mapRow: (row) => ({
        voyageCode: String(row.voyageCode || row.voyage_code || `VX-${Date.now()}`),
        vesselId: Number(row.vesselId || row.vessel_id || 1),
        origin: String(row.origin || "Unknown"),
        destination: String(row.destination || "Unknown"),
        status: String(row.status || "in-progress"),
        cargo: row.cargo ? String(row.cargo) : null,
        cargoVolume: row.cargoVolume ? String(row.cargoVolume) : null,
        progress: Number(row.progress || 0),
      }),
    },
    ports: {
      table: vesselPortsTable,
      mapRow: (row) => ({
        name: String(row.name || "Unknown"),
        code: String(row.code || "UNK"),
        country: String(row.country || "Unknown"),
        lat: Number(row.lat || 0),
        lng: Number(row.lng || 0),
        type: String(row.type || "terminal"),
      }),
    },
    shipments: {
      table: vesselShipmentsTable,
      mapRow: (row) => ({
        shipmentCode: String(row.shipmentCode || row.shipment_code || `SHP-${Date.now()}`),
        vesselId: Number(row.vesselId || row.vessel_id || 1),
        cargo: String(row.cargo || "Unknown"),
        volume: String(row.volume || "0"),
        origin: String(row.origin || "Unknown"),
        destination: String(row.destination || "Unknown"),
        progress: Number(row.progress || 0),
      }),
    },
  },
  rosie: {
    threats: {
      table: rosieThreatsTable,
      mapRow: (row) => ({
        type: String(row.type || "unknown"),
        source: String(row.source || "Unknown"),
        target: String(row.target || "Unknown"),
        severity: String(row.severity || "medium"),
        status: String(row.status || "blocked"),
        description: String(row.description || ""),
      }),
    },
    incidents: {
      table: rosieIncidentsTable,
      mapRow: (row) => ({
        title: String(row.title || "Untitled"),
        description: String(row.description || ""),
        severity: String(row.severity || "medium"),
        status: String(row.status || "open"),
        assignee: String(row.assignee || "ROSIE AI"),
        platform: String(row.platform || "Unknown"),
        resolved: Boolean(row.resolved),
      }),
    },
    scans: {
      table: rosieScansTable,
      mapRow: (row) => ({
        platform: String(row.platform || "Unknown"),
        scanType: String(row.scanType || row.scan_type || "vulnerability"),
        status: String(row.status || "completed"),
        threatsFound: Number(row.threatsFound || row.threats_found || 0),
        threatsBlocked: Number(row.threatsBlocked || row.threats_blocked || 0),
        duration: Number(row.duration || 0),
      }),
    },
  },
  beacon: {
    metrics: {
      table: beaconMetricsTable,
      mapRow: (row) => ({
        name: String(row.name || "Untitled"),
        value: String(row.value || "0"),
        unit: String(row.unit || "count"),
        change: String(row.change || "0"),
        category: String(row.category || "general"),
      }),
    },
    projects: {
      table: beaconProjectsTable,
      mapRow: (row) => ({
        name: String(row.name || "Untitled"),
        description: String(row.description || ""),
        status: String(row.status || "active"),
        progress: Number(row.progress || 0),
        platform: String(row.platform || "Unknown"),
      }),
    },
  },
  nimbus: {
    predictions: {
      table: nimbusPredictionsTable,
      mapRow: (row) => ({
        title: String(row.title || "Untitled"),
        description: String(row.description || ""),
        confidence: String(row.confidence || "50"),
        category: String(row.category || "general"),
        outcome: String(row.outcome || "pending"),
        timeframe: String(row.timeframe || "30d"),
        status: String(row.status || "pending"),
      }),
    },
    alerts: {
      table: nimbusAlertsTable,
      mapRow: (row) => ({
        title: String(row.title || "Untitled"),
        message: String(row.message || ""),
        severity: String(row.severity || "medium"),
        category: String(row.category || "general"),
        isRead: Boolean(row.isRead || row.is_read),
      }),
    },
  },
  dreamera: {
    content: {
      table: dreameraContentTable,
      mapRow: (row) => ({
        title: String(row.title || "Untitled"),
        body: String(row.body || row.content || ""),
        type: String(row.type || "article"),
        status: String(row.status || "draft"),
        views: Number(row.views || 0),
        engagement: String(row.engagement || "0"),
      }),
    },
    campaigns: {
      table: dreameraCampaignsTable,
      mapRow: (row) => ({
        name: String(row.name || "Untitled"),
        description: String(row.description || ""),
        status: String(row.status || "planning"),
        budget: String(row.budget || "0"),
        reach: Number(row.reach || 0),
        startDate: String(row.startDate || row.start_date || new Date().toISOString().split("T")[0]),
        endDate: String(row.endDate || row.end_date || new Date().toISOString().split("T")[0]),
      }),
    },
  },
  zeus: {
    modules: {
      table: zeusModulesTable,
      mapRow: (row) => ({
        name: String(row.name || "Untitled"),
        description: String(row.description || ""),
        version: String(row.version || "1.0.0"),
        status: String(row.status || "active"),
        category: String(row.category || "core"),
        uptime: String(row.uptime || "99.9"),
      }),
    },
    logs: {
      table: zeusLogsTable,
      mapRow: (row) => ({
        level: String(row.level || "info"),
        message: String(row.message || ""),
        module: String(row.module || "unknown"),
      }),
    },
  },
};

router.post("/import/:domain/:type", requireAuth, asyncHandler(async (req, res) => {
  const { domain, type } = req.params;
  const { data } = req.body;

  if (!data || !Array.isArray(data)) {
    throw AppError.badRequest("Missing or invalid data array");
  }

  const domainHandlers = importHandlers[domain];
  if (!domainHandlers) {
    throw AppError.badRequest(`Unknown import domain: ${domain}`);
  }

  const handler = domainHandlers[type];
  if (!handler) {
    throw AppError.badRequest(`Unknown import type: ${type} for domain ${domain}`);
  }

  if (!isDatabaseAvailable()) {
    throw AppError.serviceUnavailable("Database not available");
  }

  const errors: string[] = [];
  let successCount = 0;

  const BATCH_SIZE = 50;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const mappedBatch: any[] = [];

    for (let j = 0; j < batch.length; j++) {
      try {
        const mapped = handler.mapRow(batch[j]);
        mappedBatch.push(mapped);
      } catch (err: any) {
        errors.push(`Row ${i + j + 1}: ${err.message || "Mapping error"}`);
      }
    }

    if (mappedBatch.length > 0) {
      try {
        await db.insert(handler.table).values(mappedBatch);
        successCount += mappedBatch.length;
      } catch (err: any) {
        logger.error({ err, domain, type }, "Batch insert error");
        for (let j = 0; j < mappedBatch.length; j++) {
          try {
            await db.insert(handler.table).values(mappedBatch[j]);
            successCount++;
          } catch (innerErr: any) {
            errors.push(`Row ${i + j + 1}: ${innerErr.message || "Insert error"}`);
          }
        }
      }
    }
  }

  res.json({
    success: successCount,
    errors,
    total: data.length,
    domain,
    type,
  });
}));

router.post("/import/generic", requireAuth, asyncHandler(async (req, res) => {
  const { data, domain, type: importType } = req.body;

  if (!data || !Array.isArray(data)) {
    throw AppError.badRequest("Missing or invalid data array");
  }

  res.json({
    success: data.length,
    errors: [],
    total: data.length,
    domain: domain || "generic",
    type: importType || "generic",
    message: "Data received and validated (demo mode — no database table for this import type)",
  });
}));

export default router;
