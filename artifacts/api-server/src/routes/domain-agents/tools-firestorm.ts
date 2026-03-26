import { db } from "@szl-holdings/db";
import { rosieThreatsTable, rosieIncidentsTable, rosieScansTable } from "@szl-holdings/db/schema";
import { desc, eq } from "drizzle-orm";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const firestormTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_active_incidents",
      description: "List all active (unresolved) security incidents with severity, status, assignee, and description for incident response triage",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_threat_landscape",
      description: "List all detected threats with type, source, target, severity, and status to understand the current threat landscape",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_scan_results",
      description: "Get recent security scan results showing platform coverage, threats found vs blocked, and scan status",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "integer", description: "Number of recent scans to return (default 20)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_incident_details",
      description: "Get detailed information about a specific incident by ID, including related threats and recent scans for the affected platform",
      parameters: {
        type: "object",
        properties: {
          incidentId: { type: "integer", description: "The incident ID to look up" },
        },
        required: ["incidentId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_attack_surface_summary",
      description: "Generate an attack surface summary showing threats by type, affected targets, detection rates from scans, and incident response metrics",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function firestormExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "list_active_incidents": {
        const rows = await db.select().from(rosieIncidentsTable).orderBy(desc(rosieIncidentsTable.createdAt));
        const active = rows.filter(i => !i.resolved);
        return JSON.stringify(active);
      }
      case "list_threat_landscape": {
        const rows = await db.select().from(rosieThreatsTable).orderBy(desc(rosieThreatsTable.createdAt));
        return JSON.stringify(rows);
      }
      case "get_scan_results": {
        const limit = args.limit || 20;
        const rows = await db.select().from(rosieScansTable).orderBy(desc(rosieScansTable.createdAt)).limit(limit);
        return JSON.stringify(rows);
      }
      case "get_incident_details": {
        const [incident] = await db.select().from(rosieIncidentsTable)
          .where(eq(rosieIncidentsTable.id, args.incidentId)).limit(1);
        if (!incident) return JSON.stringify({ error: "Incident not found" });
        const relatedThreats = await db.select().from(rosieThreatsTable)
          .where(eq(rosieThreatsTable.severity, incident.severity));
        const platformScans = incident.platform
          ? await db.select().from(rosieScansTable)
              .where(eq(rosieScansTable.platform, incident.platform))
              .orderBy(desc(rosieScansTable.createdAt)).limit(5)
          : [];
        return JSON.stringify({ incident, relatedThreats, platformScans });
      }
      case "get_attack_surface_summary": {
        const [threats, incidents, scans] = await Promise.all([
          db.select().from(rosieThreatsTable),
          db.select().from(rosieIncidentsTable),
          db.select().from(rosieScansTable),
        ]);
        const threatsByType: Record<string, number> = {};
        const targetSet = new Set<string>();
        for (const t of threats) {
          threatsByType[t.type] = (threatsByType[t.type] || 0) + 1;
          if (t.target) targetSet.add(t.target);
        }
        const totalThreatsFound = scans.reduce((s, sc) => s + (sc.threatsFound || 0), 0);
        const totalThreatsBlocked = scans.reduce((s, sc) => s + (sc.threatsBlocked || 0), 0);
        const detectionRate = totalThreatsFound > 0 ? Math.round((totalThreatsBlocked / totalThreatsFound) * 100) : 0;
        const resolvedCount = incidents.filter(i => i.resolved).length;
        return JSON.stringify({
          threatsByType,
          uniqueTargets: Array.from(targetSet),
          totalThreats: threats.length,
          scanCoverage: {
            totalScans: scans.length,
            threatsFound: totalThreatsFound,
            threatsBlocked: totalThreatsBlocked,
            detectionRate: \`\${detectionRate}