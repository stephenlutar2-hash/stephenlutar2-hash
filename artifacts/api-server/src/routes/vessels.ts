import { Router } from "express";

const router = Router();

const VESSELS = [
  { id: "VLGC-001", name: "Corvette", imo: "9823401", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2019, class: "DNV GL", status: "laden", speed: 16.2, lat: 26.12, lng: 56.34, route: "AG-Japan", charterer: "Itochu", tce: 62500, utilization: 94, cii: "B", eexi: "compliant" },
  { id: "VLGC-002", name: "Concorde", imo: "9823402", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2020, class: "Lloyd's", status: "laden", speed: 15.8, lat: 12.45, lng: 72.18, route: "AG-India", charterer: "BPCL", tce: 58200, utilization: 91, cii: "A", eexi: "compliant" },
  { id: "VLGC-003", name: "Captain Markos", imo: "9823403", flag: "Bahamas", type: "VLGC", dwt: 82500, cbm: 80000, built: 2015, class: "DNV GL", status: "ballast", speed: 14.5, lat: 33.21, lng: 132.45, route: "Japan-AG", charterer: null, tce: 41200, utilization: 82, cii: "C", eexi: "compliant" },
  { id: "VLGC-004", name: "Corsair", imo: "9823404", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2021, class: "Bureau Veritas", status: "laden", speed: 16.5, lat: 5.88, lng: 105.32, route: "AG-South Korea", charterer: "SK Gas", tce: 67800, utilization: 96, cii: "A", eexi: "compliant" },
  { id: "VLGC-005", name: "Cougar", imo: "9823405", flag: "Bahamas", type: "VLGC", dwt: 82500, cbm: 80000, built: 2016, class: "Lloyd's", status: "at-port", speed: 0, lat: 26.19, lng: 50.55, route: "AG-Loading", charterer: "Aramco Trading", tce: 55400, utilization: 88, cii: "B", eexi: "compliant" },
  { id: "VLGC-006", name: "Commodore", imo: "9823406", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2022, class: "DNV GL", status: "laden", speed: 15.2, lat: 29.38, lng: -88.72, route: "USG-Europe", charterer: "Vitol", tce: 71200, utilization: 97, cii: "A", eexi: "compliant" },
  { id: "VLGC-007", name: "Continental", imo: "9823407", flag: "Bahamas", type: "VLGC", dwt: 82500, cbm: 80000, built: 2017, class: "Bureau Veritas", status: "ballast", speed: 13.8, lat: 48.22, lng: -5.34, route: "Europe-USG", charterer: null, tce: 38900, utilization: 79, cii: "B", eexi: "compliant" },
  { id: "VLGC-008", name: "Cresida", imo: "9823408", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2023, class: "Lloyd's", status: "laden", speed: 16.8, lat: -1.25, lng: 44.67, route: "AG-China", charterer: "Sinopec", tce: 64100, utilization: 93, cii: "A", eexi: "compliant" },
  { id: "VLGC-009", name: "Clermont", imo: "9823409", flag: "Bahamas", type: "VLGC", dwt: 82500, cbm: 80000, built: 2014, class: "DNV GL", status: "drydock", speed: 0, lat: 1.26, lng: 103.82, route: "Drydock-Singapore", charterer: null, tce: 0, utilization: 0, cii: "D", eexi: "non-compliant" },
  { id: "VLGC-010", name: "Constellation", imo: "9823410", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2020, class: "Bureau Veritas", status: "laden", speed: 15.5, lat: 22.31, lng: 114.17, route: "AG-Japan", charterer: "Marubeni", tce: 59800, utilization: 90, cii: "B", eexi: "compliant" },
  { id: "VLGC-011", name: "Challenger", imo: "9823411", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2021, class: "Lloyd's", status: "ballast", speed: 14.2, lat: 11.58, lng: 43.15, route: "India-AG", charterer: null, tce: 43500, utilization: 85, cii: "B", eexi: "compliant" },
  { id: "VLGC-012", name: "Champion", imo: "9823412", flag: "Bahamas", type: "VLGC", dwt: 82500, cbm: 80000, built: 2018, class: "DNV GL", status: "at-port", speed: 0, lat: 29.37, lng: -94.87, route: "USG-Loading", charterer: "Enterprise Products", tce: 52700, utilization: 86, cii: "C", eexi: "compliant" },
  { id: "VLGC-013", name: "Crusader", imo: "9823413", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2024, class: "DNV GL", status: "laden", speed: 17.1, lat: 35.44, lng: 139.64, route: "AG-Japan", charterer: "JERA", tce: 73400, utilization: 98, cii: "A", eexi: "compliant" },
];

type Vessel = typeof VESSELS[number];

interface VesselDataAdapter {
  getVessels(): Vessel[];
  getVesselById(id: string): Vessel | undefined;
}

class MockVesselAdapter implements VesselDataAdapter {
  getVessels() { return VESSELS; }
  getVesselById(id: string) { return VESSELS.find(v => v.id === id); }
}

const adapter: VesselDataAdapter = new MockVesselAdapter();

function generateTceHistory(baseTce: number) {
  const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  return months.map((m, i) => ({
    month: m,
    tce: Math.round(baseTce + (Math.random() - 0.4) * 15000 + i * 800),
  }));
}

function generateSpeedConsumption() {
  return [
    { speed: 12.0, consumption: 38 },
    { speed: 13.0, consumption: 44 },
    { speed: 14.0, consumption: 52 },
    { speed: 14.5, consumption: 57 },
    { speed: 15.0, consumption: 63 },
    { speed: 15.5, consumption: 70 },
    { speed: 16.0, consumption: 78 },
    { speed: 16.5, consumption: 87 },
    { speed: 17.0, consumption: 97 },
    { speed: 17.5, consumption: 108 },
  ];
}

function generateVoyagePnl(tce: number) {
  const revenue = Math.round(tce * 35 * 1.1);
  const bunker = Math.round(revenue * 0.35);
  const port = Math.round(revenue * 0.08);
  const canal = Math.round(revenue * 0.05);
  const insurance = Math.round(revenue * 0.03);
  const opex = Math.round(revenue * 0.15);
  const netProfit = revenue - bunker - port - canal - insurance - opex;
  return { revenue, bunkerCost: bunker, portCharges: port, canalFees: canal, insurance, opex, netProfit };
}

router.get("/vessels/command-center", (_req, res) => {
  const active = adapter.getVessels().filter(v => v.status !== "drydock");
  const avgTce = Math.round(active.filter(v => v.tce > 0).reduce((s, v) => s + v.tce, 0) / active.filter(v => v.tce > 0).length);
  const fleetUtil = Math.round(active.reduce((s, v) => s + v.utilization, 0) / active.length);

  const pillars = [
    { id: "apm", name: "Fleet APM", status: "healthy", score: 94, metric: `$${(avgTce / 1000).toFixed(1)}k avg TCE`, trend: [88, 90, 87, 92, 91, 94], worst: "Captain Markos — $41.2k TCE", alerts: 1 },
    { id: "infrastructure", name: "Infrastructure", status: "warning", score: 82, metric: "82% fleet health", trend: [90, 88, 85, 83, 84, 82], worst: "Clermont — Drydock", alerts: 3 },
    { id: "logs", name: "Logs", status: "healthy", score: 97, metric: "1,247 events / 24h", trend: [95, 94, 96, 97, 96, 97], worst: null, alerts: 0 },
    { id: "experience", name: "Digital Experience", status: "healthy", score: 91, metric: "91% SLA adherence", trend: [85, 87, 88, 90, 89, 91], worst: "Voyage V-2024-089 — laytime exceeded", alerts: 2 },
    { id: "synthetics", name: "Synthetics", status: "critical", score: 71, metric: "3 certs expiring", trend: [92, 88, 85, 80, 75, 71], worst: "Clermont — CII rating D", alerts: 5 },
    { id: "intelligence", name: "Applied Intelligence", status: "healthy", score: 89, metric: "4 anomalies detected", trend: [82, 84, 86, 87, 88, 89], worst: "Captain Markos — fuel anomaly", alerts: 2 },
  ];

  const kpiRibbon = [
    { label: "Fleet Utilization", value: `${fleetUtil}%`, change: "+2.1%", direction: "up" },
    { label: "Avg TCE", value: `$${(avgTce / 1000).toFixed(1)}k`, change: "+$3.2k", direction: "up" },
    { label: "Total Emissions", value: "12,450 MT", change: "-4.2%", direction: "down" },
    { label: "Compliance Score", value: "92%", change: "-1%", direction: "down" },
    { label: "Active Alerts", value: "13", change: "+3", direction: "up" },
    { label: "Vessels Trading", value: `${VESSELS.filter(v => v.status === "laden" || v.status === "ballast").length}/${VESSELS.length}`, change: "0", direction: "flat" },
  ];

  const alertFeed = [
    { id: "CMD-A1", pillar: "synthetics", severity: "critical", title: "Clermont CII rating D — operational restrictions imminent", timestamp: "2026-03-25T08:45:00Z", vessel: "Clermont" },
    { id: "CMD-A2", pillar: "infrastructure", severity: "critical", title: "Captain Markos — engine bearing temperature anomaly detected", timestamp: "2026-03-25T07:30:00Z", vessel: "Captain Markos" },
    { id: "CMD-A3", pillar: "synthetics", severity: "high", title: "3 vessel certificates expiring within 30 days", timestamp: "2026-03-25T06:15:00Z", vessel: null },
    { id: "CMD-A4", pillar: "intelligence", severity: "high", title: "Fuel consumption anomaly — Captain Markos +12% above baseline", timestamp: "2026-03-25T05:00:00Z", vessel: "Captain Markos" },
    { id: "CMD-A5", pillar: "experience", severity: "medium", title: "Demurrage exposure $145k on Voyage V-2024-089", timestamp: "2026-03-25T04:20:00Z", vessel: "Cougar" },
    { id: "CMD-A6", pillar: "apm", severity: "medium", title: "Continental TCE below fleet average for 3 consecutive voyages", timestamp: "2026-03-25T03:10:00Z", vessel: "Continental" },
    { id: "CMD-A7", pillar: "infrastructure", severity: "medium", title: "Champion ballast water treatment system — calibration due", timestamp: "2026-03-24T22:00:00Z", vessel: "Champion" },
    { id: "CMD-A8", pillar: "synthetics", severity: "high", title: "EU ETS compliance — Q1 allowance submission deadline Mar 31", timestamp: "2026-03-24T18:00:00Z", vessel: null },
  ];

  res.json({ pillars, kpiRibbon, alertFeed, fleetSummary: { total: VESSELS.length, laden: VESSELS.filter(v => v.status === "laden").length, ballast: VESSELS.filter(v => v.status === "ballast").length, atPort: VESSELS.filter(v => v.status === "at-port").length, drydock: VESSELS.filter(v => v.status === "drydock").length } });
});

router.get("/vessels/apm", (_req, res) => {
  const vessels = VESSELS.map(v => ({
    ...v,
    tceHistory: generateTceHistory(v.tce || 50000),
    speedConsumption: generateSpeedConsumption(),
    voyagePnl: generateVoyagePnl(v.tce || 50000),
    ladenDays: Math.round(180 + Math.random() * 80),
    ballastDays: Math.round(60 + Math.random() * 40),
    portDays: Math.round(15 + Math.random() * 20),
    voyageCount: Math.round(6 + Math.random() * 6),
    revenueYtd: Math.round((v.tce || 50000) * (180 + Math.random() * 80)),
  }));

  const fleetAvgTce = Math.round(vessels.filter(v => v.tce > 0).reduce((s, v) => s + v.tce, 0) / vessels.filter(v => v.tce > 0).length);
  const totalRevenue = vessels.reduce((s, v) => s + v.revenueYtd, 0);
  const fleetUtil = Math.round(vessels.reduce((s, v) => s + v.utilization, 0) / vessels.length);

  const fleetTceHistory = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map((m, i) => ({
    month: m,
    fleetAvg: Math.round(fleetAvgTce + (Math.random() - 0.3) * 8000 + i * 1200),
    marketAvg: Math.round(45000 + (Math.random() - 0.5) * 10000 + i * 600),
  }));

  const utilizationHistory = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map((m, i) => ({
    month: m,
    utilization: Math.round(fleetUtil + (Math.random() - 0.4) * 8 + i * 0.3),
    target: 92,
  }));

  const utilizationHeatmap = VESSELS.filter(v => v.status !== "drydock").map(v => ({
    vessel: v.name,
    months: ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map(m => ({
      month: m,
      utilization: Math.round(v.utilization + (Math.random() - 0.5) * 20),
    })),
  }));

  res.json({ vessels, fleetMetrics: { avgTce: fleetAvgTce, totalRevenue, fleetUtilization: fleetUtil, totalVoyages: vessels.reduce((s, v) => s + v.voyageCount, 0) }, fleetTceHistory, utilizationHistory, utilizationHeatmap });
});

router.get("/vessels/infrastructure", (_req, res) => {
  const vesselHealth = VESSELS.map(v => ({
    id: v.id,
    name: v.name,
    status: v.status,
    overallHealth: v.status === "drydock" ? 45 : Math.round(70 + Math.random() * 25),
    engineHours: v.status === "drydock" ? 48200 : Math.round(8000 + Math.random() * 40000),
    engineHoursRemaining: v.status === "drydock" ? 0 : Math.round(5000 + Math.random() * 20000),
    fuelSystem: v.status === "drydock" ? "offline" : (Math.random() > 0.85 ? "warning" : "operational"),
    hullCondition: v.status === "drydock" ? 52 : Math.round(65 + Math.random() * 30),
    nextDrydock: v.status === "drydock" ? "In Progress" : `${Math.round(90 + Math.random() * 900)} days`,
    nextDrydockDate: v.status === "drydock" ? null : new Date(Date.now() + (90 + Math.random() * 900) * 86400000).toISOString().split("T")[0],
    maintenanceBacklog: Math.round(Math.random() * 12),
    maintenancePriority: Math.random() > 0.7 ? "high" : (Math.random() > 0.4 ? "medium" : "low"),
    lastSurvey: new Date(Date.now() - Math.random() * 180 * 86400000).toISOString().split("T")[0],
    built: v.built,
    systems: [
      { name: "Main Engine", status: v.status === "drydock" ? "offline" : "operational", health: v.status === "drydock" ? 40 : Math.round(75 + Math.random() * 20) },
      { name: "Aux Engine 1", status: "operational", health: Math.round(70 + Math.random() * 25) },
      { name: "Aux Engine 2", status: Math.random() > 0.9 ? "degraded" : "operational", health: Math.round(65 + Math.random() * 30) },
      { name: "Cargo System", status: v.status === "drydock" ? "maintenance" : "operational", health: Math.round(70 + Math.random() * 25) },
      { name: "Navigation", status: "operational", health: Math.round(85 + Math.random() * 12) },
      { name: "Safety Systems", status: "operational", health: Math.round(80 + Math.random() * 18) },
    ],
  }));

  const fleetHealthScore = Math.round(vesselHealth.reduce((s, v) => s + v.overallHealth, 0) / vesselHealth.length);

  res.json({ vesselHealth, fleetHealthScore, totalMaintenanceBacklog: vesselHealth.reduce((s, v) => s + v.maintenanceBacklog, 0), criticalSystems: vesselHealth.filter(v => v.overallHealth < 60).length });
});

router.get("/vessels/logs", (_req, res) => {
  const eventTypes = ["voyage", "port", "bunker", "cargo", "compliance", "maintenance", "crew"] as const;
  const severities = ["info", "warning", "critical"] as const;

  const logEntries = [
    { id: "LOG-001", timestamp: "2026-03-25T09:15:00Z", vessel: "Crusader", vesselId: "VLGC-013", eventType: "cargo", severity: "info", message: "Cargo discharge commenced at Yokohama — 42,000 MT propane", voyage: "V-2026-034" },
    { id: "LOG-002", timestamp: "2026-03-25T08:45:00Z", vessel: "Clermont", vesselId: "VLGC-009", eventType: "maintenance", severity: "critical", message: "Drydock Phase 2 initiated — hull coating removal in progress", voyage: null },
    { id: "LOG-003", timestamp: "2026-03-25T08:30:00Z", vessel: "Captain Markos", vesselId: "VLGC-003", eventType: "maintenance", severity: "warning", message: "Engine bearing temperature elevated — monitoring initiated per Class requirement", voyage: "V-2026-028" },
    { id: "LOG-004", timestamp: "2026-03-25T08:00:00Z", vessel: "Corvette", vesselId: "VLGC-001", eventType: "voyage", severity: "info", message: "Transiting Strait of Hormuz — outbound laden passage, ETA Japan Apr 12", voyage: "V-2026-031" },
    { id: "LOG-005", timestamp: "2026-03-25T07:30:00Z", vessel: "Cougar", vesselId: "VLGC-005", eventType: "port", severity: "info", message: "Arrived Ras Tanura — berthing at Terminal 4 for propane loading", voyage: "V-2026-030" },
    { id: "LOG-006", timestamp: "2026-03-25T07:00:00Z", vessel: "Commodore", vesselId: "VLGC-006", eventType: "bunker", severity: "info", message: "Bunkering completed — 2,800 MT VLSFO loaded at Houston anchorage", voyage: "V-2026-032" },
    { id: "LOG-007", timestamp: "2026-03-25T06:30:00Z", vessel: "Champion", vesselId: "VLGC-012", eventType: "compliance", severity: "warning", message: "Ballast water management system calibration overdue — scheduled for next port call", voyage: "V-2026-027" },
    { id: "LOG-008", timestamp: "2026-03-25T06:00:00Z", vessel: "Concorde", vesselId: "VLGC-002", eventType: "voyage", severity: "info", message: "Passing 10°N waypoint — Indian Ocean transit proceeding nominal, ETA Haldia Apr 2", voyage: "V-2026-029" },
    { id: "LOG-009", timestamp: "2026-03-25T05:30:00Z", vessel: "Corsair", vesselId: "VLGC-004", eventType: "cargo", severity: "info", message: "Cargo condition monitoring — tank temperatures within specification, boil-off rate 0.08%", voyage: "V-2026-033" },
    { id: "LOG-010", timestamp: "2026-03-25T05:00:00Z", vessel: "Continental", vesselId: "VLGC-007", eventType: "voyage", severity: "info", message: "Bay of Biscay transit — moderate seas, maintaining 13.8 kn ballast speed", voyage: "V-2026-026" },
    { id: "LOG-011", timestamp: "2026-03-25T04:30:00Z", vessel: "Cresida", vesselId: "VLGC-008", eventType: "voyage", severity: "info", message: "Transiting Gulf of Aden — armed security team embarked, UKMTO reporting active", voyage: "V-2026-035" },
    { id: "LOG-012", timestamp: "2026-03-25T04:00:00Z", vessel: "Constellation", vesselId: "VLGC-010", eventType: "port", severity: "info", message: "Hong Kong pilot boarded — proceeding to anchorage for cargo tank inspection", voyage: "V-2026-036" },
    { id: "LOG-013", timestamp: "2026-03-25T03:30:00Z", vessel: "Challenger", vesselId: "VLGC-011", eventType: "bunker", severity: "info", message: "Fuel ROB report — 3,400 MT VLSFO remaining, sufficient for ballast leg to AG", voyage: "V-2026-025" },
    { id: "LOG-014", timestamp: "2026-03-25T03:00:00Z", vessel: null, vesselId: null, eventType: "compliance", severity: "warning", message: "Fleet-wide EU ETS Q1 allowance submission deadline approaching — 6 days remaining", voyage: null },
    { id: "LOG-015", timestamp: "2026-03-25T02:30:00Z", vessel: "Cougar", vesselId: "VLGC-005", eventType: "crew", severity: "info", message: "Crew change completed — 8 officers and ratings embarked at Ras Tanura", voyage: "V-2026-030" },
    { id: "LOG-016", timestamp: "2026-03-25T02:00:00Z", vessel: "Captain Markos", vesselId: "VLGC-003", eventType: "bunker", severity: "warning", message: "Bunker fuel quality test — sulphur content 0.48% (limit 0.50%), marginal compliance", voyage: "V-2026-028" },
    { id: "LOG-017", timestamp: "2026-03-25T01:30:00Z", vessel: "Corvette", vesselId: "VLGC-001", eventType: "compliance", severity: "info", message: "SEEMP Part III carbon intensity report submitted to flag state", voyage: "V-2026-031" },
    { id: "LOG-018", timestamp: "2026-03-25T01:00:00Z", vessel: "Clermont", vesselId: "VLGC-009", eventType: "maintenance", severity: "info", message: "Drydock progress — underwater hull inspection completed, coating assessment underway", voyage: null },
    { id: "LOG-019", timestamp: "2026-03-25T00:30:00Z", vessel: "Commodore", vesselId: "VLGC-006", eventType: "voyage", severity: "info", message: "Departed Houston Ship Channel — laden with 44,000 MT propane/butane mix for ARA", voyage: "V-2026-032" },
    { id: "LOG-020", timestamp: "2026-03-24T23:00:00Z", vessel: "Crusader", vesselId: "VLGC-013", eventType: "port", severity: "info", message: "Yokohama pilot station — inbound pilotage commenced, berth allocation confirmed", voyage: "V-2026-034" },
    { id: "LOG-021", timestamp: "2026-03-24T22:00:00Z", vessel: "Champion", vesselId: "VLGC-012", eventType: "maintenance", severity: "warning", message: "Cargo compressor #2 — abnormal vibration detected, manual inspection ordered", voyage: "V-2026-027" },
    { id: "LOG-022", timestamp: "2026-03-24T21:00:00Z", vessel: "Constellation", vesselId: "VLGC-010", eventType: "compliance", severity: "info", message: "CII operational rating recalculated — current trajectory: B rating (target met)", voyage: "V-2026-036" },
    { id: "LOG-023", timestamp: "2026-03-24T20:00:00Z", vessel: "Corsair", vesselId: "VLGC-004", eventType: "voyage", severity: "info", message: "Malacca Strait transit completed — Singapore VTIS clearance obtained", voyage: "V-2026-033" },
    { id: "LOG-024", timestamp: "2026-03-24T19:00:00Z", vessel: "Concorde", vesselId: "VLGC-002", eventType: "crew", severity: "info", message: "Safety drill conducted — abandon ship and fire drill, all hands participated", voyage: "V-2026-029" },
    { id: "LOG-025", timestamp: "2026-03-24T18:00:00Z", vessel: "Challenger", vesselId: "VLGC-011", eventType: "voyage", severity: "info", message: "Bab el-Mandeb Strait transit — proceeding at economical speed, security zone cleared", voyage: "V-2026-025" },
  ];

  res.json({ logs: logEntries, totalCount: logEntries.length, eventTypes: [...eventTypes], severities: [...severities] });
});

router.get("/vessels/experience", (_req, res) => {
  const shipments = [
    { id: "SHP-001", vessel: "Corvette", voyage: "V-2026-031", cargo: "Propane", volume: "44,000 MT", origin: "Ras Tanura", destination: "Chiba, Japan", progress: 35, eta: "2026-04-12", customer: "Itochu", slaStatus: "on-track", demurrageRisk: 0, laytimeDays: 0, laytimeAllowed: 3 },
    { id: "SHP-002", vessel: "Concorde", voyage: "V-2026-029", cargo: "Butane", volume: "42,000 MT", origin: "Jubail", destination: "Haldia, India", progress: 52, eta: "2026-04-02", customer: "BPCL", slaStatus: "on-track", demurrageRisk: 12000, laytimeDays: 1.5, laytimeAllowed: 2 },
    { id: "SHP-003", vessel: "Corsair", voyage: "V-2026-033", cargo: "Propane/Butane", volume: "43,500 MT", origin: "Das Island", destination: "Ulsan, S. Korea", progress: 68, eta: "2026-03-31", customer: "SK Gas", slaStatus: "on-track", demurrageRisk: 0, laytimeDays: 0.5, laytimeAllowed: 2.5 },
    { id: "SHP-004", vessel: "Commodore", voyage: "V-2026-032", cargo: "Propane/Butane", volume: "44,000 MT", origin: "Houston", destination: "ARA (Amsterdam-Rotterdam-Antwerp)", progress: 12, eta: "2026-04-18", customer: "Vitol", slaStatus: "on-track", demurrageRisk: 0, laytimeDays: 0, laytimeAllowed: 4 },
    { id: "SHP-005", vessel: "Cresida", voyage: "V-2026-035", cargo: "Propane", volume: "43,000 MT", origin: "Ras Tanura", destination: "Ningbo, China", progress: 40, eta: "2026-04-08", customer: "Sinopec", slaStatus: "on-track", demurrageRisk: 0, laytimeDays: 0, laytimeAllowed: 3 },
    { id: "SHP-006", vessel: "Crusader", voyage: "V-2026-034", cargo: "Propane", volume: "42,000 MT", origin: "Jubail", destination: "Yokohama, Japan", progress: 95, eta: "2026-03-25", customer: "JERA", slaStatus: "on-track", demurrageRisk: 0, laytimeDays: 1, laytimeAllowed: 2.5 },
    { id: "SHP-007", vessel: "Cougar", voyage: "V-2026-030", cargo: "Propane", volume: "40,000 MT", origin: "Ras Tanura", destination: "Mundra, India", progress: 5, eta: "2026-04-05", customer: "Aramco Trading", slaStatus: "pending-load", demurrageRisk: 0, laytimeDays: 0, laytimeAllowed: 2 },
    { id: "SHP-008", vessel: "Constellation", voyage: "V-2026-036", cargo: "Butane", volume: "41,500 MT", origin: "Das Island", destination: "Chiba, Japan", progress: 78, eta: "2026-03-28", customer: "Marubeni", slaStatus: "minor-delay", demurrageRisk: 45000, laytimeDays: 2.2, laytimeAllowed: 2.5 },
  ];

  const charterPerformance = [
    { month: "Oct", adherence: 92, target: 95 },
    { month: "Nov", adherence: 94, target: 95 },
    { month: "Dec", adherence: 89, target: 95 },
    { month: "Jan", adherence: 91, target: 95 },
    { month: "Feb", adherence: 93, target: 95 },
    { month: "Mar", adherence: 91, target: 95 },
  ];

  const totalDemurrageExposure = shipments.reduce((s, sh) => s + sh.demurrageRisk, 0);
  const overallSla = Math.round(shipments.filter(s => s.slaStatus === "on-track").length / shipments.length * 100);

  res.json({ shipments, charterPerformance, metrics: { totalDemurrageExposure, overallSlaAdherence: overallSla, activeShipments: shipments.length, onTimeDelivery: 94, customerSatisfaction: 4.2 } });
});

router.get("/vessels/synthetics", (_req, res) => {
  const complianceCards = VESSELS.map(v => ({
    id: v.id,
    name: v.name,
    ciiRating: v.cii,
    ciiScore: v.cii === "A" ? Math.round(85 + Math.random() * 10) : v.cii === "B" ? Math.round(70 + Math.random() * 12) : v.cii === "C" ? Math.round(55 + Math.random() * 12) : Math.round(30 + Math.random() * 15),
    ciiTrend: v.cii === "D" ? "declining" : (Math.random() > 0.3 ? "stable" : "improving"),
    eexiStatus: v.eexi,
    pscReadiness: v.status === "drydock" ? 45 : Math.round(70 + Math.random() * 25),
    sanctionsScreening: "clear",
    certificates: [
      { name: "Safety Management Certificate", expiry: new Date(Date.now() + (60 + Math.random() * 400) * 86400000).toISOString().split("T")[0], status: Math.random() > 0.85 ? "expiring-soon" : "valid" },
      { name: "International Ship Security Certificate", expiry: new Date(Date.now() + (30 + Math.random() * 500) * 86400000).toISOString().split("T")[0], status: Math.random() > 0.9 ? "expiring-soon" : "valid" },
      { name: "Document of Compliance", expiry: new Date(Date.now() + (90 + Math.random() * 600) * 86400000).toISOString().split("T")[0], status: "valid" },
      { name: "P&I Insurance", expiry: new Date(Date.now() + (20 + Math.random() * 340) * 86400000).toISOString().split("T")[0], status: Math.random() > 0.8 ? "expiring-soon" : "valid" },
      { name: "Class Certificate", expiry: new Date(Date.now() + (100 + Math.random() * 700) * 86400000).toISOString().split("T")[0], status: "valid" },
    ],
  }));

  const upcomingDeadlines = [
    { date: "2026-03-31", title: "EU ETS Q1 Allowance Submission", severity: "critical", scope: "Fleet-wide" },
    { date: "2026-04-05", title: "Clermont Drydock Completion Target", severity: "high", scope: "Clermont" },
    { date: "2026-04-15", title: "CII 2025 Annual Report Submission", severity: "high", scope: "Fleet-wide" },
    { date: "2026-05-01", title: "MARPOL Annex VI Fuel Data Report", severity: "medium", scope: "Fleet-wide" },
    { date: "2026-05-15", title: "Champion P&I Insurance Renewal", severity: "medium", scope: "Champion" },
    { date: "2026-06-01", title: "IMO DCS Annual Report", severity: "medium", scope: "Fleet-wide" },
    { date: "2026-06-15", title: "Captain Markos Class Survey", severity: "high", scope: "Captain Markos" },
    { date: "2026-07-01", title: "EU ETS Q2 Allowance Submission", severity: "medium", scope: "Fleet-wide" },
  ];

  const fleetCompliance = Math.round(complianceCards.reduce((s, c) => s + c.ciiScore, 0) / complianceCards.length);
  const expiringCerts = complianceCards.reduce((s, c) => s + c.certificates.filter(cert => cert.status === "expiring-soon").length, 0);

  res.json({ complianceCards, upcomingDeadlines, metrics: { fleetComplianceScore: fleetCompliance, expiringCertificates: expiringCerts, pscDeficiencies: 2, sanctionsAlerts: 0, ciiABRatio: Math.round(complianceCards.filter(c => c.ciiRating === "A" || c.ciiRating === "B").length / complianceCards.length * 100) } });
});

router.get("/vessels/intelligence", (_req, res) => {
  const anomalies = [
    { id: "ANM-001", vessel: "Captain Markos", type: "fuel-consumption", severity: "high", message: "Fuel consumption 12% above baseline for current laden voyage — potential hull fouling or engine degradation", detected: "2026-03-25T05:00:00Z", confidence: 87, baseline: 65, actual: 72.8 },
    { id: "ANM-002", vessel: "Continental", type: "speed-deviation", severity: "medium", message: "Average speed 8% below charter party warranted speed on last 3 ballast voyages", detected: "2026-03-24T14:00:00Z", confidence: 74, baseline: 15.0, actual: 13.8 },
    { id: "ANM-003", vessel: "Champion", type: "cargo-system", severity: "medium", message: "Cargo compressor #2 vibration levels trending upward — predictive maintenance window recommended", detected: "2026-03-24T22:00:00Z", confidence: 81, baseline: 2.4, actual: 3.8 },
    { id: "ANM-004", vessel: "Cougar", type: "fuel-consumption", severity: "low", message: "Port fuel consumption 5% above seasonal average — likely cold weather auxiliary load", detected: "2026-03-23T16:00:00Z", confidence: 62, baseline: 8.5, actual: 8.9 },
  ];

  const maintenancePredictions = [
    { vessel: "Captain Markos", system: "Main Engine Bearings", predictedDate: "2026-05-15", confidence: 78, severity: "high", estimatedCost: 285000, recommendation: "Schedule bearing inspection during next port call — avoid mid-voyage failure risk" },
    { vessel: "Champion", system: "Cargo Compressor #2", predictedDate: "2026-04-20", confidence: 85, severity: "medium", estimatedCost: 145000, recommendation: "Order replacement parts now — 4 week lead time from maker" },
    { vessel: "Continental", system: "Hull Coating", predictedDate: "2026-06-01", confidence: 71, severity: "medium", estimatedCost: 1200000, recommendation: "Plan underwater hull cleaning at next convenient port — deterioration accelerating" },
    { vessel: "Clermont", system: "Cargo Tank Coating", predictedDate: "2026-04-05", confidence: 92, severity: "high", estimatedCost: 2800000, recommendation: "Included in current drydock scope — recoating underway" },
  ];

  const freightForecast = [
    { month: "Jan", actual: 45200, forecast: null },
    { month: "Feb", actual: 52800, forecast: null },
    { month: "Mar", actual: 58400, forecast: null },
    { month: "Apr", actual: null, forecast: 62100, upper: 68500, lower: 55700 },
    { month: "May", actual: null, forecast: 65800, upper: 74200, lower: 57400 },
    { month: "Jun", actual: null, forecast: 61200, upper: 71800, lower: 50600 },
    { month: "Jul", actual: null, forecast: 58400, upper: 70200, lower: 46600 },
    { month: "Aug", actual: null, forecast: 63500, upper: 76100, lower: 50900 },
    { month: "Sep", actual: null, forecast: 68200, upper: 82400, lower: 54000 },
  ];

  const emissionsTrajectory = [
    { month: "Jan", actual: 1420, target: 1500, ciiThreshold: 1550 },
    { month: "Feb", actual: 1380, target: 1480, ciiThreshold: 1530 },
    { month: "Mar", actual: 1450, target: 1460, ciiThreshold: 1510 },
    { month: "Apr", projected: 1410, target: 1440, ciiThreshold: 1490 },
    { month: "May", projected: 1380, target: 1420, ciiThreshold: 1470 },
    { month: "Jun", projected: 1350, target: 1400, ciiThreshold: 1450 },
  ];

  const executiveBriefing = {
    generated: "2026-03-25T09:00:00Z",
    summary: "Fleet operating at 89% overall utilization with average TCE of $57.3k — above market average of $48.5k. Two vessels (Captain Markos and Clermont) require immediate attention: Captain Markos showing elevated fuel consumption and engine bearing anomalies suggesting imminent maintenance need; Clermont drydock on schedule with hull recoating progressing. EU ETS Q1 submission deadline in 6 days — compliance team to finalize allowance calculations. Freight market showing bullish Q2 outlook with AG-FE rates projected to reach $65-68k TCE range. Three certificates expiring within 30 days across the fleet — renewal process initiated.",
    keyActions: [
      "Expedite Captain Markos engine bearing inspection at next port call",
      "Confirm Clermont drydock timeline — coating contractor milestone review due Apr 1",
      "Submit EU ETS Q1 allowances before March 31 deadline",
      "Review Continental performance — 3 consecutive below-average TCE voyages",
      "Approve Champion cargo compressor parts order ($145k) — lead time critical",
    ],
    marketOutlook: "Bullish",
    riskLevel: "Moderate",
  };

  res.json({ anomalies, maintenancePredictions, freightForecast, emissionsTrajectory, executiveBriefing });
});

router.get("/vessels/fleet", (_req, res) => {
  const active = VESSELS.filter(v => v.status !== "drydock");
  res.json({
    summary: {
      totalVessels: VESSELS.length,
      activeVessels: VESSELS.filter(v => v.status === "laden" || v.status === "ballast").length,
      atPort: VESSELS.filter(v => v.status === "at-port").length,
      anchored: 0,
      avgUtilization: Math.round(active.reduce((s, v) => s + v.utilization, 0) / active.length),
      activeAlerts: 13,
      routesInProgress: VESSELS.filter(v => v.status === "laden" || v.status === "ballast").length,
    },
    vessels: VESSELS,
  });
});

export default router;
