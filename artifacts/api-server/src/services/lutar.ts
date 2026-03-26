import { db } from "@szl-holdings/db";
import {
  lutarResearchItemsTable, lutarSustainabilityMetricsTable,
  lutarFinancialDataTable, lutarDivisionDataTable, lutarInsightsTable
} from "@szl-holdings/db/schema";
import { eq, desc } from "drizzle-orm";

export const lutarService = {
  async listResearchItems() {
    return db.select().from(lutarResearchItemsTable).orderBy(desc(lutarResearchItemsTable.createdAt));
  },

  async listSustainabilityMetrics() {
    return db.select().from(lutarSustainabilityMetricsTable).orderBy(lutarSustainabilityMetricsTable.name);
  },

  async listFinancialData() {
    return db.select().from(lutarFinancialDataTable).orderBy(lutarFinancialDataTable.id);
  },

  async listDivisionData() {
    return db.select().from(lutarDivisionDataTable).orderBy(lutarDivisionDataTable.name);
  },

  async listInsights() {
    return db.select().from(lutarInsightsTable).orderBy(desc(lutarInsightsTable.createdAt));
  },

  async getDashboardSummary() {
    const research = await db.select().from(lutarResearchItemsTable);
    const financial = await db.select().from(lutarFinancialDataTable);
    const divisions = await db.select().from(lutarDivisionDataTable);
    const insights = await db.select().from(lutarInsightsTable);

    return {
      totalEntities: research.length,
      monthlyDataPoints: financial.length,
      divisionCount: divisions.length,
      totalInsights: insights.length,
      research,
      financial,
      divisions,
      insights,
    };
  },
};
