import { pgTable, text, serial, integer, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aegisComplianceFrameworksTable = pgTable("aegis_compliance_frameworks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  score: integer("score").notNull().default(0),
  controls: integer("controls").notNull().default(0),
  passing: integer("passing").notNull().default(0),
  color: text("color").notNull().default("#10b981"),
  lastAudit: text("last_audit").notNull(),
  status: text("status").notNull().default("In Progress"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAegisComplianceFrameworkSchema = createInsertSchema(aegisComplianceFrameworksTable).omit({ id: true, createdAt: true });
export type InsertAegisComplianceFramework = z.infer<typeof insertAegisComplianceFrameworkSchema>;
export type AegisComplianceFramework = typeof aegisComplianceFrameworksTable.$inferSelect;

export const aegisVulnerabilitiesTable = pgTable("aegis_vulnerabilities", {
  id: serial("id").primaryKey(),
  vulnId: text("vuln_id").notNull(),
  cve: text("cve").notNull(),
  title: text("title").notNull(),
  cvss: real("cvss").notNull().default(0),
  severity: text("severity").notNull().default("medium"),
  asset: text("asset").notNull(),
  status: text("status").notNull().default("open"),
  discovered: text("discovered").notNull(),
  exploitable: boolean("exploitable").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAegisVulnerabilitySchema = createInsertSchema(aegisVulnerabilitiesTable).omit({ id: true, createdAt: true });
export type InsertAegisVulnerability = z.infer<typeof insertAegisVulnerabilitySchema>;
export type AegisVulnerability = typeof aegisVulnerabilitiesTable.$inferSelect;

export const aegisMitreTechniquesTable = pgTable("aegis_mitre_techniques", {
  id: serial("id").primaryKey(),
  techniqueId: text("technique_id").notNull(),
  name: text("name").notNull(),
  tactic: text("tactic").notNull(),
  coverage: integer("coverage").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAegisMitreTechniqueSchema = createInsertSchema(aegisMitreTechniquesTable).omit({ id: true, createdAt: true });
export type InsertAegisMitreTechnique = z.infer<typeof insertAegisMitreTechniqueSchema>;
export type AegisMitreTechnique = typeof aegisMitreTechniquesTable.$inferSelect;
