import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rosieThreatsTable = pgTable("rosie_threats", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  source: text("source").notNull(),
  target: text("target").notNull(),
  severity: text("severity").notNull().default("medium"),
  status: text("status").notNull().default("blocked"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRosieThreatSchema = createInsertSchema(rosieThreatsTable).omit({ id: true, createdAt: true });
export type InsertRosieThreat = z.infer<typeof insertRosieThreatSchema>;
export type RosieThreat = typeof rosieThreatsTable.$inferSelect;

export const rosieIncidentsTable = pgTable("rosie_incidents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  assignee: text("assignee").notNull().default("ROSIE AI"),
  platform: text("platform").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRosieIncidentSchema = createInsertSchema(rosieIncidentsTable).omit({ id: true, createdAt: true });
export type InsertRosieIncident = z.infer<typeof insertRosieIncidentSchema>;
export type RosieIncident = typeof rosieIncidentsTable.$inferSelect;

export const rosieScansTable = pgTable("rosie_scans", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  scanType: text("scan_type").notNull(),
  status: text("status").notNull().default("completed"),
  threatsFound: integer("threats_found").notNull().default(0),
  threatsBlocked: integer("threats_blocked").notNull().default(0),
  duration: integer("duration").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRosieScanSchema = createInsertSchema(rosieScansTable).omit({ id: true, createdAt: true });
export type InsertRosieScan = z.infer<typeof insertRosieScanSchema>;
export type RosieScan = typeof rosieScansTable.$inferSelect;
