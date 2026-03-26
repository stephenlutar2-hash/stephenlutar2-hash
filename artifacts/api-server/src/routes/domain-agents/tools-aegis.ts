import { db } from "@szl-holdings/db";
import { auditLogsTable, userRolesTable, featureFlagsTable } from "@szl-holdings/db/schema";
import { rosieThreatsTable, rosieIncidentsTable, rosieScansTable } from "@szl-holdings/db/schema";
import { desc } from "drizzle-orm";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const aegisTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_security_posture",
      description: "Get an overview of the current security posture including threat counts by severity, open incidents, and recent scan results",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_audit_logs",
      description: "List recent audit log entries showing user actions, resource access, and outcomes for compliance review",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "integer", description: "Number of recent entries to return (default 50)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_user_roles",
      description: "List all user role assignments for access control review and privilege analysis",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_feature_flags",
      description: "List all feature flags with their enabled/disabled status for configuration governance",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_compliance_summary",
      description: "Generate a compliance summary including role distribution, audit activity volume, feature flag governance status, and security incident metrics",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function aegisExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "get_security_posture": {
        const [threats, incidents, scans] = await Promise.all([
          db.select().from(rosieThreatsTable),
          db.select().from(rosieIncidentsTable),
          db.select().from(rosieScansTable).orderBy(desc(rosieScansTable.createdAt)).limit(10),
        ]);
        const threatsBySeverity: Record<string, number> = {};
        for (const t of threats) {
          threatsBySeverity[t.severity] = (threatsBySeverity[t.severity] || 0) + 1;
        }
        const openIncidents = incidents.filter(i => !i.resolved);
        const resolvedIncidents = incidents.filter(i => i.resolved);
        return JSON.stringify({
          totalThreats: threats.length,
          threatsBySeverity,
          openIncidents: openIncidents.length,
          resolvedIncidents: resolvedIncidents.length,
          totalIncidents: incidents.length,
          recentScans: scans.map(s => ({
            platform: s.platform,
            scanType: s.scanType,
            status: s.status,
            threatsFound: s.threatsFound,
            threatsBlocked: s.threatsBlocked,
            createdAt: s.createdAt,
          })),
        });
      }
      case "list_audit_logs": {
        const limit = args.limit || 50;
        const rows = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(limit);
        return JSON.stringify(rows);
      }
      case "list_user_roles": {
        const rows = await db.select().from(userRolesTable).orderBy(userRolesTable.username);
        return JSON.stringify(rows);
      }
      case "list_feature_flags": {
        const rows = await db.select().from(featureFlagsTable).orderBy(featureFlagsTable.key);
        return JSON.stringify(rows);
      }
      case "get_compliance_summary": {
        const [roles, flags, logs, incidents] = await Promise.all([
          db.select().from(userRolesTable),
          db.select().from(featureFlagsTable),
          db.select().from(auditLogsTable),
          db.select().from(rosieIncidentsTable),
        ]);
        const roleDistribution: Record<string, number> = {};
        for (const r of roles) {
          roleDistribution[r.role] = (roleDistribution[r.role] || 0) + 1;
        }
        const enabledFlags = flags.filter(f => f.enabled).length;
        const disabledFlags = flags.filter(f => !f.enabled).length;
        const unresolvedIncidents = incidents.filter(i => !i.resolved);
        const criticalUnresolved = unresolvedIncidents.filter(i => i.severity === "critical");
        return JSON.stringify({
          roleDistribution,
          totalUsers: roles.length,
          featureFlags: { total: flags.length, enabled: enabledFlags, disabled: disabledFlags },
          auditActivity: { totalLogs: logs.length },
          securityIncidents: {
            total: incidents.length,
            unresolved: unresolvedIncidents.length,
            criticalUnresolved: criticalUnresolved.length,
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
