import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const incaProjectsTable = pgTable("inca_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("research"),
  aiModel: text("ai_model").notNull(),
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIncaProjectSchema = createInsertSchema(incaProjectsTable).omit({ id: true, createdAt: true });
export type InsertIncaProject = z.infer<typeof insertIncaProjectSchema>;
export type IncaProject = typeof incaProjectsTable.$inferSelect;

export const incaExperimentsTable = pgTable("inca_experiments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  hypothesis: text("hypothesis").notNull(),
  result: text("result").notNull(),
  status: text("status").notNull().default("running"),
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIncaExperimentSchema = createInsertSchema(incaExperimentsTable).omit({ id: true, createdAt: true });
export type InsertIncaExperiment = z.infer<typeof insertIncaExperimentSchema>;
export type IncaExperiment = typeof incaExperimentsTable.$inferSelect;
