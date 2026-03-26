import { db } from "@szl-holdings/db";
import { nimbusPredictionsTable, nimbusAlertsTable } from "@szl-holdings/db/schema";
import { eq, desc } from "drizzle-orm";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const nimbusTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_predictions",
      description: "List all predictions with title, confidence score, category, outcome, timeframe, and status for trend analysis",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_alerts",
      description: "List all Nimbus alerts with title, message, severity, category, and read status",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_predictions_by_category",
      description: "Get predictions filtered by category to analyze trends in a specific domain area",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "The prediction category to filter by" },
        },
        required: ["category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_unread_alerts",
      description: "Get all unread alerts that require attention, sorted by most recent first",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_prediction_intelligence",
      description: "Generate a predictive intelligence briefing showing confidence distribution, category trends, alert severity breakdown, and emerging patterns that need attention",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function nimbusExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "list_predictions": {
        const rows = await db.select().from(nimbusPredictionsTable).orderBy(desc(nimbusPredictionsTable.createdAt));
        return JSON.stringify(rows.map(p => ({ ...p, confidence: Number(p.confidence) })));
      }
      case "list_alerts": {
        const rows = await db.select().from(nimbusAlertsTable).orderBy(desc(nimbusAlertsTable.createdAt));
        return JSON.stringify(rows);
      }
      case "get_predictions_by_category": {
        const rows = await db.select().from(nimbusPredictionsTable)
          .where(eq(nimbusPredictionsTable.category, args.category))
          .orderBy(desc(nimbusPredictionsTable.createdAt));
        return JSON.stringify(rows.map(p => ({ ...p, confidence: Number(p.confidence) })));
      }
      case "get_unread_alerts": {
        const rows = await db.select().from(nimbusAlertsTable)
          .where(eq(nimbusAlertsTable.isRead, false))
          .orderBy(desc(nimbusAlertsTable.createdAt));
        return JSON.stringify(rows);
      }
      case "get_prediction_intelligence": {
        const [predictions, alerts] = await Promise.all([
          db.select().from(nimbusPredictionsTable),
          db.select().from(nimbusAlertsTable),
        ]);
        const confidenceBuckets = { high: 0, medium: 0, low: 0 };
        const categoryTrends: Record<string, { count: number; avgConfidence: number; totalConf: number }> = {};
        for (const p of predictions) {
          const conf = Number(p.confidence);
          if (conf >= 80) confidenceBuckets.high++;
          else if (conf >= 50) confidenceBuckets.medium++;
          else confidenceBuckets.low++;
          if (!categoryTrends[p.category]) categoryTrends[p.category] = { count: 0, avgConfidence: 0, totalConf: 0 };
          categoryTrends[p.category].count++;
          categoryTrends[p.category].totalConf += conf;
        }
        for (const cat of Object.values(categoryTrends)) {
          cat.avgConfidence = Math.round(cat.totalConf / cat.count);
        }
        const alertsBySeverity: Record<string, number> = {};
        const unreadAlerts = alerts.filter(a => !a.isRead);
        for (const a of alerts) {
          alertsBySeverity[a.severity] = (alertsBySeverity[a.severity] || 0) + 1;
        }
        return JSON.stringify({
          totalPredictions: predictions.length,
          confidenceDistribution: confidenceBuckets,
          categoryTrends: Object.entries(categoryTrends).map(([cat, data]) => ({
            category: cat,
            count: data.count,
            avgConfidence: data.avgConfidence,
          })),
          alertSummary: {
            total: alerts.length,
            unread: unreadAlerts.length,
            bySeverity: alertsBySeverity,
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
