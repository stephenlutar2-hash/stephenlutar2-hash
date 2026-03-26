import { pgTable, text, serial, numeric, integer, timestamp, boolean, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { relations } from "drizzle-orm";

export const vesselFleetsTable = pgTable("vessel_fleets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vesselPortsTable = pgTable("vessel_ports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  country: text("country").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  type: text("type").notNull().default("terminal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vesselsTable = pgTable("vessels", {
  id: serial("id").primaryKey(),
  vesselCode: text("vessel_code").notNull().unique(),
  name: text("name").notNull(),
  imo: text("imo").notNull(),
  flag: text("flag").notNull(),
  type: text("type").notNull(),
  dwt: integer("dwt").notNull(),
  cbm: integer("cbm").notNull(),
  built: integer("built").notNull(),
  class: text("class").notNull(),
  status: text("status").notNull().default("ballast"),
  speed: real("speed").notNull().default(0),
  lat: real("lat").notNull().default(0),
  lng: real("lng").notNull().default(0),
  route: text("route"),
  charterer: text("charterer"),
  tce: integer("tce").notNull().default(0),
  utilization: integer("utilization").notNull().default(0),
  cii: text("cii").notNull().default("B"),
  eexi: text("eexi").notNull().default("compliant"),
  fleetId: integer("fleet_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("vessels_vessel_code_idx").on(table.vesselCode),
  index("vessels_status_idx").on(table.status),
]);

export const vesselVoyagesTable = pgTable("vessel_voyages", {
  id: serial("id").primaryKey(),
  voyageCode: text("voyage_code").notNull().unique(),
  vesselId: integer("vessel_id").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  originLat: real("origin_lat"),
  originLng: real("origin_lng"),
  destLat: real("dest_lat"),
  destLng: real("dest_lng"),
  departureDate: text("departure_date"),
  arrivalDate: text("arrival_date"),
  eta: text("eta"),
  status: text("status").notNull().default("in-progress"),
  cargo: text("cargo"),
  cargoVolume: text("cargo_volume"),
  progress: integer("progress").notNull().default(0),
  riskScore: integer("risk_score").notNull().default(0),
  weatherRisk: integer("weather_risk").notNull().default(0),
  portCongestionRisk: integer("port_congestion_risk").notNull().default(0),
  geopoliticalRisk: integer("geopolitical_risk").notNull().default(0),
  piracyRisk: integer("piracy_risk").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("vessel_voyages_vessel_id_idx").on(table.vesselId),
  index("vessel_voyages_status_idx").on(table.status),
]);

export const vesselRoutesTable = pgTable("vessel_routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originPort: text("origin_port").notNull(),
  destPort: text("dest_port").notNull(),
  distanceNm: integer("distance_nm"),
  typicalDays: integer("typical_days"),
  waypoints: text("waypoints"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vesselEmissionsTable = pgTable("vessel_emissions", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").notNull(),
  voyageId: integer("voyage_id"),
  date: text("date").notNull(),
  co2Tons: real("co2_tons").notNull(),
  fuelConsumedTons: real("fuel_consumed_tons").notNull(),
  fuelType: text("fuel_type").notNull().default("VLSFO"),
  distanceNm: real("distance_nm"),
  ciiValue: real("cii_value"),
  eexiValue: real("eexi_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("vessel_emissions_vessel_id_idx").on(table.vesselId),
  index("vessel_emissions_date_idx").on(table.date),
]);

export const vesselAlertsTable = pgTable("vessel_alerts", {
  id: serial("id").primaryKey(),
  alertCode: text("alert_code").notNull().unique(),
  vesselId: integer("vessel_id"),
  pillar: text("pillar").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  acknowledged: boolean("acknowledged").notNull().default(false),
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: text("acknowledged_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("vessel_alerts_vessel_id_idx").on(table.vesselId),
  index("vessel_alerts_severity_idx").on(table.severity),
  index("vessel_alerts_acknowledged_idx").on(table.acknowledged),
]);

export const vesselMaintenanceEventsTable = pgTable("vessel_maintenance_events", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").notNull(),
  system: text("system").notNull(),
  type: text("type").notNull().default("scheduled"),
  description: text("description").notNull(),
  severity: text("severity").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  scheduledDate: text("scheduled_date"),
  completedDate: text("completed_date"),
  estimatedCost: integer("estimated_cost"),
  actualCost: integer("actual_cost"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("vessel_maint_vessel_id_idx").on(table.vesselId),
]);

export const vesselCertificatesTable = pgTable("vessel_certificates", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").notNull(),
  name: text("name").notNull(),
  issuedBy: text("issued_by"),
  issueDate: text("issue_date"),
  expiryDate: text("expiry_date").notNull(),
  status: text("status").notNull().default("valid"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("vessel_certs_vessel_id_idx").on(table.vesselId),
  index("vessel_certs_status_idx").on(table.status),
]);

export const vesselShipmentsTable = pgTable("vessel_shipments", {
  id: serial("id").primaryKey(),
  shipmentCode: text("shipment_code").notNull().unique(),
  vesselId: integer("vessel_id").notNull(),
  voyageId: integer("voyage_id"),
  cargo: text("cargo").notNull(),
  volume: text("volume").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  progress: integer("progress").notNull().default(0),
  eta: text("eta"),
  customer: text("customer"),
  slaStatus: text("sla_status").notNull().default("on-track"),
  demurrageRisk: integer("demurrage_risk").notNull().default(0),
  laytimeDays: real("laytime_days").notNull().default(0),
  laytimeAllowed: real("laytime_allowed").notNull().default(3),
  riskScore: integer("risk_score").notNull().default(0),
  riskFactors: text("risk_factors"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("vessel_shipments_vessel_id_idx").on(table.vesselId),
]);

export const vesselLogsTable = pgTable("vessel_logs", {
  id: serial("id").primaryKey(),
  logCode: text("log_code").notNull().unique(),
  vesselId: integer("vessel_id"),
  eventType: text("event_type").notNull(),
  severity: text("severity").notNull().default("info"),
  message: text("message").notNull(),
  vesselName: text("vessel_name"),
  voyageCode: text("voyage_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("vessel_logs_vessel_id_idx").on(table.vesselId),
  index("vessel_logs_event_type_idx").on(table.eventType),
  index("vessel_logs_severity_idx").on(table.severity),
]);

export const vesselFleetsRelations = relations(vesselFleetsTable, ({ many }) => ({
  vessels: many(vesselsTable),
}));

export const vesselsRelations = relations(vesselsTable, ({ one, many }) => ({
  fleet: one(vesselFleetsTable, { fields: [vesselsTable.fleetId], references: [vesselFleetsTable.id] }),
  voyages: many(vesselVoyagesTable),
  emissions: many(vesselEmissionsTable),
  alerts: many(vesselAlertsTable),
  maintenanceEvents: many(vesselMaintenanceEventsTable),
  certificates: many(vesselCertificatesTable),
  shipments: many(vesselShipmentsTable),
  logs: many(vesselLogsTable),
}));

export const vesselVoyagesRelations = relations(vesselVoyagesTable, ({ one }) => ({
  vessel: one(vesselsTable, { fields: [vesselVoyagesTable.vesselId], references: [vesselsTable.id] }),
}));

export const vesselEmissionsRelations = relations(vesselEmissionsTable, ({ one }) => ({
  vessel: one(vesselsTable, { fields: [vesselEmissionsTable.vesselId], references: [vesselsTable.id] }),
}));

export const vesselAlertsRelations = relations(vesselAlertsTable, ({ one }) => ({
  vessel: one(vesselsTable, { fields: [vesselAlertsTable.vesselId], references: [vesselsTable.id] }),
}));

export const vesselMaintenanceEventsRelations = relations(vesselMaintenanceEventsTable, ({ one }) => ({
  vessel: one(vesselsTable, { fields: [vesselMaintenanceEventsTable.vesselId], references: [vesselsTable.id] }),
}));

export const vesselCertificatesRelations = relations(vesselCertificatesTable, ({ one }) => ({
  vessel: one(vesselsTable, { fields: [vesselCertificatesTable.vesselId], references: [vesselsTable.id] }),
}));

export const vesselShipmentsRelations = relations(vesselShipmentsTable, ({ one }) => ({
  vessel: one(vesselsTable, { fields: [vesselShipmentsTable.vesselId], references: [vesselsTable.id] }),
}));

export const vesselLogsRelations = relations(vesselLogsTable, ({ one }) => ({
  vessel: one(vesselsTable, { fields: [vesselLogsTable.vesselId], references: [vesselsTable.id] }),
}));

export const insertVesselSchema = createInsertSchema(vesselsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVessel = z.infer<typeof insertVesselSchema>;
export type Vessel = typeof vesselsTable.$inferSelect;

export const insertVesselAlertSchema = createInsertSchema(vesselAlertsTable).omit({ id: true, createdAt: true });
export type InsertVesselAlert = z.infer<typeof insertVesselAlertSchema>;

export const insertVesselEmissionSchema = createInsertSchema(vesselEmissionsTable).omit({ id: true, createdAt: true });
export type InsertVesselEmission = z.infer<typeof insertVesselEmissionSchema>;

export const insertVesselMaintenanceSchema = createInsertSchema(vesselMaintenanceEventsTable).omit({ id: true, createdAt: true });
export type InsertVesselMaintenance = z.infer<typeof insertVesselMaintenanceSchema>;

export const insertVesselShipmentSchema = createInsertSchema(vesselShipmentsTable).omit({ id: true, createdAt: true });
export type InsertVesselShipment = z.infer<typeof insertVesselShipmentSchema>;

export const insertVesselLogSchema = createInsertSchema(vesselLogsTable).omit({ id: true, createdAt: true });
export type InsertVesselLog = z.infer<typeof insertVesselLogSchema>;
