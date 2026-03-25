import { pgTable, text, serial, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const beaconMetricsTable = pgTable("beacon_metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: numeric("value", { precision: 20, scale: 4 }).notNull(),
  unit: text("unit").notNull(),
  change: numeric("change", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBeaconMetricSchema = createInsertSchema(beaconMetricsTable).omit({ id: true, createdAt: true });
export type InsertBeaconMetric = z.infer<typeof insertBeaconMetricSchema>;
export type BeaconMetric = typeof beaconMetricsTable.$inferSelect;

export const beaconProjectsTable = pgTable("beacon_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"),
  progress: integer("progress").notNull().default(0),
  platform: text("platform").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBeaconProjectSchema = createInsertSchema(beaconProjectsTable).omit({ id: true, createdAt: true });
export type InsertBeaconProject = z.infer<typeof insertBeaconProjectSchema>;
export type BeaconProject = typeof beaconProjectsTable.$inferSelect;
