import { Router } from "express";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import {
  vesselsTable,
  vesselFleetsTable,
  vesselVoyagesTable,
  vesselPortsTable,
  vesselRoutesTable,
  vesselEmissionsTable,
  vesselAlertsTable,
  vesselMaintenanceEventsTable,
  vesselCertificatesTable,
  vesselShipmentsTable,
  vesselLogsTable,
} from "@szl-holdings/db/schema";
import { eq, desc, and, count, sql, asc } from "drizzle-orm";

const router = Router();

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

let seeded = false;
let seedingPromise: Promise<void> | null = null;

async function ensureSeeded() {
  if (seeded || !isDatabaseAvailable()) return;
  if (seedingPromise) return seedingPromise;
  seedingPromise = doSeed().finally(() => { seedingPromise = null; });
  return seedingPromise;
}

async function doSeed() {
  if (seeded) return;
  const existing = await db.select({ cnt: count() }).from(vesselsTable);
  if (existing[0].cnt > 0) {
    seeded = true;
    return;
  }

  const rng = seededRng(42);

  const [fleet] = await db.insert(vesselFleetsTable).values({ name: "SZL VLGC Fleet", description: "Steelzeal VLGC fleet" }).returning();

  const VESSELS_DATA = [
    { vesselCode: "VLGC-001", name: "Corvette", imo: "9823401", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2019, class: "DNV GL", status: "laden", speed: 16.2, lat: 26.12, lng: 56.34, route: "AG-Japan", charterer: "Itochu", tce: 62500, utilization: 94, cii: "B", eexi: "compliant" },
    { vesselCode: "VLGC-002", name: "Concorde", imo: "9823402", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2020, class: "Lloyd's", status: "laden", speed: 15.8, lat: 12.45, lng: 72.18, route: "AG-India", charterer: "BPCL", tce: 58200, utilization: 91, cii: "A", eexi: "compliant" },
    { vesselCode: "VLGC-003", name: "Captain Markos", imo: "9823403", flag: "Bahamas", type: "VLGC", dwt: 82500, cbm: 80000, built: 2015, class: "DNV GL", status: "ballast", speed: 14.5, lat: 33.21, lng: 132.45, route: "Japan-AG", charterer: null, tce: 41200, utilization: 82, cii: "C", eexi: "compliant" },
    { vesselCode: "VLGC-004", name: "Corsair", imo: "9823404", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2021, class: "Bureau Veritas", status: "laden", speed: 16.5, lat: 5.88, lng: 105.32, route: "AG-South Korea", charterer: "SK Gas", tce: 67800, utilization: 96, cii: "A", eexi: "compliant" },
    { vesselCode: "VLGC-005", name: "Cougar", imo: "9823405", flag: "Bahamas", type: "VLGC", dwt: 82500, cbm: 80000, built: 2016, class: "Lloyd's", status: "at-port", speed: 0, lat: 26.19, lng: 50.55, route: "AG-Loading", charterer: "Aramco Trading", tce: 55400, utilization: 88, cii: "B", eexi: "compliant" },
    { vesselCode: "VLGC-006", name: "Commodore", imo: "9823406", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2022, class: "DNV GL", status: "laden", speed: 15.2, lat: 29.38, lng: -88.72, route: "USG-Europe", charterer: "Vitol", tce: 71200, utilization: 97, cii: "A", eexi: "compliant" },
    { vesselCode: "VLGC-007", name: "Continental", imo: "9823407", flag: "Bahamas", type: "VLGC", dwt: 82500, cbm: 80000, built: 2017, class: "Bureau Veritas", status: "ballast", speed: 13.8, lat: 48.22, lng: -5.34, route: "Europe-USG", charterer: null, tce: 38900, utilization: 79, cii: "B", eexi: "compliant" },
    { vesselCode: "VLGC-008", name: "Cresida", imo: "9823408", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2023, class: "Lloyd's", status: "laden", speed: 16.8, lat: -1.25, lng: 44.67, route: "AG-China", charterer: "Sinopec", tce: 64100, utilization: 93, cii: "A", eexi: "compliant" },
    { vesselCode: "VLGC-009", name: "Clermont", imo: "9823409", flag: "Bahamas", type: "VLGC", dwt: 82500, cbm: 80000, built: 2014, class: "DNV GL", status: "drydock", speed: 0, lat: 1.26, lng: 103.82, route: "Drydock-Singapore", charterer: null, tce: 0, utilization: 0, cii: "D", eexi: "non-compliant" },
    { vesselCode: "VLGC-010", name: "Constellation", imo: "9823410", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2020, class: "Bureau Veritas", status: "laden", speed: 15.5, lat: 22.31, lng: 114.17, route: "AG-Japan", charterer: "Marubeni", tce: 59800, utilization: 90, cii: "B", eexi: "compliant" },
    { vesselCode: "VLGC-011", name: "Challenger", imo: "9823411", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2021, class: "Lloyd's", status: "ballast", speed: 14.2, lat: 11.58, lng: 43.15, route: "India-AG", charterer: null, tce: 43500, utilization: 85, cii: "B", eexi: "compliant" },
    { vesselCode: "VLGC-012", name: "Champion", imo: "9823412", flag: "Bahamas", type: "VLGC", dwt: 82500, cbm: 80000, built: 2018, class: "DNV GL", status: "at-port", speed: 0, lat: 29.37, lng: -94.87, route: "USG-Loading", charterer: "Enterprise Products", tce: 52700, utilization: 86, cii: "C", eexi: "compliant" },
    { vesselCode: "VLGC-013", name: "Crusader", imo: "9823413", flag: "Marshall Islands", type: "VLGC", dwt: 84000, cbm: 82000, built: 2024, class: "DNV GL", status: "laden", speed: 17.1, lat: 35.44, lng: 139.64, route: "AG-Japan", charterer: "JERA", tce: 73400, utilization: 98, cii: "A", eexi: "compliant" },
  ];

  const insertedVessels = await db.insert(vesselsTable).values(
    VESSELS_DATA.map(v => ({ ...v, fleetId: fleet.id }))
  ).returning();

  const vesselMap = new Map<string, number>();
  insertedVessels.forEach(v => vesselMap.set(v.vesselCode, v.id));

  await db.insert(vesselPortsTable).values([
    { name: "Ras Tanura", code: "SART", country: "Saudi Arabia", lat: 26.68, lng: 50.17, type: "terminal" },
    { name: "Jubail", code: "SAJU", country: "Saudi Arabia", lat: 27.01, lng: 49.62, type: "terminal" },
    { name: "Das Island", code: "AEDAS", country: "UAE", lat: 25.15, lng: 52.87, type: "terminal" },
    { name: "Chiba", code: "JPCHB", country: "Japan", lat: 35.60, lng: 140.10, type: "terminal" },
    { name: "Yokohama", code: "JPYOK", country: "Japan", lat: 35.44, lng: 139.64, type: "terminal" },
    { name: "Haldia", code: "INHAL", country: "India", lat: 22.03, lng: 88.11, type: "terminal" },
    { name: "Ulsan", code: "KRULS", country: "South Korea", lat: 35.50, lng: 129.38, type: "terminal" },
    { name: "Houston", code: "USHOU", country: "USA", lat: 29.76, lng: -95.36, type: "terminal" },
    { name: "ARA (Amsterdam-Rotterdam-Antwerp)", code: "NLARA", country: "Netherlands", lat: 51.95, lng: 4.50, type: "terminal" },
    { name: "Ningbo", code: "CNNGB", country: "China", lat: 29.87, lng: 121.54, type: "terminal" },
    { name: "Mundra", code: "INMUN", country: "India", lat: 22.74, lng: 69.72, type: "terminal" },
    { name: "Hong Kong", code: "HKHKG", country: "Hong Kong", lat: 22.31, lng: 114.17, type: "anchorage" },
    { name: "Singapore", code: "SGSIN", country: "Singapore", lat: 1.26, lng: 103.82, type: "anchorage" },
  ]);

  const voyageData = [
    { voyageCode: "V-2026-031", vesselCode: "VLGC-001", origin: "Ras Tanura", destination: "Chiba, Japan", originLat: 26.68, originLng: 50.17, destLat: 35.60, destLng: 140.10, eta: "2026-04-12", cargo: "Propane", cargoVolume: "44,000 MT", progress: 35, status: "in-progress", weatherRisk: 15, portCongestionRisk: 10, geopoliticalRisk: 25, piracyRisk: 20 },
    { voyageCode: "V-2026-029", vesselCode: "VLGC-002", origin: "Jubail", destination: "Haldia, India", originLat: 27.01, originLng: 49.62, destLat: 22.03, destLng: 88.11, eta: "2026-04-02", cargo: "Butane", cargoVolume: "42,000 MT", progress: 52, status: "in-progress", weatherRisk: 20, portCongestionRisk: 35, geopoliticalRisk: 10, piracyRisk: 15 },
    { voyageCode: "V-2026-028", vesselCode: "VLGC-003", origin: "Chiba, Japan", destination: "Ras Tanura", originLat: 35.60, originLng: 140.10, destLat: 26.68, destLng: 50.17, eta: "2026-04-08", cargo: null, cargoVolume: null, progress: 45, status: "in-progress", weatherRisk: 10, portCongestionRisk: 15, geopoliticalRisk: 30, piracyRisk: 25 },
    { voyageCode: "V-2026-033", vesselCode: "VLGC-004", origin: "Das Island", destination: "Ulsan, S. Korea", originLat: 25.15, originLng: 52.87, destLat: 35.50, destLng: 129.38, eta: "2026-03-31", cargo: "Propane/Butane", cargoVolume: "43,500 MT", progress: 68, status: "in-progress", weatherRisk: 10, portCongestionRisk: 5, geopoliticalRisk: 15, piracyRisk: 30 },
    { voyageCode: "V-2026-030", vesselCode: "VLGC-005", origin: "Ras Tanura", destination: "Mundra, India", originLat: 26.68, originLng: 50.17, destLat: 22.74, destLng: 69.72, eta: "2026-04-05", cargo: "Propane", cargoVolume: "40,000 MT", progress: 5, status: "loading", weatherRisk: 5, portCongestionRisk: 20, geopoliticalRisk: 10, piracyRisk: 5 },
    { voyageCode: "V-2026-032", vesselCode: "VLGC-006", origin: "Houston", destination: "ARA (Amsterdam-Rotterdam-Antwerp)", originLat: 29.76, originLng: -95.36, destLat: 51.95, destLng: 4.50, eta: "2026-04-18", cargo: "Propane/Butane", cargoVolume: "44,000 MT", progress: 12, status: "in-progress", weatherRisk: 30, portCongestionRisk: 25, geopoliticalRisk: 5, piracyRisk: 5 },
    { voyageCode: "V-2026-026", vesselCode: "VLGC-007", origin: "ARA", destination: "Houston", originLat: 51.95, originLng: 4.50, destLat: 29.76, destLng: -95.36, eta: "2026-04-10", cargo: null, cargoVolume: null, progress: 40, status: "in-progress", weatherRisk: 35, portCongestionRisk: 15, geopoliticalRisk: 5, piracyRisk: 5 },
    { voyageCode: "V-2026-035", vesselCode: "VLGC-008", origin: "Ras Tanura", destination: "Ningbo, China", originLat: 26.68, originLng: 50.17, destLat: 29.87, destLng: 121.54, eta: "2026-04-08", cargo: "Propane", cargoVolume: "43,000 MT", progress: 40, status: "in-progress", weatherRisk: 10, portCongestionRisk: 15, geopoliticalRisk: 20, piracyRisk: 40 },
    { voyageCode: "V-2026-036", vesselCode: "VLGC-010", origin: "Das Island", destination: "Chiba, Japan", originLat: 25.15, originLng: 52.87, destLat: 35.60, destLng: 140.10, eta: "2026-03-28", cargo: "Butane", cargoVolume: "41,500 MT", progress: 78, status: "in-progress", weatherRisk: 15, portCongestionRisk: 30, geopoliticalRisk: 15, piracyRisk: 20 },
    { voyageCode: "V-2026-025", vesselCode: "VLGC-011", origin: "Haldia, India", destination: "Ras Tanura", originLat: 22.03, originLng: 88.11, destLat: 26.68, destLng: 50.17, eta: "2026-04-03", cargo: null, cargoVolume: null, progress: 55, status: "in-progress", weatherRisk: 10, portCongestionRisk: 10, geopoliticalRisk: 25, piracyRisk: 35 },
    { voyageCode: "V-2026-027", vesselCode: "VLGC-012", origin: "Houston", destination: "Chiba, Japan", originLat: 29.76, originLng: -95.36, destLat: 35.60, destLng: 140.10, eta: "2026-04-25", cargo: "Propane", cargoVolume: "40,500 MT", progress: 8, status: "loading", weatherRisk: 20, portCongestionRisk: 15, geopoliticalRisk: 10, piracyRisk: 10 },
    { voyageCode: "V-2026-034", vesselCode: "VLGC-013", origin: "Jubail", destination: "Yokohama, Japan", originLat: 27.01, originLng: 49.62, destLat: 35.44, destLng: 139.64, eta: "2026-03-25", cargo: "Propane", cargoVolume: "42,000 MT", progress: 95, status: "in-progress", weatherRisk: 5, portCongestionRisk: 10, geopoliticalRisk: 10, piracyRisk: 5 },
  ];

  for (const vd of voyageData) {
    const vesselId = vesselMap.get(vd.vesselCode);
    if (!vesselId) continue;
    const riskScore = Math.round((vd.weatherRisk * 0.3 + vd.portCongestionRisk * 0.25 + vd.geopoliticalRisk * 0.25 + vd.piracyRisk * 0.2));
    await db.insert(vesselVoyagesTable).values({
      voyageCode: vd.voyageCode,
      vesselId,
      origin: vd.origin,
      destination: vd.destination,
      originLat: vd.originLat,
      originLng: vd.originLng,
      destLat: vd.destLat,
      destLng: vd.destLng,
      eta: vd.eta,
      cargo: vd.cargo,
      cargoVolume: vd.cargoVolume,
      progress: vd.progress,
      status: vd.status,
      riskScore,
      weatherRisk: vd.weatherRisk,
      portCongestionRisk: vd.portCongestionRisk,
      geopoliticalRisk: vd.geopoliticalRisk,
      piracyRisk: vd.piracyRisk,
    });
  }

  const months = ["2025-07","2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03"];
  const emissionsData: any[] = [];
  for (const v of insertedVessels) {
    for (const m of months) {
      const baseEmission = v.status === "drydock" ? 0 : (v.dwt / 1000) * (0.8 + rng() * 0.4);
      emissionsData.push({
        vesselId: v.id,
        date: `${m}-15`,
        co2Tons: Math.round(baseEmission * 10) / 10,
        fuelConsumedTons: Math.round(baseEmission * 3.2 * 10) / 10,
        fuelType: "VLSFO",
        distanceNm: v.status === "drydock" ? 0 : Math.round(2000 + rng() * 4000),
        ciiValue: v.cii === "A" ? 3.2 + rng() * 0.5 : v.cii === "B" ? 4.0 + rng() * 0.5 : v.cii === "C" ? 5.0 + rng() * 0.5 : 6.0 + rng() * 0.5,
        eexiValue: v.eexi === "compliant" ? 2.5 + rng() * 0.8 : 4.0 + rng() * 0.5,
      });
    }
  }
  await db.insert(vesselEmissionsTable).values(emissionsData);

  const alertsSeed = [
    { alertCode: "CMD-A1", vesselCode: "VLGC-009", pillar: "synthetics", severity: "critical", title: "Clermont CII rating D — operational restrictions imminent" },
    { alertCode: "CMD-A2", vesselCode: "VLGC-003", pillar: "infrastructure", severity: "critical", title: "Captain Markos — engine bearing temperature anomaly detected" },
    { alertCode: "CMD-A3", vesselCode: null, pillar: "synthetics", severity: "high", title: "3 vessel certificates expiring within 30 days" },
    { alertCode: "CMD-A4", vesselCode: "VLGC-003", pillar: "intelligence", severity: "high", title: "Fuel consumption anomaly — Captain Markos +12% above baseline" },
    { alertCode: "CMD-A5", vesselCode: "VLGC-005", pillar: "experience", severity: "medium", title: "Demurrage exposure $145k on Voyage V-2024-089" },
    { alertCode: "CMD-A6", vesselCode: "VLGC-007", pillar: "apm", severity: "medium", title: "Continental TCE below fleet average for 3 consecutive voyages" },
    { alertCode: "CMD-A7", vesselCode: "VLGC-012", pillar: "infrastructure", severity: "medium", title: "Champion ballast water treatment system — calibration due" },
    { alertCode: "CMD-A8", vesselCode: null, pillar: "synthetics", severity: "high", title: "EU ETS compliance — Q1 allowance submission deadline Mar 31" },
  ];
  for (const a of alertsSeed) {
    const vesselId = a.vesselCode ? vesselMap.get(a.vesselCode) ?? null : null;
    await db.insert(vesselAlertsTable).values({
      alertCode: a.alertCode,
      vesselId,
      pillar: a.pillar,
      severity: a.severity,
      title: a.title,
    });
  }

  for (const v of insertedVessels) {
    const certNames = [
      "Safety Management Certificate",
      "International Ship Security Certificate",
      "Document of Compliance",
      "P&I Insurance",
      "Class Certificate",
    ];
    for (const cn of certNames) {
      const daysUntilExpiry = Math.round(20 + rng() * 600);
      const expiry = new Date(Date.now() + daysUntilExpiry * 86400000).toISOString().split("T")[0];
      await db.insert(vesselCertificatesTable).values({
        vesselId: v.id,
        name: cn,
        expiryDate: expiry,
        status: daysUntilExpiry < 30 ? "expiring-soon" : "valid",
      });
    }
  }

  const maintenanceSeed = [
    { vesselCode: "VLGC-003", system: "Main Engine Bearings", type: "corrective", description: "Elevated bearing temperatures detected", severity: "high", status: "pending", scheduledDate: "2026-05-15", estimatedCost: 285000 },
    { vesselCode: "VLGC-012", system: "Cargo Compressor #2", type: "corrective", description: "Abnormal vibration detected", severity: "medium", status: "pending", scheduledDate: "2026-04-20", estimatedCost: 145000 },
    { vesselCode: "VLGC-007", system: "Hull Coating", type: "scheduled", description: "Hull coating deterioration", severity: "medium", status: "planned", scheduledDate: "2026-06-01", estimatedCost: 1200000 },
    { vesselCode: "VLGC-009", system: "Cargo Tank Coating", type: "scheduled", description: "Full cargo tank recoating during drydock", severity: "high", status: "in-progress", scheduledDate: "2026-04-05", estimatedCost: 2800000 },
  ];
  for (const m of maintenanceSeed) {
    const vesselId = vesselMap.get(m.vesselCode);
    if (!vesselId) continue;
    await db.insert(vesselMaintenanceEventsTable).values({
      vesselId,
      system: m.system,
      type: m.type,
      description: m.description,
      severity: m.severity,
      status: m.status,
      scheduledDate: m.scheduledDate,
      estimatedCost: m.estimatedCost,
    });
  }

  const shipmentSeed = [
    { shipmentCode: "SHP-001", vesselCode: "VLGC-001", voyageCode: "V-2026-031", cargo: "Propane", volume: "44,000 MT", origin: "Ras Tanura", destination: "Chiba, Japan", progress: 35, eta: "2026-04-12", customer: "Itochu", slaStatus: "on-track", demurrageRisk: 0, laytimeDays: 0, laytimeAllowed: 3, riskScore: 22, riskFactors: JSON.stringify([{ factor: "Strait of Hormuz transit", severity: "medium", confidence: 85, category: "geopolitical" }, { factor: "Seasonal monsoon risk", severity: "low", confidence: 60, category: "weather" }]) },
    { shipmentCode: "SHP-002", vesselCode: "VLGC-002", voyageCode: "V-2026-029", cargo: "Butane", volume: "42,000 MT", origin: "Jubail", destination: "Haldia, India", progress: 52, eta: "2026-04-02", customer: "BPCL", slaStatus: "on-track", demurrageRisk: 12000, laytimeDays: 1.5, laytimeAllowed: 2, riskScore: 38, riskFactors: JSON.stringify([{ factor: "Haldia port congestion", severity: "high", confidence: 78, category: "port-congestion" }, { factor: "Indian Ocean weather patterns", severity: "medium", confidence: 65, category: "weather" }, { factor: "Laytime approaching limit", severity: "medium", confidence: 72, category: "commercial" }]) },
    { shipmentCode: "SHP-003", vesselCode: "VLGC-004", voyageCode: "V-2026-033", cargo: "Propane/Butane", volume: "43,500 MT", origin: "Das Island", destination: "Ulsan, S. Korea", progress: 68, eta: "2026-03-31", customer: "SK Gas", slaStatus: "on-track", demurrageRisk: 0, laytimeDays: 0.5, laytimeAllowed: 2.5, riskScore: 18, riskFactors: JSON.stringify([{ factor: "Malacca Strait piracy zone", severity: "medium", confidence: 70, category: "security" }]) },
    { shipmentCode: "SHP-004", vesselCode: "VLGC-006", voyageCode: "V-2026-032", cargo: "Propane/Butane", volume: "44,000 MT", origin: "Houston", destination: "ARA (Amsterdam-Rotterdam-Antwerp)", progress: 12, eta: "2026-04-18", customer: "Vitol", slaStatus: "on-track", demurrageRisk: 0, laytimeDays: 0, laytimeAllowed: 4, riskScore: 32, riskFactors: JSON.stringify([{ factor: "North Atlantic winter storms", severity: "high", confidence: 82, category: "weather" }, { factor: "ARA port congestion", severity: "medium", confidence: 68, category: "port-congestion" }]) },
    { shipmentCode: "SHP-005", vesselCode: "VLGC-008", voyageCode: "V-2026-035", cargo: "Propane", volume: "43,000 MT", origin: "Ras Tanura", destination: "Ningbo, China", progress: 40, eta: "2026-04-08", customer: "Sinopec", slaStatus: "on-track", demurrageRisk: 0, laytimeDays: 0, laytimeAllowed: 3, riskScore: 35, riskFactors: JSON.stringify([{ factor: "Gulf of Aden piracy risk", severity: "high", confidence: 88, category: "security" }, { factor: "Bab el-Mandeb geopolitical tension", severity: "medium", confidence: 75, category: "geopolitical" }]) },
    { shipmentCode: "SHP-006", vesselCode: "VLGC-013", voyageCode: "V-2026-034", cargo: "Propane", volume: "42,000 MT", origin: "Jubail", destination: "Yokohama, Japan", progress: 95, eta: "2026-03-25", customer: "JERA", slaStatus: "on-track", demurrageRisk: 0, laytimeDays: 1, laytimeAllowed: 2.5, riskScore: 8, riskFactors: JSON.stringify([{ factor: "Minor weather delay possible", severity: "low", confidence: 45, category: "weather" }]) },
    { shipmentCode: "SHP-007", vesselCode: "VLGC-005", voyageCode: "V-2026-030", cargo: "Propane", volume: "40,000 MT", origin: "Ras Tanura", destination: "Mundra, India", progress: 5, eta: "2026-04-05", customer: "Aramco Trading", slaStatus: "pending-load", demurrageRisk: 0, laytimeDays: 0, laytimeAllowed: 2, riskScore: 15, riskFactors: JSON.stringify([{ factor: "Loading berth availability", severity: "low", confidence: 55, category: "port-congestion" }]) },
    { shipmentCode: "SHP-008", vesselCode: "VLGC-010", voyageCode: "V-2026-036", cargo: "Butane", volume: "41,500 MT", origin: "Das Island", destination: "Chiba, Japan", progress: 78, eta: "2026-03-28", customer: "Marubeni", slaStatus: "minor-delay", demurrageRisk: 45000, laytimeDays: 2.2, laytimeAllowed: 2.5, riskScore: 42, riskFactors: JSON.stringify([{ factor: "Chiba port congestion - berth delay", severity: "high", confidence: 90, category: "port-congestion" }, { factor: "Laytime nearly exhausted", severity: "high", confidence: 92, category: "commercial" }, { factor: "Demurrage clock ticking", severity: "critical", confidence: 95, category: "financial" }]) },
  ];
  for (const s of shipmentSeed) {
    const vesselId = vesselMap.get(s.vesselCode)!;
    const voyage = await db.select().from(vesselVoyagesTable).where(eq(vesselVoyagesTable.voyageCode, s.voyageCode));
    await db.insert(vesselShipmentsTable).values({
      shipmentCode: s.shipmentCode,
      vesselId,
      voyageId: voyage[0]?.id,
      cargo: s.cargo,
      volume: s.volume,
      origin: s.origin,
      destination: s.destination,
      progress: s.progress,
      eta: s.eta,
      customer: s.customer,
      slaStatus: s.slaStatus,
      demurrageRisk: s.demurrageRisk,
      laytimeDays: s.laytimeDays,
      laytimeAllowed: s.laytimeAllowed,
      riskScore: s.riskScore,
      riskFactors: s.riskFactors,
    });
  }

  const logEntries = [
    { logCode: "LOG-001", vesselCode: "VLGC-013", eventType: "cargo", severity: "info", message: "Cargo discharge commenced at Yokohama — 42,000 MT propane", vesselName: "Crusader", voyageCode: "V-2026-034" },
    { logCode: "LOG-002", vesselCode: "VLGC-009", eventType: "maintenance", severity: "critical", message: "Drydock Phase 2 initiated — hull coating removal in progress", vesselName: "Clermont", voyageCode: null },
    { logCode: "LOG-003", vesselCode: "VLGC-003", eventType: "maintenance", severity: "warning", message: "Engine bearing temperature elevated — monitoring initiated per Class requirement", vesselName: "Captain Markos", voyageCode: "V-2026-028" },
    { logCode: "LOG-004", vesselCode: "VLGC-001", eventType: "voyage", severity: "info", message: "Transiting Strait of Hormuz — outbound laden passage, ETA Japan Apr 12", vesselName: "Corvette", voyageCode: "V-2026-031" },
    { logCode: "LOG-005", vesselCode: "VLGC-005", eventType: "port", severity: "info", message: "Arrived Ras Tanura — berthing at Terminal 4 for propane loading", vesselName: "Cougar", voyageCode: "V-2026-030" },
    { logCode: "LOG-006", vesselCode: "VLGC-006", eventType: "bunker", severity: "info", message: "Bunkering completed — 2,800 MT VLSFO loaded at Houston anchorage", vesselName: "Commodore", voyageCode: "V-2026-032" },
    { logCode: "LOG-007", vesselCode: "VLGC-012", eventType: "compliance", severity: "warning", message: "Ballast water management system calibration overdue — scheduled for next port call", vesselName: "Champion", voyageCode: "V-2026-027" },
    { logCode: "LOG-008", vesselCode: "VLGC-002", eventType: "voyage", severity: "info", message: "Passing 10°N waypoint — Indian Ocean transit proceeding nominal, ETA Haldia Apr 2", vesselName: "Concorde", voyageCode: "V-2026-029" },
    { logCode: "LOG-009", vesselCode: "VLGC-004", eventType: "cargo", severity: "info", message: "Cargo condition monitoring — tank temperatures within specification, boil-off rate 0.08%", vesselName: "Corsair", voyageCode: "V-2026-033" },
    { logCode: "LOG-010", vesselCode: "VLGC-007", eventType: "voyage", severity: "info", message: "Bay of Biscay transit — moderate seas, maintaining 13.8 kn ballast speed", vesselName: "Continental", voyageCode: "V-2026-026" },
    { logCode: "LOG-011", vesselCode: "VLGC-008", eventType: "voyage", severity: "info", message: "Transiting Gulf of Aden — armed security team embarked, UKMTO reporting active", vesselName: "Cresida", voyageCode: "V-2026-035" },
    { logCode: "LOG-012", vesselCode: "VLGC-010", eventType: "port", severity: "info", message: "Hong Kong pilot boarded — proceeding to anchorage for cargo tank inspection", vesselName: "Constellation", voyageCode: "V-2026-036" },
    { logCode: "LOG-013", vesselCode: "VLGC-011", eventType: "bunker", severity: "info", message: "Fuel ROB report — 3,400 MT VLSFO remaining, sufficient for ballast leg to AG", vesselName: "Challenger", voyageCode: "V-2026-025" },
    { logCode: "LOG-014", vesselCode: null, eventType: "compliance", severity: "warning", message: "Fleet-wide EU ETS Q1 allowance submission deadline approaching — 6 days remaining", vesselName: null, voyageCode: null },
    { logCode: "LOG-015", vesselCode: "VLGC-005", eventType: "crew", severity: "info", message: "Crew change completed — 8 officers and ratings embarked at Ras Tanura", vesselName: "Cougar", voyageCode: "V-2026-030" },
  ];
  for (const l of logEntries) {
    const vesselId = l.vesselCode ? vesselMap.get(l.vesselCode) ?? null : null;
    await db.insert(vesselLogsTable).values({
      logCode: l.logCode,
      vesselId,
      eventType: l.eventType,
      severity: l.severity,
      message: l.message,
      vesselName: l.vesselName,
      voyageCode: l.voyageCode,
    });
  }

  await db.insert(vesselRoutesTable).values([
    { name: "AG-Japan", originPort: "Ras Tanura", destPort: "Chiba", distanceNm: 6800, typicalDays: 25, waypoints: JSON.stringify([[26.68,50.17],[24.5,57.0],[12.0,65.0],[5.0,95.0],[5.0,105.0],[22.0,114.0],[35.6,140.1]]) },
    { name: "AG-India", originPort: "Jubail", destPort: "Haldia", distanceNm: 3200, typicalDays: 12, waypoints: JSON.stringify([[27.01,49.62],[24.5,57.0],[12.5,72.0],[22.03,88.11]]) },
    { name: "AG-South Korea", originPort: "Das Island", destPort: "Ulsan", distanceNm: 6500, typicalDays: 23, waypoints: JSON.stringify([[25.15,52.87],[24.5,57.0],[5.0,95.0],[5.0,105.0],[22.0,114.0],[35.5,129.38]]) },
    { name: "USG-Europe", originPort: "Houston", destPort: "ARA", distanceNm: 5200, typicalDays: 18, waypoints: JSON.stringify([[29.76,-95.36],[25.0,-80.0],[32.0,-65.0],[40.0,-40.0],[48.0,-5.0],[51.95,4.50]]) },
    { name: "AG-China", originPort: "Ras Tanura", destPort: "Ningbo", distanceNm: 6200, typicalDays: 22, waypoints: JSON.stringify([[26.68,50.17],[12.0,45.0],[5.0,73.0],[5.0,105.0],[22.0,114.0],[29.87,121.54]]) },
  ]);

  seeded = true;
  console.log("[vessels] Seed data loaded successfully");
}

router.get("/vessels/health", (_req, res) => {
  res.json({ ok: true, group: "vessels", timestamp: new Date().toISOString() });
});

const responseCache = new Map<string, any>();
function cached<T>(key: string, fn: () => T): T {
  if (!responseCache.has(key)) responseCache.set(key, fn());
  return responseCache.get(key);
}

function generateTceHistory(baseTce: number) {
  const rng = seededRng(baseTce);
  const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  return months.map((m, i) => ({
    month: m,
    tce: Math.round(baseTce + (rng() - 0.4) * 15000 + i * 800),
  }));
}

function generateSpeedConsumption() {
  return [
    { speed: 12.0, consumption: 38 }, { speed: 13.0, consumption: 44 },
    { speed: 14.0, consumption: 52 }, { speed: 14.5, consumption: 57 },
    { speed: 15.0, consumption: 63 }, { speed: 15.5, consumption: 70 },
    { speed: 16.0, consumption: 78 }, { speed: 16.5, consumption: 87 },
    { speed: 17.0, consumption: 97 }, { speed: 17.5, consumption: 108 },
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

router.get("/vessels/command-center", async (_req, res) => {
  try {
    await ensureSeeded();
    const allVessels = await db.select().from(vesselsTable);
    const active = allVessels.filter(v => v.status !== "drydock");
    const avgTce = Math.round(active.filter(v => v.tce > 0).reduce((s, v) => s + v.tce, 0) / active.filter(v => v.tce > 0).length);
    const fleetUtil = Math.round(active.reduce((s, v) => s + v.utilization, 0) / active.length);

    const alerts = await db.select().from(vesselAlertsTable).orderBy(desc(vesselAlertsTable.createdAt));
    const alertsByPillar: Record<string, number> = {};
    for (const a of alerts) {
      if (!a.acknowledged) {
        alertsByPillar[a.pillar] = (alertsByPillar[a.pillar] || 0) + 1;
      }
    }

    const voyages = await db.select().from(vesselVoyagesTable);
    const avgDisruption = voyages.length > 0 ? Math.round(voyages.reduce((s, v) => s + v.riskScore, 0) / voyages.length) : 0;

    const pillars = [
      { id: "apm", name: "Fleet APM", status: "healthy", score: 94, metric: `$${(avgTce / 1000).toFixed(1)}k avg TCE`, trend: [88, 90, 87, 92, 91, 94], worst: "Captain Markos — $41.2k TCE", alerts: alertsByPillar["apm"] || 0 },
      { id: "infrastructure", name: "Infrastructure", status: "warning", score: 82, metric: "82% fleet health", trend: [90, 88, 85, 83, 84, 82], worst: "Clermont — Drydock", alerts: alertsByPillar["infrastructure"] || 0 },
      { id: "logs", name: "Logs", status: "healthy", score: 97, metric: "1,247 events / 24h", trend: [95, 94, 96, 97, 96, 97], worst: null, alerts: alertsByPillar["logs"] || 0 },
      { id: "experience", name: "Digital Experience", status: "healthy", score: 91, metric: `${avgDisruption}% avg disruption`, trend: [85, 87, 88, 90, 89, 91], worst: "Voyage V-2024-089 — laytime exceeded", alerts: alertsByPillar["experience"] || 0 },
      { id: "synthetics", name: "Synthetics", status: "critical", score: 71, metric: "3 certs expiring", trend: [92, 88, 85, 80, 75, 71], worst: "Clermont — CII rating D", alerts: alertsByPillar["synthetics"] || 0 },
      { id: "intelligence", name: "Applied Intelligence", status: "healthy", score: 89, metric: "4 anomalies detected", trend: [82, 84, 86, 87, 88, 89], worst: "Captain Markos — fuel anomaly", alerts: alertsByPillar["intelligence"] || 0 },
    ];

    const totalEmissions = await db.select({
      total: sql<number>`COALESCE(SUM(${vesselEmissionsTable.co2Tons}), 0)`,
    }).from(vesselEmissionsTable);

    const kpiRibbon = [
      { label: "Fleet Utilization", value: `${fleetUtil}%`, change: "+2.1%", direction: "up" },
      { label: "Avg TCE", value: `$${(avgTce / 1000).toFixed(1)}k`, change: "+$3.2k", direction: "up" },
      { label: "Total Emissions", value: `${Math.round(Number(totalEmissions[0]?.total || 0)).toLocaleString()} MT`, change: "-4.2%", direction: "down" },
      { label: "Compliance Score", value: "92%", change: "-1%", direction: "down" },
      { label: "Active Alerts", value: `${alerts.filter(a => !a.acknowledged).length}`, change: "+3", direction: "up" },
      { label: "Vessels Trading", value: `${allVessels.filter(v => v.status === "laden" || v.status === "ballast").length}/${allVessels.length}`, change: "0", direction: "flat" },
    ];

    const vesselNames = new Map(allVessels.map(v => [v.id, v.name]));
    const alertFeed = alerts.map(a => ({
      id: a.alertCode,
      pillar: a.pillar,
      severity: a.severity,
      title: a.title,
      timestamp: a.createdAt.toISOString(),
      vessel: a.vesselId ? vesselNames.get(a.vesselId) || null : null,
      acknowledged: a.acknowledged,
    }));

    res.json({
      pillars,
      kpiRibbon,
      alertFeed,
      fleetSummary: {
        total: allVessels.length,
        laden: allVessels.filter(v => v.status === "laden").length,
        ballast: allVessels.filter(v => v.status === "ballast").length,
        atPort: allVessels.filter(v => v.status === "at-port").length,
        drydock: allVessels.filter(v => v.status === "drydock").length,
      },
    });
  } catch (err) {
    console.error("[vessels] command-center error:", err);
    res.status(500).json({ error: "Failed to load command center data" });
  }
});

router.get("/vessels/apm", async (_req, res) => {
  try {
    await ensureSeeded();
    const rng = seededRng(99);
    const allVessels = await db.select().from(vesselsTable);

    const vessels = allVessels.map(v => ({
      id: v.vesselCode,
      name: v.name,
      imo: v.imo,
      flag: v.flag,
      type: v.type,
      dwt: v.dwt,
      cbm: v.cbm,
      built: v.built,
      class: v.class,
      status: v.status,
      speed: v.speed,
      lat: v.lat,
      lng: v.lng,
      route: v.route,
      charterer: v.charterer,
      tce: v.tce,
      utilization: v.utilization,
      cii: v.cii,
      eexi: v.eexi,
      tceHistory: generateTceHistory(v.tce || 50000),
      speedConsumption: generateSpeedConsumption(),
      voyagePnl: generateVoyagePnl(v.tce || 50000),
      ladenDays: Math.round(180 + rng() * 80),
      ballastDays: Math.round(60 + rng() * 40),
      portDays: Math.round(15 + rng() * 20),
      voyageCount: Math.round(6 + rng() * 6),
      revenueYtd: Math.round((v.tce || 50000) * (180 + rng() * 80)),
    }));

    const fleetAvgTce = Math.round(vessels.filter(v => v.tce > 0).reduce((s, v) => s + v.tce, 0) / vessels.filter(v => v.tce > 0).length);
    const totalRevenue = vessels.reduce((s, v) => s + v.revenueYtd, 0);
    const fleetUtil = Math.round(vessels.reduce((s, v) => s + v.utilization, 0) / vessels.length);
    const fleetTceHistory = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map((m, i) => ({
      month: m,
      fleetAvg: Math.round(fleetAvgTce + (rng() - 0.3) * 8000 + i * 1200),
      marketAvg: Math.round(45000 + (rng() - 0.5) * 10000 + i * 600),
    }));
    const utilizationHistory = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map((m, i) => ({
      month: m,
      utilization: Math.round(fleetUtil + (rng() - 0.4) * 8 + i * 0.3),
      target: 92,
    }));
    const utilizationHeatmap = allVessels.filter(v => v.status !== "drydock").map(v => ({
      vessel: v.name,
      months: ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map(m => ({
        month: m,
        utilization: Math.round(v.utilization + (rng() - 0.5) * 20),
      })),
    }));

    res.json({
      vessels,
      fleetMetrics: { avgTce: fleetAvgTce, totalRevenue, fleetUtilization: fleetUtil, totalVoyages: vessels.reduce((s, v) => s + v.voyageCount, 0) },
      fleetTceHistory,
      utilizationHistory,
      utilizationHeatmap,
    });
  } catch (err) {
    console.error("[vessels] apm error:", err);
    res.status(500).json({ error: "Failed to load APM data" });
  }
});

router.get("/vessels/infrastructure", async (_req, res) => {
  try {
    await ensureSeeded();
    const rng = seededRng(77);
    const allVessels = await db.select().from(vesselsTable);
    const maintenance = await db.select().from(vesselMaintenanceEventsTable);

    const vesselHealth = allVessels.map(v => {
      const vesselMaint = maintenance.filter(m => m.vesselId === v.id);
      return {
        id: v.vesselCode,
        name: v.name,
        status: v.status,
        overallHealth: v.status === "drydock" ? 45 : Math.round(70 + rng() * 25),
        engineHours: v.status === "drydock" ? 48200 : Math.round(8000 + rng() * 40000),
        engineHoursRemaining: v.status === "drydock" ? 0 : Math.round(5000 + rng() * 20000),
        fuelSystem: v.status === "drydock" ? "offline" : (rng() > 0.85 ? "warning" : "operational"),
        hullCondition: v.status === "drydock" ? 52 : Math.round(65 + rng() * 30),
        nextDrydock: v.status === "drydock" ? "In Progress" : `${Math.round(90 + rng() * 900)} days`,
        nextDrydockDate: v.status === "drydock" ? null : new Date(Date.now() + (90 + rng() * 900) * 86400000).toISOString().split("T")[0],
        maintenanceBacklog: vesselMaint.filter(m => m.status === "pending" || m.status === "planned").length || Math.round(rng() * 12),
        maintenancePriority: rng() > 0.7 ? "high" : (rng() > 0.4 ? "medium" : "low"),
        lastSurvey: new Date(Date.now() - rng() * 180 * 86400000).toISOString().split("T")[0],
        built: v.built,
        systems: [
          { name: "Main Engine", status: v.status === "drydock" ? "offline" : "operational", health: v.status === "drydock" ? 40 : Math.round(75 + rng() * 20) },
          { name: "Aux Engine 1", status: "operational", health: Math.round(70 + rng() * 25) },
          { name: "Aux Engine 2", status: rng() > 0.9 ? "degraded" : "operational", health: Math.round(65 + rng() * 30) },
          { name: "Cargo System", status: v.status === "drydock" ? "maintenance" : "operational", health: Math.round(70 + rng() * 25) },
          { name: "Navigation", status: "operational", health: Math.round(85 + rng() * 12) },
          { name: "Safety Systems", status: "operational", health: Math.round(80 + rng() * 18) },
        ],
      };
    });

    const fleetHealthScore = Math.round(vesselHealth.reduce((s, v) => s + v.overallHealth, 0) / vesselHealth.length);
    res.json({
      vesselHealth,
      fleetHealthScore,
      totalMaintenanceBacklog: vesselHealth.reduce((s, v) => s + v.maintenanceBacklog, 0),
      criticalSystems: vesselHealth.filter(v => v.overallHealth < 60).length,
    });
  } catch (err) {
    console.error("[vessels] infrastructure error:", err);
    res.status(500).json({ error: "Failed to load infrastructure data" });
  }
});

router.get("/vessels/logs", async (_req, res) => {
  try {
    await ensureSeeded();
    const logs = await db.select().from(vesselLogsTable).orderBy(desc(vesselLogsTable.createdAt));

    const logEntries = logs.map(l => ({
      id: l.logCode,
      timestamp: l.createdAt.toISOString(),
      vessel: l.vesselName,
      vesselId: null,
      eventType: l.eventType,
      severity: l.severity,
      message: l.message,
      voyage: l.voyageCode,
    }));

    const eventTypes = ["voyage", "port", "bunker", "cargo", "compliance", "maintenance", "crew"];
    const severities = ["info", "warning", "critical"];
    res.json({ logs: logEntries, totalCount: logEntries.length, eventTypes, severities });
  } catch (err) {
    console.error("[vessels] logs error:", err);
    res.status(500).json({ error: "Failed to load logs" });
  }
});

router.get("/vessels/experience", async (_req, res) => {
  try {
    await ensureSeeded();
    const shipments = await db.select().from(vesselShipmentsTable);
    const allVessels = await db.select().from(vesselsTable);
    const vesselNames = new Map(allVessels.map(v => [v.id, v.name]));
    const voyages = await db.select().from(vesselVoyagesTable);
    const voyageCodes = new Map(voyages.map(v => [v.id, v.voyageCode]));

    const shipmentData = shipments.map(s => ({
      id: s.shipmentCode,
      vessel: vesselNames.get(s.vesselId) || "Unknown",
      voyage: s.voyageId ? voyageCodes.get(s.voyageId) || "" : "",
      cargo: s.cargo,
      volume: s.volume,
      origin: s.origin,
      destination: s.destination,
      progress: s.progress,
      eta: s.eta,
      customer: s.customer,
      slaStatus: s.slaStatus,
      demurrageRisk: s.demurrageRisk,
      laytimeDays: s.laytimeDays,
      laytimeAllowed: s.laytimeAllowed,
      riskScore: s.riskScore,
      riskFactors: s.riskFactors ? JSON.parse(s.riskFactors) : [],
    }));

    const charterPerformance = [
      { month: "Oct", adherence: 92, target: 95 },
      { month: "Nov", adherence: 94, target: 95 },
      { month: "Dec", adherence: 89, target: 95 },
      { month: "Jan", adherence: 91, target: 95 },
      { month: "Feb", adherence: 93, target: 95 },
      { month: "Mar", adherence: 91, target: 95 },
    ];

    const totalDemurrageExposure = shipmentData.reduce((s, sh) => s + sh.demurrageRisk, 0);
    const overallSla = Math.round(shipmentData.filter(s => s.slaStatus === "on-track").length / shipmentData.length * 100);

    res.json({
      shipments: shipmentData,
      charterPerformance,
      metrics: {
        totalDemurrageExposure,
        overallSlaAdherence: overallSla,
        activeShipments: shipmentData.length,
        onTimeDelivery: 94,
        customerSatisfaction: 4.2,
      },
    });
  } catch (err) {
    console.error("[vessels] experience error:", err);
    res.status(500).json({ error: "Failed to load experience data" });
  }
});

router.get("/vessels/synthetics", async (_req, res) => {
  try {
    await ensureSeeded();
    const allVessels = await db.select().from(vesselsTable);
    const certs = await db.select().from(vesselCertificatesTable);
    const rng = seededRng(55);

    const complianceCards = allVessels.map(v => {
      const vesselCerts = certs.filter(c => c.vesselId === v.id);
      return {
        id: v.vesselCode,
        name: v.name,
        ciiRating: v.cii,
        ciiScore: v.cii === "A" ? Math.round(85 + rng() * 10) : v.cii === "B" ? Math.round(70 + rng() * 12) : v.cii === "C" ? Math.round(55 + rng() * 12) : Math.round(30 + rng() * 15),
        ciiTrend: v.cii === "D" ? "declining" : (rng() > 0.3 ? "stable" : "improving"),
        eexiStatus: v.eexi,
        pscReadiness: v.status === "drydock" ? 45 : Math.round(70 + rng() * 25),
        sanctionsScreening: "clear",
        certificates: vesselCerts.map(c => ({
          name: c.name,
          expiry: c.expiryDate,
          status: c.status,
        })),
      };
    });

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

    res.json({
      complianceCards,
      upcomingDeadlines,
      metrics: {
        fleetComplianceScore: fleetCompliance,
        expiringCertificates: expiringCerts,
        pscDeficiencies: 2,
        sanctionsAlerts: 0,
        ciiABRatio: Math.round(complianceCards.filter(c => c.ciiRating === "A" || c.ciiRating === "B").length / complianceCards.length * 100),
      },
    });
  } catch (err) {
    console.error("[vessels] synthetics error:", err);
    res.status(500).json({ error: "Failed to load synthetics data" });
  }
});

router.get("/vessels/intelligence", async (_req, res) => {
  try {
    await ensureSeeded();

    const anomalies = [
      { id: "ANM-001", vessel: "Captain Markos", type: "fuel-consumption", severity: "high", message: "Fuel consumption 12% above baseline for current laden voyage — potential hull fouling or engine degradation", detected: "2026-03-25T05:00:00Z", confidence: 87, baseline: 65, actual: 72.8 },
      { id: "ANM-002", vessel: "Continental", type: "speed-deviation", severity: "medium", message: "Average speed 8% below charter party warranted speed on last 3 ballast voyages", detected: "2026-03-24T14:00:00Z", confidence: 74, baseline: 15.0, actual: 13.8 },
      { id: "ANM-003", vessel: "Champion", type: "cargo-system", severity: "medium", message: "Cargo compressor #2 vibration levels trending upward — predictive maintenance window recommended", detected: "2026-03-24T22:00:00Z", confidence: 81, baseline: 2.4, actual: 3.8 },
      { id: "ANM-004", vessel: "Cougar", type: "fuel-consumption", severity: "low", message: "Port fuel consumption 5% above seasonal average — likely cold weather auxiliary load", detected: "2026-03-23T16:00:00Z", confidence: 62, baseline: 8.5, actual: 8.9 },
    ];

    const maintenancePredictions = await db.select().from(vesselMaintenanceEventsTable);
    const allVessels = await db.select().from(vesselsTable);
    const vesselNames = new Map(allVessels.map(v => [v.id, v.name]));

    const predictions = maintenancePredictions.map(m => ({
      vessel: vesselNames.get(m.vesselId) || "Unknown",
      system: m.system,
      predictedDate: m.scheduledDate,
      confidence: Math.round(70 + Math.random() * 25),
      severity: m.severity,
      estimatedCost: m.estimatedCost || 0,
      recommendation: m.description,
    }));

    const freightForecast = [
      { month: "Jan", actual: 45200, forecast: null }, { month: "Feb", actual: 52800, forecast: null },
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
      summary: "Fleet operating at 89% overall utilization with average TCE of $57.3k — above market average of $48.5k. Two vessels (Captain Markos and Clermont) require immediate attention. EU ETS Q1 submission deadline in 6 days. Freight market showing bullish Q2 outlook.",
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

    res.json({ anomalies, maintenancePredictions: predictions, freightForecast, emissionsTrajectory, executiveBriefing });
  } catch (err) {
    console.error("[vessels] intelligence error:", err);
    res.status(500).json({ error: "Failed to load intelligence data" });
  }
});

router.get("/vessels/fleet", async (_req, res) => {
  try {
    await ensureSeeded();
    const allVessels = await db.select().from(vesselsTable);
    const active = allVessels.filter(v => v.status !== "drydock");
    const alerts = await db.select().from(vesselAlertsTable).where(eq(vesselAlertsTable.acknowledged, false));
    const voyages = await db.select().from(vesselVoyagesTable);
    const routes = await db.select().from(vesselRoutesTable);
    const ports = await db.select().from(vesselPortsTable);

    res.json({
      summary: {
        totalVessels: allVessels.length,
        activeVessels: allVessels.filter(v => v.status === "laden" || v.status === "ballast").length,
        atPort: allVessels.filter(v => v.status === "at-port").length,
        anchored: 0,
        avgUtilization: Math.round(active.reduce((s, v) => s + v.utilization, 0) / active.length),
        activeAlerts: alerts.length,
        routesInProgress: allVessels.filter(v => v.status === "laden" || v.status === "ballast").length,
      },
      vessels: allVessels.map(v => ({
        id: v.vesselCode,
        name: v.name,
        imo: v.imo,
        flag: v.flag,
        type: v.type,
        dwt: v.dwt,
        cbm: v.cbm,
        built: v.built,
        class: v.class,
        status: v.status,
        speed: v.speed,
        lat: v.lat,
        lng: v.lng,
        route: v.route,
        charterer: v.charterer,
        tce: v.tce,
        utilization: v.utilization,
        cii: v.cii,
        eexi: v.eexi,
      })),
      voyages: voyages.map(v => ({
        id: v.id,
        voyageCode: v.voyageCode,
        vesselId: v.vesselId,
        origin: v.origin,
        destination: v.destination,
        originLat: v.originLat,
        originLng: v.originLng,
        destLat: v.destLat,
        destLng: v.destLng,
        progress: v.progress,
        eta: v.eta,
        riskScore: v.riskScore,
        weatherRisk: v.weatherRisk,
        portCongestionRisk: v.portCongestionRisk,
        geopoliticalRisk: v.geopoliticalRisk,
        piracyRisk: v.piracyRisk,
        status: v.status,
      })),
      routes,
      ports,
    });
  } catch (err) {
    console.error("[vessels] fleet error:", err);
    res.status(500).json({ error: "Failed to load fleet data" });
  }
});

router.get("/vessels/emissions", async (_req, res) => {
  try {
    await ensureSeeded();
    const allVessels = await db.select().from(vesselsTable);
    const emissions = await db.select().from(vesselEmissionsTable).orderBy(asc(vesselEmissionsTable.date));

    const vesselNames = new Map(allVessels.map(v => [v.id, v.name]));
    const vesselCodes = new Map(allVessels.map(v => [v.id, v.vesselCode]));

    const byVessel: Record<number, any[]> = {};
    for (const e of emissions) {
      if (!byVessel[e.vesselId]) byVessel[e.vesselId] = [];
      byVessel[e.vesselId].push(e);
    }

    const vesselEmissions = allVessels.map(v => {
      const records = byVessel[v.id] || [];
      const totalCo2 = records.reduce((s, r) => s + r.co2Tons, 0);
      const totalFuel = records.reduce((s, r) => s + r.fuelConsumedTons, 0);
      const avgCii = records.length > 0 ? records.reduce((s, r) => s + (r.ciiValue || 0), 0) / records.length : 0;
      return {
        vesselCode: v.vesselCode,
        name: v.name,
        ciiRating: v.cii,
        eexiStatus: v.eexi,
        totalCo2: Math.round(totalCo2),
        totalFuel: Math.round(totalFuel),
        avgCiiValue: Math.round(avgCii * 100) / 100,
        trend: records.map(r => ({
          date: r.date,
          co2Tons: r.co2Tons,
          fuelConsumedTons: r.fuelConsumedTons,
          ciiValue: r.ciiValue,
        })),
      };
    });

    const fleetTotalCo2 = vesselEmissions.reduce((s, v) => s + v.totalCo2, 0);
    const fleetTotalFuel = vesselEmissions.reduce((s, v) => s + v.totalFuel, 0);

    const monthlyFleet: Record<string, { co2: number; fuel: number; count: number }> = {};
    for (const e of emissions) {
      const month = e.date.substring(0, 7);
      if (!monthlyFleet[month]) monthlyFleet[month] = { co2: 0, fuel: 0, count: 0 };
      monthlyFleet[month].co2 += e.co2Tons;
      monthlyFleet[month].fuel += e.fuelConsumedTons;
      monthlyFleet[month].count++;
    }

    const fleetTrend = Object.entries(monthlyFleet)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        co2Tons: Math.round(data.co2),
        fuelConsumedTons: Math.round(data.fuel),
        target: Math.round(data.co2 * 0.9),
      }));

    const ciiDistribution = {
      A: allVessels.filter(v => v.cii === "A").length,
      B: allVessels.filter(v => v.cii === "B").length,
      C: allVessels.filter(v => v.cii === "C").length,
      D: allVessels.filter(v => v.cii === "D").length,
      E: allVessels.filter(v => v.cii === "E").length,
    };

    const eexiCompliance = {
      compliant: allVessels.filter(v => v.eexi === "compliant").length,
      nonCompliant: allVessels.filter(v => v.eexi === "non-compliant").length,
    };

    res.json({
      vesselEmissions,
      fleetSummary: {
        totalCo2: fleetTotalCo2,
        totalFuel: fleetTotalFuel,
        avgCiiRating: allVessels.reduce((s, v) => s + (v.cii === "A" ? 1 : v.cii === "B" ? 2 : v.cii === "C" ? 3 : 4), 0) / allVessels.length <= 2 ? "B" : "C",
        ciiDistribution,
        eexiCompliance,
      },
      fleetTrend,
    });
  } catch (err) {
    console.error("[vessels] emissions error:", err);
    res.status(500).json({ error: "Failed to load emissions data" });
  }
});

router.get("/vessels/disruption", async (_req, res) => {
  try {
    await ensureSeeded();
    const voyages = await db.select().from(vesselVoyagesTable);
    const allVessels = await db.select().from(vesselsTable);
    const vesselNames = new Map(allVessels.map(v => [v.id, v.name]));

    const disruptions = voyages.map(v => ({
      voyageCode: v.voyageCode,
      vessel: vesselNames.get(v.vesselId) || "Unknown",
      origin: v.origin,
      destination: v.destination,
      progress: v.progress,
      riskScore: v.riskScore,
      weatherRisk: v.weatherRisk,
      portCongestionRisk: v.portCongestionRisk,
      geopoliticalRisk: v.geopoliticalRisk,
      piracyRisk: v.piracyRisk,
      riskLevel: v.riskScore >= 30 ? "high" : v.riskScore >= 15 ? "medium" : "low",
    }));

    const avgRisk = voyages.length > 0 ? Math.round(voyages.reduce((s, v) => s + v.riskScore, 0) / voyages.length) : 0;
    const highRiskCount = disruptions.filter(d => d.riskLevel === "high").length;

    res.json({
      disruptions,
      summary: {
        avgRiskScore: avgRisk,
        highRiskVoyages: highRiskCount,
        totalVoyages: voyages.length,
      },
    });
  } catch (err) {
    console.error("[vessels] disruption error:", err);
    res.status(500).json({ error: "Failed to load disruption data" });
  }
});

router.post("/vessels/alerts/:alertCode/acknowledge", async (req, res) => {
  try {
    const { alertCode } = req.params;
    const { acknowledgedBy } = req.body || {};

    const [updated] = await db.update(vesselAlertsTable)
      .set({
        acknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedBy: acknowledgedBy || "operator",
      })
      .where(eq(vesselAlertsTable.alertCode, alertCode))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Alert not found" });
    }
    res.json({ success: true, alert: updated });
  } catch (err) {
    console.error("[vessels] alert ack error:", err);
    res.status(500).json({ error: "Failed to acknowledge alert" });
  }
});

router.patch("/vessels/vessel/:vesselCode/status", async (req, res) => {
  try {
    const { vesselCode } = req.params;
    const { status, speed, lat, lng } = req.body || {};

    const updates: any = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (speed !== undefined) updates.speed = speed;
    if (lat !== undefined) updates.lat = lat;
    if (lng !== undefined) updates.lng = lng;

    const [updated] = await db.update(vesselsTable)
      .set(updates)
      .where(eq(vesselsTable.vesselCode, vesselCode))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Vessel not found" });
    }
    res.json({ success: true, vessel: updated });
  } catch (err) {
    console.error("[vessels] vessel status update error:", err);
    res.status(500).json({ error: "Failed to update vessel status" });
  }
});

router.post("/vessels/maintenance", async (req, res) => {
  try {
    const { vesselCode, system, type, description, severity, scheduledDate, estimatedCost } = req.body;
    if (!vesselCode || !system || !description) {
      return res.status(400).json({ error: "vesselCode, system, and description are required" });
    }

    const vessel = await db.select().from(vesselsTable).where(eq(vesselsTable.vesselCode, vesselCode));
    if (vessel.length === 0) return res.status(404).json({ error: "Vessel not found" });

    const [event] = await db.insert(vesselMaintenanceEventsTable).values({
      vesselId: vessel[0].id,
      system,
      type: type || "scheduled",
      description,
      severity: severity || "medium",
      status: "pending",
      scheduledDate,
      estimatedCost,
    }).returning();

    res.json({ success: true, event });
  } catch (err) {
    console.error("[vessels] maintenance log error:", err);
    res.status(500).json({ error: "Failed to log maintenance event" });
  }
});

router.post("/vessels/emissions", async (req, res) => {
  try {
    const { vesselCode, date, co2Tons, fuelConsumedTons, fuelType, distanceNm } = req.body;
    if (!vesselCode || !date || co2Tons === undefined || fuelConsumedTons === undefined) {
      return res.status(400).json({ error: "vesselCode, date, co2Tons, and fuelConsumedTons are required" });
    }

    const vessel = await db.select().from(vesselsTable).where(eq(vesselsTable.vesselCode, vesselCode));
    if (vessel.length === 0) return res.status(404).json({ error: "Vessel not found" });

    const [reading] = await db.insert(vesselEmissionsTable).values({
      vesselId: vessel[0].id,
      date,
      co2Tons,
      fuelConsumedTons,
      fuelType: fuelType || "VLSFO",
      distanceNm,
    }).returning();

    res.json({ success: true, reading });
  } catch (err) {
    console.error("[vessels] emissions submit error:", err);
    res.status(500).json({ error: "Failed to record emissions" });
  }
});

export default router;
