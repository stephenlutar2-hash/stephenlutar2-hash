import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dreamscapeWorldsTable = pgTable("dreamscape_worlds", {
  id: serial("id").primaryKey(),
  worldId: text("world_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail").notNull().default(""),
  color: text("color").notNull().default("from-cyan-500 to-blue-600"),
  projectCount: integer("project_count").notNull().default(0),
  artifactCount: integer("artifact_count").notNull().default(0),
  tags: text("tags").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDreamscapeWorldSchema = createInsertSchema(dreamscapeWorldsTable).omit({ id: true, createdAt: true });
export type InsertDreamscapeWorld = z.infer<typeof insertDreamscapeWorldSchema>;
export type DreamscapeWorld = typeof dreamscapeWorldsTable.$inferSelect;

export const dreamscapeProjectsTable = pgTable("dreamscape_projects", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull().unique(),
  worldId: text("world_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"),
  artifactCount: integer("artifact_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDreamscapeProjectSchema = createInsertSchema(dreamscapeProjectsTable).omit({ id: true, createdAt: true });
export type InsertDreamscapeProject = z.infer<typeof insertDreamscapeProjectSchema>;
export type DreamscapeProject = typeof dreamscapeProjectsTable.$inferSelect;

export const dreamscapeArtifactsTable = pgTable("dreamscape_artifacts", {
  id: serial("id").primaryKey(),
  artifactId: text("artifact_id").notNull().unique(),
  projectId: text("project_id").notNull(),
  worldId: text("world_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("image"),
  thumbnail: text("thumbnail").notNull().default(""),
  prompt: text("prompt").notNull().default(""),
  tags: text("tags").notNull().default("[]"),
  resolution: text("resolution"),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDreamscapeArtifactSchema = createInsertSchema(dreamscapeArtifactsTable).omit({ id: true, createdAt: true });
export type InsertDreamscapeArtifact = z.infer<typeof insertDreamscapeArtifactSchema>;
export type DreamscapeArtifact = typeof dreamscapeArtifactsTable.$inferSelect;

export const dreamscapeGenerationHistoryTable = pgTable("dreamscape_generation_history", {
  id: serial("id").primaryKey(),
  genId: text("gen_id").notNull().unique(),
  prompt: text("prompt").notNull(),
  type: text("type").notNull().default("image"),
  status: text("status").notNull().default("processing"),
  result: text("result"),
  artifactId: text("artifact_id"),
  worldName: text("world_name").notNull(),
  projectName: text("project_name").notNull(),
  duration: integer("duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDreamscapeGenerationSchema = createInsertSchema(dreamscapeGenerationHistoryTable).omit({ id: true, createdAt: true });
export type InsertDreamscapeGeneration = z.infer<typeof insertDreamscapeGenerationSchema>;
export type DreamscapeGeneration = typeof dreamscapeGenerationHistoryTable.$inferSelect;

export const dreamscapePipelineItemsTable = pgTable("dreamscape_pipeline_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  stage: text("stage").notNull().default("concept"),
  description: text("description").notNull(),
  prompts: integer("prompts").notNull().default(0),
  variations: integer("variations").notNull().default(0),
  selectedFinal: integer("selected_final").notNull().default(0),
  quality: integer("quality").notNull().default(0),
  timeToComplete: text("time_to_complete").notNull().default("Not started"),
  tags: text("tags").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDreamscapePipelineItemSchema = createInsertSchema(dreamscapePipelineItemsTable).omit({ id: true, createdAt: true });
export type InsertDreamscapePipelineItem = z.infer<typeof insertDreamscapePipelineItemSchema>;
export type DreamscapePipelineItem = typeof dreamscapePipelineItemsTable.$inferSelect;
