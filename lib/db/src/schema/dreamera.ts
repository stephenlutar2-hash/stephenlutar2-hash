import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dreameraContentTable = pgTable("dreamera_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull().default("article"),
  status: text("status").notNull().default("draft"),
  views: integer("views").notNull().default(0),
  engagement: numeric("engagement", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDreameraContentSchema = createInsertSchema(dreameraContentTable).omit({ id: true, createdAt: true });
export type InsertDreameraContent = z.infer<typeof insertDreameraContentSchema>;
export type DreameraContent = typeof dreameraContentTable.$inferSelect;

export const dreameraCampaignsTable = pgTable("dreamera_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("planning"),
  budget: numeric("budget", { precision: 12, scale: 2 }).notNull().default("0"),
  reach: integer("reach").notNull().default(0),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDreameraCampaignSchema = createInsertSchema(dreameraCampaignsTable).omit({ id: true, createdAt: true });
export type InsertDreameraCampaign = z.infer<typeof insertDreameraCampaignSchema>;
export type DreameraCampaign = typeof dreameraCampaignsTable.$inferSelect;
