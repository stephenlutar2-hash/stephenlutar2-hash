import { db } from "@szl-holdings/db";
import {
  vesselsTable,
  vesselVoyagesTable,
  vesselEmissionsTable,
  vesselAlertsTable,
  vesselMaintenanceEventsTable,
  vesselCertificatesTable,
  vesselShipmentsTable,
  vesselLogsTable,
} from "@szl-holdings/db/schema";
import { eq, desc } from "drizzle-orm";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const vesselsTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_vessels",
      description: "List all vessels in the fleet with status, position, speed, CII rating, EEXI compliance, utilization, TCE, and charterer",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_voyages",
      description: "List all active voyages with vessel ID, origin, destination, ETA, cargo, progress, and risk scores",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_emissions",
      description: "List vessel emissions data including CO2 tons, fuel consumed, CII values, and EEXI values",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_alerts",
      description: "List all operational alerts with severity, pillar, vessel association, and acknowledgement status",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_maintenance",
      description: "List all maintenance events with vessel, system, type, severity, status, scheduled date, and cost estimates",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_certificates",
      description: "List all vessel certificates with expiry dates and status (valid, expiring-soon)",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_shipments",
      description: "List all cargo shipments with tracking, SLA status, demurrage risk, laytime, and risk factors",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_vessel_logs",
      description: "List operational log entries with event type, severity, vessel name, and message details",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_vessel_details",
      description: "Get detailed information for a specific vessel by ID, including voyages, emissions, and maintenance",
      parameters: {
        type: "object",
        properties: {
          vesselId: { type: "integer", description: "The vessel ID" },
        },
        required: ["vesselId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_fleet_compliance_report",
      description: "Generate a fleet-wide compliance report showing CII rating distribution, EEXI compliance status, certificate expiry warnings, and regulatory risk assessment",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_fleet_commercial_summary",
      description: "Generate a commercial performance summary showing fleet utilization, TCE distribution, shipment SLA performance, and demurrage risk exposure",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function vesselsExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "list_vessels": {
        const rows = await db.select().from(vesselsTable).orderBy(vesselsTable.name);
        return JSON.stringify(rows);
      }
      case "list_voyages": {
        const rows = await db.select().from(vesselVoyagesTable).orderBy(vesselVoyagesTable.createdAt);
        return JSON.stringify(rows);
      }
      case "list_emissions": {
        const rows = await db.select().from(vesselEmissionsTable).orderBy(vesselEmissionsTable.date);
        return JSON.stringify(rows);
      }
      case "list_alerts": {
        const rows = await db.select().from(vesselAlertsTable).orderBy(vesselAlertsTable.createdAt);
        return JSON.stringify(rows);
      }
      case "list_maintenance": {
        const rows = await db.select().from(vesselMaintenanceEventsTable).orderBy(vesselMaintenanceEventsTable.createdAt);
        return JSON.stringify(rows);
      }
      case "list_certificates": {
        const rows = await db.select().from(vesselCertificatesTable).orderBy(vesselCertificatesTable.expiryDate);
        return JSON.stringify(rows);
      }
      case "list_shipments": {
        const rows = await db.select().from(vesselShipmentsTable).orderBy(vesselShipmentsTable.createdAt);
        return JSON.stringify(rows);
      }
      case "list_vessel_logs": {
        const rows = await db.select().from(vesselLogsTable).orderBy(vesselLogsTable.createdAt);
        return JSON.stringify(rows);
      }
      case "get_vessel_details": {
        const [vessel] = await db.select().from(vesselsTable).where(eq(vesselsTable.id, args.vesselId)).limit(1);
        if (!vessel) return JSON.stringify({ error: "Vessel not found" });
        const [voyages, emissions, maintenance, certificates] = await Promise.all([
          db.select().from(vesselVoyagesTable).where(eq(vesselVoyagesTable.vesselId, args.vesselId)),
          db.select().from(vesselEmissionsTable).where(eq(vesselEmissionsTable.vesselId, args.vesselId)),
          db.select().from(vesselMaintenanceEventsTable).where(eq(vesselMaintenanceEventsTable.vesselId, args.vesselId)),
          db.select().from(vesselCertificatesTable).where(eq(vesselCertificatesTable.vesselId, args.vesselId)),
        ]);
        return JSON.stringify({ vessel, voyages, emissions, maintenance, certificates });
      }
      case "get_fleet_compliance_report": {
        const [vessels, certificates, emissions] = await Promise.all([
          db.select().from(vesselsTable),
          db.select().from(vesselCertificatesTable),
          db.select().from(vesselEmissionsTable),
        ]);
        const ciiDist: Record<string, number> = {};
        let eexiCompliant = 0;
        let eexiNonCompliant = 0;
        for (const v of vessels) {
          const cii = v.cii || "unknown";
          ciiDist[cii] = (ciiDist[cii] || 0) + 1;
          if (v.eexi === "compliant" || v.eexi === "yes") eexiCompliant++;
          else eexiNonCompliant++;
        }
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiringCerts = certificates.filter(c => c.expiryDate && new Date(c.expiryDate) <= thirtyDays);
        const totalCO2 = emissions.reduce((s, e) => s + Number(e.co2Tons || 0), 0);
        return JSON.stringify({
          fleetSize: vessels.length,
          ciiDistribution: ciiDist,
          eexiCompliance: { compliant: eexiCompliant, nonCompliant: eexiNonCompliant },
          certificateWarnings: expiringCerts.map(c => ({ vesselId: c.vesselId, name: c.name, expiryDate: c.expiryDate })),
          emissionsSummary: { totalCO2Tons: Math.round(totalCO2 * 100) / 100, recordCount: emissions.length },
        });
      }
      case "get_fleet_commercial_summary": {
        const [vessels, shipments] = await Promise.all([
          db.select().from(vesselsTable),
          db.select().from(vesselShipmentsTable),
        ]);
        const avgUtilization = vessels.length > 0
          ? Math.round(vessels.reduce((s, v) => s + Number(v.utilization || 0), 0) / vessels.length * 100) / 100
          : 0;
        const tceValues = vessels.map(v => Number(v.tce || 0)).filter(t => t > 0);
        const avgTCE = tceValues.length > 0 ? Math.round(tceValues.reduce((s, t) => s + t, 0) / tceValues.length) : 0;
        const slaBreaches = shipments.filter(s => s.slaStatus === "breached" || s.slaStatus === "at-risk");
        const demurrageRisk = shipments.filter(s => Number(s.demurrageRisk) >= 7);
        return JSON.stringify({
          fleetUtilization: { average: avgUtilization, byVessel: vessels.map(v => ({ name: v.name, utilization: v.utilization })) },
          tcePerformance: { average: avgTCE, count: tceValues.length },
          shipmentPerformance: {
            total: shipments.length,
            slaBreaches: slaBreaches.length,
            demurrageAtRisk: demurrageRisk.length,
            atRiskShipments: demurrageRisk.map(s => ({ code: s.shipmentCode, cargo: s.cargo, riskScore: s.demurrageRisk })),
          },
        });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message || "Tool execution failed" });
  }
}
