import { pgTable, text, serial, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const carlotaJoInquiriesTable = pgTable("carlota_jo_inquiries", {
  id: serial("id").primaryKey(),
  inquiryCode: text("inquiry_code").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  service: text("service").notNull().default(""),
  budget: text("budget"),
  timeline: text("timeline"),
  message: text("message"),
  company: text("company"),
  datePreference: text("date_preference"),
  description: text("description"),
  type: text("type").notNull().default("general_inquiry"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("carlota_jo_inquiries_status_idx").on(table.status),
  index("carlota_jo_inquiries_type_idx").on(table.type),
  index("carlota_jo_inquiries_email_idx").on(table.email),
  index("carlota_jo_inquiries_created_at_idx").on(table.createdAt),
]);

export const carlotaJoEngagementsTable = pgTable("carlota_jo_engagements", {
  id: serial("id").primaryKey(),
  engagementCode: text("engagement_code").notNull().unique(),
  inquiryId: integer("inquiry_id"),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  company: text("company"),
  service: text("service").notNull(),
  status: text("status").notNull().default("active"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  budget: text("budget"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("carlota_jo_engagements_status_idx").on(table.status),
  index("carlota_jo_engagements_client_email_idx").on(table.clientEmail),
]);

export const insertCarlotaJoInquirySchema = createInsertSchema(carlotaJoInquiriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCarlotaJoInquiry = z.infer<typeof insertCarlotaJoInquirySchema>;
export type CarlotaJoInquiry = typeof carlotaJoInquiriesTable.$inferSelect;

export const insertCarlotaJoEngagementSchema = createInsertSchema(carlotaJoEngagementsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCarlotaJoEngagement = z.infer<typeof insertCarlotaJoEngagementSchema>;
export type CarlotaJoEngagement = typeof carlotaJoEngagementsTable.$inferSelect;
