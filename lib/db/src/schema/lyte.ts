import { pgTable, text, serial, numeric, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lyteServicesTable = pgTable("lyte_services", {
  id: serial("id").primaryKey(),
  serviceId: text("service_id").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull().default("app"),
  status: text("status").notNull().default("healthy"),
  uptime: numeric("uptime", { precision: 6, scale: 2 }).notNull().default("99.9"),
  latency: integer("latency").notNull().default(50),
  lastCheck: text("last_check").notNull().default("1m ago"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLyteServiceSchema = createInsertSchema(lyteServicesTable).omit({ id: true, createdAt: true });
export type InsertLyteService = z.infer<typeof insertLyteServiceSchema>;
export type LyteService = typeof lyteServicesTable.$inferSelect;

export const lyteSloTargetsTable = pgTable("lyte_slo_targets", {
  id: serial("id").primaryKey(),
  sloId: text("slo_id").notNull().unique(),
  service: text("service").notNull(),
  metric: text("metric").notNull(),
  target: numeric("target", { precision: 10, scale: 4 }).notNull(),
  current: numeric("current", { precision: 10, scale: 4 }).notNull(),
  unit: text("unit").notNull(),
  window: text("window").notNull().default("30d"),
  burnRate: numeric("burn_rate", { precision: 6, scale: 2 }).notNull().default("0"),
  budgetRemaining: integer("budget_remaining").notNull().default(100),
  budgetTotal: integer("budget_total").notNull().default(100),
  status: text("status").notNull().default("healthy"),
  impactIfBreached: text("impact_if_breached").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLyteSloTargetSchema = createInsertSchema(lyteSloTargetsTable).omit({ id: true, createdAt: true });
export type InsertLyteSloTarget = z.infer<typeof insertLyteSloTargetSchema>;
export type LyteSloTarget = typeof lyteSloTargetsTable.$inferSelect;

export const lyteCostItemsTable = pgTable("lyte_cost_items", {
  id: serial("id").primaryKey(),
  costId: text("cost_id").notNull().unique(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  estimatedCost: text("estimated_cost").notNull(),
  usage: text("usage").notNull(),
  trend: text("trend").notNull().default("stable"),
  efficiency: text("efficiency").notNull().default("optimal"),
  suggestion: text("suggestion").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLyteCostItemSchema = createInsertSchema(lyteCostItemsTable).omit({ id: true, createdAt: true });
export type InsertLyteCostItem = z.infer<typeof insertLyteCostItemSchema>;
export type LyteCostItem = typeof lyteCostItemsTable.$inferSelect;

export const lyteProbesTable = pgTable("lyte_probes", {
  id: serial("id").primaryKey(),
  probeId: text("probe_id").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull().default("http"),
  target: text("target").notNull(),
  status: text("status").notNull().default("passing"),
  lastCheck: text("last_check").notNull().default("30s ago"),
  responseTime: integer("response_time").notNull().default(100),
  successRate: numeric("success_rate", { precision: 5, scale: 1 }).notNull().default("100"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLyteProbeSchema = createInsertSchema(lyteProbesTable).omit({ id: true, createdAt: true });
export type InsertLyteProbe = z.infer<typeof insertLyteProbeSchema>;
export type LyteProbe = typeof lyteProbesTable.$inferSelect;

export const lyteAlertsTable = pgTable("lyte_alerts", {
  id: serial("id").primaryKey(),
  alertId: text("alert_id").notNull().unique(),
  title: text("title").notNull(),
  severity: text("severity").notNull().default("medium"),
  status: text("status").notNull().default("active"),
  startedAt: text("started_at").notNull(),
  duration: text("duration").notNull(),
  affectedServices: jsonb("affected_services").$type<string[]>().notNull().default([]),
  assignee: text("assignee").notNull(),
  updates: jsonb("updates").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLyteAlertSchema = createInsertSchema(lyteAlertsTable).omit({ id: true, createdAt: true });
export type InsertLyteAlert = z.infer<typeof insertLyteAlertSchema>;
export type LyteAlert = typeof lyteAlertsTable.$inferSelect;
