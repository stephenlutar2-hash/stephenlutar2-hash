import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const zeusModulesTable = pgTable("zeus_modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  version: text("version").notNull(),
  status: text("status").notNull().default("active"),
  category: text("category").notNull(),
  uptime: numeric("uptime", { precision: 5, scale: 2 }).notNull().default("99.9"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertZeusModuleSchema = createInsertSchema(zeusModulesTable).omit({ id: true, createdAt: true });
export type InsertZeusModule = z.infer<typeof insertZeusModuleSchema>;
export type ZeusModule = typeof zeusModulesTable.$inferSelect;

export const zeusLogsTable = pgTable("zeus_logs", {
  id: serial("id").primaryKey(),
  level: text("level").notNull().default("info"),
  message: text("message").notNull(),
  module: text("module").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertZeusLogSchema = createInsertSchema(zeusLogsTable).omit({ id: true, createdAt: true });
export type InsertZeusLog = z.infer<typeof insertZeusLogSchema>;
export type ZeusLog = typeof zeusLogsTable.$inferSelect;
