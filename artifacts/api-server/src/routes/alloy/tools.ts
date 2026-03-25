import { db } from "@workspace/db";
import {
  rosieThreatsTable, rosieIncidentsTable, rosieScansTable,
  insertRosieThreatSchema, insertRosieIncidentSchema, insertRosieScanSchema,
  beaconMetricsTable, beaconProjectsTable,
  insertBeaconMetricSchema, insertBeaconProjectSchema,
  nimbusPredictionsTable, nimbusAlertsTable,
  insertNimbusPredictionSchema, insertNimbusAlertSchema,
  zeusModulesTable, zeusLogsTable,
  insertZeusModuleSchema, insertZeusLogSchema,
  incaProjectsTable, incaExperimentsTable,
  insertIncaProjectSchema, insertIncaExperimentSchema,
  dreameraContentTable, dreameraCampaignsTable,
  insertDreameraContentSchema, insertDreameraCampaignSchema,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const alloyTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_rosie_threats",
      description: "List all security threats tracked by Rosie Security platform",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_rosie_threat",
      description: "Create a new security threat in Rosie",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", description: "Threat type (e.g. malware, phishing, ddos)" },
          source: { type: "string", description: "Source of the threat" },
          target: { type: "string", description: "Target system or asset" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          status: { type: "string", enum: ["blocked", "active", "resolved", "investigating"] },
          description: { type: "string", description: "Description of the threat" },
        },
        required: ["type", "source", "target", "severity", "status", "description"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_rosie_threat",
      description: "Update an existing security threat in Rosie",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          type: { type: "string" },
          source: { type: "string" },
          target: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          status: { type: "string", enum: ["blocked", "active", "resolved", "investigating"] },
          description: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_rosie_threat",
      description: "Delete a security threat from Rosie by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer", description: "Threat ID" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_rosie_incidents",
      description: "List all security incidents tracked by Rosie",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_rosie_incident",
      description: "Create a new security incident in Rosie",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          status: { type: "string", enum: ["open", "investigating", "resolved", "closed"] },
          assignee: { type: "string" },
          platform: { type: "string" },
          resolved: { type: "boolean" },
        },
        required: ["title", "description", "severity", "status", "assignee", "platform"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_rosie_incident",
      description: "Update an existing security incident in Rosie",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          status: { type: "string", enum: ["open", "investigating", "resolved", "closed"] },
          assignee: { type: "string" },
          platform: { type: "string" },
          resolved: { type: "boolean" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_rosie_incident",
      description: "Delete a security incident from Rosie by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_rosie_scans",
      description: "List all security scans performed by Rosie",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_rosie_scan",
      description: "Create a new security scan record in Rosie",
      parameters: {
        type: "object",
        properties: {
          platform: { type: "string" },
          scanType: { type: "string" },
          status: { type: "string" },
          threatsFound: { type: "integer" },
          threatsBlocked: { type: "integer" },
          duration: { type: "integer" },
        },
        required: ["platform", "scanType"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_rosie_scan",
      description: "Update an existing security scan in Rosie",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          platform: { type: "string" },
          scanType: { type: "string" },
          status: { type: "string" },
          threatsFound: { type: "integer" },
          threatsBlocked: { type: "integer" },
          duration: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_rosie_scan",
      description: "Delete a security scan from Rosie by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_beacon_metrics",
      description: "List all KPI metrics from Beacon decision dashboard",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_beacon_metric",
      description: "Create a new KPI metric in Beacon",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "number" },
          unit: { type: "string" },
          change: { type: "number" },
          category: { type: "string" },
        },
        required: ["name", "value", "unit", "change", "category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_beacon_metric",
      description: "Update an existing Beacon metric",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          value: { type: "number" },
          unit: { type: "string" },
          change: { type: "number" },
          category: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_beacon_metric",
      description: "Delete a Beacon metric by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_beacon_projects",
      description: "List all projects from Beacon",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_beacon_project",
      description: "Create a new project in Beacon",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["active", "building", "planning", "paused"] },
          progress: { type: "integer" },
          platform: { type: "string" },
        },
        required: ["name", "description", "status", "progress", "platform"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_beacon_project",
      description: "Update an existing Beacon project",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["active", "building", "planning", "paused"] },
          progress: { type: "integer" },
          platform: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_beacon_project",
      description: "Delete a Beacon project by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_nimbus_predictions",
      description: "List all AI predictions from Nimbus predictive platform",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_nimbus_prediction",
      description: "Create a new AI prediction in Nimbus",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          confidence: { type: "number" },
          category: { type: "string" },
          outcome: { type: "string" },
          timeframe: { type: "string" },
          status: { type: "string", enum: ["pending", "confirmed", "refuted"] },
        },
        required: ["title", "description", "confidence", "category", "outcome", "timeframe", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_nimbus_prediction",
      description: "Update an existing Nimbus prediction",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string" },
          confidence: { type: "number" },
          category: { type: "string" },
          outcome: { type: "string" },
          timeframe: { type: "string" },
          status: { type: "string", enum: ["pending", "confirmed", "refuted"] },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_nimbus_prediction",
      description: "Delete a Nimbus prediction by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_nimbus_alerts",
      description: "List all alerts from Nimbus",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_nimbus_alert",
      description: "Create a new alert in Nimbus",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          message: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          category: { type: "string" },
          isRead: { type: "boolean" },
        },
        required: ["title", "message", "severity", "category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_nimbus_alert",
      description: "Update an existing Nimbus alert",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          message: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          category: { type: "string" },
          isRead: { type: "boolean" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_nimbus_alert",
      description: "Delete a Nimbus alert by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_zeus_modules",
      description: "List all system modules from Zeus modular core",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_zeus_module",
      description: "Create a new system module in Zeus",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          version: { type: "string" },
          status: { type: "string", enum: ["active", "inactive", "error", "updating"] },
          category: { type: "string" },
          uptime: { type: "number" },
        },
        required: ["name", "description", "version", "status", "category", "uptime"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_zeus_module",
      description: "Update an existing Zeus module",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string" },
          version: { type: "string" },
          status: { type: "string", enum: ["active", "inactive", "error", "updating"] },
          category: { type: "string" },
          uptime: { type: "number" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_zeus_module",
      description: "Delete a Zeus module by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_zeus_logs",
      description: "List all system logs from Zeus",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_zeus_log",
      description: "Create a new system log entry in Zeus",
      parameters: {
        type: "object",
        properties: {
          level: { type: "string", enum: ["info", "warn", "error", "debug"] },
          message: { type: "string" },
          module: { type: "string" },
        },
        required: ["level", "message", "module"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_zeus_log",
      description: "Update a Zeus system log entry by ID",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          level: { type: "string", enum: ["info", "warn", "error", "debug"] },
          message: { type: "string" },
          module: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_zeus_log",
      description: "Delete a Zeus system log entry by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_inca_projects",
      description: "List all INCA AI innovation projects",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_inca_project",
      description: "Create a new INCA AI project",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["research", "development", "testing", "deployed", "archived"] },
          aiModel: { type: "string" },
          accuracy: { type: "number" },
        },
        required: ["name", "description", "status", "aiModel", "accuracy"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_inca_project",
      description: "Update an existing INCA AI project",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["research", "development", "testing", "deployed", "archived"] },
          aiModel: { type: "string" },
          accuracy: { type: "number" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_inca_project",
      description: "Delete an INCA AI project by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_inca_experiments",
      description: "List all INCA AI experiments",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_inca_experiment",
      description: "Create a new INCA AI experiment",
      parameters: {
        type: "object",
        properties: {
          projectId: { type: "integer" },
          name: { type: "string" },
          hypothesis: { type: "string" },
          result: { type: "string" },
          status: { type: "string", enum: ["running", "completed", "failed"] },
          accuracy: { type: "number" },
        },
        required: ["projectId", "name", "hypothesis", "result", "status", "accuracy"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_inca_experiment",
      description: "Update an existing INCA AI experiment",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          projectId: { type: "integer" },
          name: { type: "string" },
          hypothesis: { type: "string" },
          result: { type: "string" },
          status: { type: "string", enum: ["running", "completed", "failed"] },
          accuracy: { type: "number" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_inca_experiment",
      description: "Delete an INCA AI experiment by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_dreamera_content",
      description: "List all content from DreamEra media platform",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_dreamera_content",
      description: "Create new content in DreamEra",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          type: { type: "string", enum: ["article", "video", "podcast", "social", "campaign"] },
          status: { type: "string", enum: ["draft", "review", "published", "archived"] },
          views: { type: "integer" },
          engagement: { type: "number" },
        },
        required: ["title", "body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_dreamera_content",
      description: "Update existing DreamEra content",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          body: { type: "string" },
          type: { type: "string", enum: ["article", "video", "podcast", "social", "campaign"] },
          status: { type: "string", enum: ["draft", "review", "published", "archived"] },
          views: { type: "integer" },
          engagement: { type: "number" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_dreamera_content",
      description: "Delete DreamEra content by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_dreamera_campaigns",
      description: "List all campaigns from DreamEra",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_dreamera_campaign",
      description: "Create a new campaign in DreamEra",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["planning", "active", "paused", "completed"] },
          budget: { type: "number" },
          reach: { type: "integer" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["name", "description", "startDate", "endDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_dreamera_campaign",
      description: "Update an existing DreamEra campaign",
      parameters: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: ["planning", "active", "paused", "completed"] },
          budget: { type: "number" },
          reach: { type: "integer" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_dreamera_campaign",
      description: "Delete a DreamEra campaign by ID",
      parameters: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
  },
];

export async function executeTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "list_rosie_threats": {
        const rows = await db.select().from(rosieThreatsTable).orderBy(rosieThreatsTable.createdAt);
        return JSON.stringify(rows);
      }
      case "create_rosie_threat": {
        const parsed = insertRosieThreatSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(rosieThreatsTable).values(parsed.data).returning();
        return JSON.stringify(created);
      }
      case "update_rosie_threat": {
        const { id, ...data } = args;
        const [updated] = await db.update(rosieThreatsTable).set(data).where(eq(rosieThreatsTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify(updated);
      }
      case "delete_rosie_threat": {
        await db.delete(rosieThreatsTable).where(eq(rosieThreatsTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      case "list_rosie_incidents": {
        const rows = await db.select().from(rosieIncidentsTable).orderBy(rosieIncidentsTable.createdAt);
        return JSON.stringify(rows);
      }
      case "create_rosie_incident": {
        const parsed = insertRosieIncidentSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(rosieIncidentsTable).values(parsed.data).returning();
        return JSON.stringify(created);
      }
      case "update_rosie_incident": {
        const { id, ...data } = args;
        const [updated] = await db.update(rosieIncidentsTable).set(data).where(eq(rosieIncidentsTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify(updated);
      }
      case "delete_rosie_incident": {
        await db.delete(rosieIncidentsTable).where(eq(rosieIncidentsTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      case "list_rosie_scans": {
        const rows = await db.select().from(rosieScansTable).orderBy(rosieScansTable.createdAt);
        return JSON.stringify(rows);
      }
      case "create_rosie_scan": {
        const parsed = insertRosieScanSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(rosieScansTable).values(parsed.data).returning();
        return JSON.stringify(created);
      }
      case "update_rosie_scan": {
        const { id, ...data } = args;
        const [updated] = await db.update(rosieScansTable).set(data).where(eq(rosieScansTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify(updated);
      }
      case "delete_rosie_scan": {
        await db.delete(rosieScansTable).where(eq(rosieScansTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      case "list_beacon_metrics": {
        const rows = await db.select().from(beaconMetricsTable).orderBy(beaconMetricsTable.createdAt);
        return JSON.stringify(rows.map(m => ({ ...m, value: Number(m.value), change: Number(m.change) })));
      }
      case "create_beacon_metric": {
        const parsed = insertBeaconMetricSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(beaconMetricsTable).values(parsed.data).returning();
        return JSON.stringify({ ...created, value: Number(created.value), change: Number(created.change) });
      }
      case "update_beacon_metric": {
        const { id, ...data } = args;
        const [updated] = await db.update(beaconMetricsTable).set(data).where(eq(beaconMetricsTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify({ ...updated, value: Number(updated.value), change: Number(updated.change) });
      }
      case "delete_beacon_metric": {
        await db.delete(beaconMetricsTable).where(eq(beaconMetricsTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      case "list_beacon_projects": {
        const rows = await db.select().from(beaconProjectsTable).orderBy(beaconProjectsTable.createdAt);
        return JSON.stringify(rows);
      }
      case "create_beacon_project": {
        const parsed = insertBeaconProjectSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(beaconProjectsTable).values(parsed.data).returning();
        return JSON.stringify(created);
      }
      case "update_beacon_project": {
        const { id, ...data } = args;
        const [updated] = await db.update(beaconProjectsTable).set(data).where(eq(beaconProjectsTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify(updated);
      }
      case "delete_beacon_project": {
        await db.delete(beaconProjectsTable).where(eq(beaconProjectsTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      case "list_nimbus_predictions": {
        const rows = await db.select().from(nimbusPredictionsTable).orderBy(nimbusPredictionsTable.createdAt);
        return JSON.stringify(rows.map(p => ({ ...p, confidence: Number(p.confidence) })));
      }
      case "create_nimbus_prediction": {
        const parsed = insertNimbusPredictionSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(nimbusPredictionsTable).values(parsed.data).returning();
        return JSON.stringify({ ...created, confidence: Number(created.confidence) });
      }
      case "update_nimbus_prediction": {
        const { id, ...data } = args;
        const [updated] = await db.update(nimbusPredictionsTable).set(data).where(eq(nimbusPredictionsTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify({ ...updated, confidence: Number(updated.confidence) });
      }
      case "delete_nimbus_prediction": {
        await db.delete(nimbusPredictionsTable).where(eq(nimbusPredictionsTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      case "list_nimbus_alerts": {
        const rows = await db.select().from(nimbusAlertsTable).orderBy(nimbusAlertsTable.createdAt);
        return JSON.stringify(rows);
      }
      case "create_nimbus_alert": {
        const parsed = insertNimbusAlertSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(nimbusAlertsTable).values(parsed.data).returning();
        return JSON.stringify(created);
      }
      case "update_nimbus_alert": {
        const { id, ...data } = args;
        const [updated] = await db.update(nimbusAlertsTable).set(data).where(eq(nimbusAlertsTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify(updated);
      }
      case "delete_nimbus_alert": {
        await db.delete(nimbusAlertsTable).where(eq(nimbusAlertsTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      case "list_zeus_modules": {
        const rows = await db.select().from(zeusModulesTable).orderBy(zeusModulesTable.createdAt);
        return JSON.stringify(rows.map(m => ({ ...m, uptime: Number(m.uptime) })));
      }
      case "create_zeus_module": {
        const parsed = insertZeusModuleSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(zeusModulesTable).values(parsed.data).returning();
        return JSON.stringify({ ...created, uptime: Number(created.uptime) });
      }
      case "update_zeus_module": {
        const { id, ...data } = args;
        const [updated] = await db.update(zeusModulesTable).set(data).where(eq(zeusModulesTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify({ ...updated, uptime: Number(updated.uptime) });
      }
      case "delete_zeus_module": {
        await db.delete(zeusModulesTable).where(eq(zeusModulesTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      case "list_zeus_logs": {
        const rows = await db.select().from(zeusLogsTable).orderBy(zeusLogsTable.createdAt);
        return JSON.stringify(rows);
      }
      case "create_zeus_log": {
        const parsed = insertZeusLogSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(zeusLogsTable).values(parsed.data).returning();
        return JSON.stringify(created);
      }
      case "update_zeus_log": {
        const { id, ...data } = args;
        const [updated] = await db.update(zeusLogsTable).set(data).where(eq(zeusLogsTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify(updated);
      }
      case "delete_zeus_log": {
        await db.delete(zeusLogsTable).where(eq(zeusLogsTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      case "list_inca_projects": {
        const rows = await db.select().from(incaProjectsTable).orderBy(incaProjectsTable.createdAt);
        return JSON.stringify(rows.map(p => ({ ...p, accuracy: Number(p.accuracy) })));
      }
      case "create_inca_project": {
        const parsed = insertIncaProjectSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(incaProjectsTable).values(parsed.data).returning();
        return JSON.stringify({ ...created, accuracy: Number(created.accuracy) });
      }
      case "update_inca_project": {
        const { id, ...data } = args;
        const [updated] = await db.update(incaProjectsTable).set(data).where(eq(incaProjectsTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify({ ...updated, accuracy: Number(updated.accuracy) });
      }
      case "delete_inca_project": {
        await db.delete(incaProjectsTable).where(eq(incaProjectsTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      case "list_inca_experiments": {
        const rows = await db.select().from(incaExperimentsTable).orderBy(incaExperimentsTable.createdAt);
        return JSON.stringify(rows.map(e => ({ ...e, accuracy: Number(e.accuracy) })));
      }
      case "create_inca_experiment": {
        const parsed = insertIncaExperimentSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(incaExperimentsTable).values(parsed.data).returning();
        return JSON.stringify({ ...created, accuracy: Number(created.accuracy) });
      }
      case "update_inca_experiment": {
        const { id, ...data } = args;
        const [updated] = await db.update(incaExperimentsTable).set(data).where(eq(incaExperimentsTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify({ ...updated, accuracy: Number(updated.accuracy) });
      }
      case "delete_inca_experiment": {
        await db.delete(incaExperimentsTable).where(eq(incaExperimentsTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      case "list_dreamera_content": {
        const rows = await db.select().from(dreameraContentTable).orderBy(dreameraContentTable.createdAt);
        return JSON.stringify(rows.map(c => ({ ...c, engagement: Number(c.engagement) })));
      }
      case "create_dreamera_content": {
        const parsed = insertDreameraContentSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(dreameraContentTable).values(parsed.data).returning();
        return JSON.stringify({ ...created, engagement: Number(created.engagement) });
      }
      case "update_dreamera_content": {
        const { id, ...data } = args;
        const [updated] = await db.update(dreameraContentTable).set(data).where(eq(dreameraContentTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify({ ...updated, engagement: Number(updated.engagement) });
      }
      case "delete_dreamera_content": {
        await db.delete(dreameraContentTable).where(eq(dreameraContentTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      case "list_dreamera_campaigns": {
        const rows = await db.select().from(dreameraCampaignsTable).orderBy(dreameraCampaignsTable.createdAt);
        return JSON.stringify(rows.map(c => ({ ...c, budget: Number(c.budget) })));
      }
      case "create_dreamera_campaign": {
        const parsed = insertDreameraCampaignSchema.safeParse(args);
        if (!parsed.success) return JSON.stringify({ error: parsed.error.message });
        const [created] = await db.insert(dreameraCampaignsTable).values(parsed.data).returning();
        return JSON.stringify({ ...created, budget: Number(created.budget) });
      }
      case "update_dreamera_campaign": {
        const { id, ...data } = args;
        const [updated] = await db.update(dreameraCampaignsTable).set(data).where(eq(dreameraCampaignsTable.id, id)).returning();
        if (!updated) return JSON.stringify({ error: "Not found" });
        return JSON.stringify({ ...updated, budget: Number(updated.budget) });
      }
      case "delete_dreamera_campaign": {
        await db.delete(dreameraCampaignsTable).where(eq(dreameraCampaignsTable.id, args.id));
        return JSON.stringify({ success: true });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message || "Tool execution failed" });
  }
}
