import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alloyscapeModulesTable = pgTable("alloyscape_modules", {
  id: serial("id").primaryKey(),
  moduleId: text("module_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  version: text("version").notNull(),
  status: text("status").notNull().default("running"),
  uptime: text("uptime").notNull().default("99.9%"),
  lastHealthCheck: text("last_health_check").notNull().default("10s ago"),
  cpu: integer("cpu").notNull().default(0),
  memory: integer("memory").notNull().default(0),
  instances: integer("instances").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAlloyscapeModuleSchema = createInsertSchema(alloyscapeModulesTable).omit({ id: true, createdAt: true });
export type InsertAlloyscapeModule = z.infer<typeof insertAlloyscapeModuleSchema>;
export type AlloyscapeModule = typeof alloyscapeModulesTable.$inferSelect;

export const alloyscapeWorkflowsTable = pgTable("alloyscape_workflows", {
  id: serial("id").primaryKey(),
  workflowId: text("workflow_id").notNull().unique(),
  name: text("name").notNull(),
  status: text("status").notNull().default("queued"),
  pipeline: text("pipeline").notNull(),
  startedAt: text("started_at").notNull().default(""),
  duration: text("duration").notNull().default("—"),
  progress: integer("progress").notNull().default(0),
  triggeredBy: text("triggered_by").notNull().default("scheduler"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAlloyscapeWorkflowSchema = createInsertSchema(alloyscapeWorkflowsTable).omit({ id: true, createdAt: true });
export type InsertAlloyscapeWorkflow = z.infer<typeof insertAlloyscapeWorkflowSchema>;
export type AlloyscapeWorkflow = typeof alloyscapeWorkflowsTable.$inferSelect;

export const alloyscapeExecutionLogsTable = pgTable("alloyscape_execution_logs", {
  id: serial("id").primaryKey(),
  logId: text("log_id").notNull().unique(),
  timestamp: text("log_timestamp").notNull(),
  level: text("level").notNull().default("info"),
  service: text("service").notNull(),
  message: text("message").notNull(),
  traceId: text("trace_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAlloyscapeLogSchema = createInsertSchema(alloyscapeExecutionLogsTable).omit({ id: true, createdAt: true });
export type InsertAlloyscapeLog = z.infer<typeof insertAlloyscapeLogSchema>;
export type AlloyscapeLog = typeof alloyscapeExecutionLogsTable.$inferSelect;

export const alloyscapeConnectorsTable = pgTable("alloyscape_connectors", {
  id: serial("id").primaryKey(),
  connectorId: text("connector_id").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  source: text("source").notNull(),
  target: text("target").notNull(),
  status: text("status").notNull().default("active"),
  lastSync: text("last_sync").notNull().default("1m ago"),
  eventsProcessed: integer("events_processed").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAlloyscapeConnectorSchema = createInsertSchema(alloyscapeConnectorsTable).omit({ id: true, createdAt: true });
export type InsertAlloyscapeConnector = z.infer<typeof insertAlloyscapeConnectorSchema>;
export type AlloyscapeConnector = typeof alloyscapeConnectorsTable.$inferSelect;

export const alloyscapeServicesTable = pgTable("alloyscape_services", {
  id: serial("id").primaryKey(),
  serviceId: text("service_id").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("healthy"),
  responseTime: integer("response_time").notNull().default(0),
  uptime: numeric("uptime", { precision: 6, scale: 2 }).notNull().default("99.99"),
  lastIncident: text("last_incident").notNull().default("Never"),
  endpoint: text("endpoint").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAlloyscapeServiceSchema = createInsertSchema(alloyscapeServicesTable).omit({ id: true, createdAt: true });
export type InsertAlloyscapeService = z.infer<typeof insertAlloyscapeServiceSchema>;
export type AlloyscapeService = typeof alloyscapeServicesTable.$inferSelect;
