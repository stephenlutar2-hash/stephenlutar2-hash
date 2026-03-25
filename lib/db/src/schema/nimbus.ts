import { pgTable, text, serial, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nimbusPredictionsTable = pgTable("nimbus_predictions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 2 }).notNull(),
  category: text("category").notNull(),
  outcome: text("outcome").notNull(),
  timeframe: text("timeframe").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNimbusPredictionSchema = createInsertSchema(nimbusPredictionsTable).omit({ id: true, createdAt: true });
export type InsertNimbusPrediction = z.infer<typeof insertNimbusPredictionSchema>;
export type NimbusPrediction = typeof nimbusPredictionsTable.$inferSelect;

export const nimbusAlertsTable = pgTable("nimbus_alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull().default("medium"),
  category: text("category").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNimbusAlertSchema = createInsertSchema(nimbusAlertsTable).omit({ id: true, createdAt: true });
export type InsertNimbusAlert = z.infer<typeof insertNimbusAlertSchema>;
export type NimbusAlert = typeof nimbusAlertsTable.$inferSelect;
