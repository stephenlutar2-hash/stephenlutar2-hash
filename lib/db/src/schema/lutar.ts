import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lutarResearchItemsTable = pgTable("lutar_research_items", {
  id: serial("id").primaryKey(),
  entity: text("entity").notNull(),
  revenue: text("revenue").notNull(),
  margin: text("margin").notNull(),
  growth: text("growth").notNull(),
  risk: text("risk").notNull().default("Low"),
  valuation: text("valuation").notNull(),
  status: text("status").notNull().default("Performer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLutarResearchItemSchema = createInsertSchema(lutarResearchItemsTable).omit({ id: true, createdAt: true });
export type InsertLutarResearchItem = z.infer<typeof insertLutarResearchItemSchema>;
export type LutarResearchItem = typeof lutarResearchItemsTable.$inferSelect;

export const lutarSustainabilityMetricsTable = pgTable("lutar_sustainability_metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  unit: text("unit").notNull(),
  change: text("change").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLutarSustainabilityMetricSchema = createInsertSchema(lutarSustainabilityMetricsTable).omit({ id: true, createdAt: true });
export type InsertLutarSustainabilityMetric = z.infer<typeof insertLutarSustainabilityMetricSchema>;
export type LutarSustainabilityMetric = typeof lutarSustainabilityMetricsTable.$inferSelect;

export const lutarFinancialDataTable = pgTable("lutar_financial_data", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  revenue: numeric("revenue", { precision: 12, scale: 2 }).notNull(),
  expenses: numeric("expenses", { precision: 12, scale: 2 }).notNull(),
  profit: numeric("profit", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull().default("monthly"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLutarFinancialDataSchema = createInsertSchema(lutarFinancialDataTable).omit({ id: true, createdAt: true });
export type InsertLutarFinancialData = z.infer<typeof insertLutarFinancialDataSchema>;
export type LutarFinancialData = typeof lutarFinancialDataTable.$inferSelect;

export const lutarDivisionDataTable = pgTable("lutar_division_data", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  revenue: numeric("revenue", { precision: 12, scale: 2 }).notNull(),
  target: numeric("target", { precision: 12, scale: 2 }).notNull(),
  growth: integer("growth").notNull().default(0),
  allocation: integer("allocation").notNull().default(0),
  color: text("color").notNull().default("#3b82f6"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLutarDivisionDataSchema = createInsertSchema(lutarDivisionDataTable).omit({ id: true, createdAt: true });
export type InsertLutarDivisionData = z.infer<typeof insertLutarDivisionDataSchema>;
export type LutarDivisionData = typeof lutarDivisionDataTable.$inferSelect;

export const lutarInsightsTable = pgTable("lutar_insights", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLutarInsightSchema = createInsertSchema(lutarInsightsTable).omit({ id: true, createdAt: true });
export type InsertLutarInsight = z.infer<typeof insertLutarInsightSchema>;
export type LutarInsight = typeof lutarInsightsTable.$inferSelect;
