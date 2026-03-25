import { Router } from "express";

const router = Router();

const fleet = [
  { id: "VSL-001", name: "MV Horizon Star", type: "Container Ship", imo: "9876543", flag: "Panama", status: "underway", speed: 18.2, heading: 245, lat: 1.2644, lng: 103.8220, destination: "Rotterdam", eta: "2026-04-02T14:00:00Z", lastPort: "Singapore", departureTime: "2026-03-20T08:00:00Z", cargo: "Mixed Containers", capacity: 8500, utilization: 87, condition: "excellent", crew: 24, fuelLevel: 72 },
  { id: "VSL-002", name: "SS Pacific Venture", type: "Bulk Carrier", imo: "9654321", flag: "Liberia", status: "underway", speed: 14.5, heading: 180, lat: 35.6762, lng: 139.6503, destination: "Los Angeles", eta: "2026-04-08T06:00:00Z", lastPort: "Tokyo", departureTime: "2026-03-18T12:00:00Z", cargo: "Iron Ore", capacity: 75000, utilization: 92, condition: "good", crew: 22, fuelLevel: 65 },
  { id: "VSL-003", name: "MV Arctic Breeze", type: "Tanker", imo: "9543210", flag: "Marshall Islands", status: "at-port", speed: 0, heading: 0, lat: 29.7604, lng: -95.3698, destination: "Houston", eta: null, lastPort: "Houston", departureTime: null, cargo: "Crude Oil", capacity: 120000, utilization: 0, condition: "maintenance", crew: 28, fuelLevel: 45 },
  { id: "VSL-004", name: "MV Coral Dawn", type: "Container Ship", imo: "9432109", flag: "Singapore", status: "underway", speed: 16.8, heading: 310, lat: -33.8688, lng: 151.2093, destination: "Shanghai", eta: "2026-04-05T22:00:00Z", lastPort: "Sydney", departureTime: "2026-03-22T05:00:00Z", cargo: "Mixed Containers", capacity: 6200, utilization: 78, condition: "excellent", crew: 21, fuelLevel: 81 },
  { id: "VSL-005", name: "SS Iron Monarch", type: "Bulk Carrier", imo: "9321098", flag: "Bahamas", status: "anchored", speed: 0, heading: 90, lat: 22.3193, lng: 114.1694, destination: "Hong Kong", eta: "2026-03-26T08:00:00Z", lastPort: "Manila", departureTime: "2026-03-23T14:00:00Z", cargo: "Coal", capacity: 82000, utilization: 95, condition: "good", crew: 23, fuelLevel: 58 },
  { id: "VSL-006", name: "MV Neptune's Grace", type: "LNG Carrier", imo: "9210987", flag: "Norway", status: "underway", speed: 19.5, heading: 60, lat: 51.5074, lng: -0.1278, destination: "Yokohama", eta: "2026-04-18T10:00:00Z", lastPort: "London", departureTime: "2026-03-19T16:00:00Z", cargo: "LNG", capacity: 174000, utilization: 100, condition: "excellent", crew: 30, fuelLevel: 88 },
  { id: "VSL-007", name: "MV Sapphire Tide", type: "Ro-Ro", imo: "9109876", flag: "Japan", status: "underway", speed: 15.2, heading: 200, lat: 36.8529, lng: -5.7561, destination: "Durban", eta: "2026-04-10T18:00:00Z", lastPort: "Gibraltar", departureTime: "2026-03-21T09:00:00Z", cargo: "Vehicles", capacity: 6500, utilization: 83, condition: "good", crew: 26, fuelLevel: 69 },
  { id: "VSL-008", name: "SS Golden Meridian", type: "Container Ship", imo: "9098765", flag: "Greece", status: "at-port", speed: 0, heading: 0, lat: 37.9838, lng: 23.7275, destination: "Piraeus", eta: null, lastPort: "Piraeus", departureTime: null, cargo: "Mixed Containers", capacity: 10200, utilization: 34, condition: "excellent", crew: 25, fuelLevel: 92 },
  { id: "VSL-009", name: "MV Tempest Runner", type: "Chemical Tanker", imo: "9087654", flag: "Malta", status: "underway", speed: 13.8, heading: 135, lat: 25.2048, lng: 55.2708, destination: "Mumbai", eta: "2026-03-30T04:00:00Z", lastPort: "Dubai", departureTime: "2026-03-24T11:00:00Z", cargo: "Chemicals", capacity: 45000, utilization: 76, condition: "good", crew: 20, fuelLevel: 74 },
  { id: "VSL-010", name: "MV Boreal Spirit", type: "Reefer", imo: "9076543", flag: "Denmark", status: "underway", speed: 17.1, heading: 280, lat: -22.9068, lng: -43.1729, destination: "Santos", eta: "2026-03-28T12:00:00Z", lastPort: "Rio de Janeiro", departureTime: "2026-03-25T06:00:00Z", cargo: "Perishables", capacity: 12000, utilization: 91, condition: "excellent", crew: 19, fuelLevel: 67 },
];

const routes = [
  { id: "RTE-001", vesselId: "VSL-001", vesselName: "MV Horizon Star", origin: "Singapore", destination: "Rotterdam", status: "in-transit", departureTime: "2026-03-20T08:00:00Z", eta: "2026-04-02T14:00:00Z", progress: 42, distance: 8440, distanceCovered: 3545, waypoints: [{ lat: 1.26, lng: 103.82, name: "Singapore" }, { lat: 12.97, lng: 80.18, name: "Chennai" }, { lat: 12.50, lng: 43.15, name: "Gulf of Aden" }, { lat: 30.04, lng: 32.57, name: "Suez Canal" }, { lat: 35.90, lng: -5.30, name: "Gibraltar" }, { lat: 51.92, lng: 4.48, name: "Rotterdam" }] },
  { id: "RTE-002", vesselId: "VSL-002", vesselName: "SS Pacific Venture", origin: "Tokyo", destination: "Los Angeles", departureTime: "2026-03-18T12:00:00Z", eta: "2026-04-08T06:00:00Z", status: "in-transit", progress: 35, distance: 5487, distanceCovered: 1920, waypoints: [{ lat: 35.68, lng: 139.65, name: "Tokyo" }, { lat: 37.78, lng: -122.42, name: "San Francisco" }, { lat: 33.75, lng: -118.24, name: "Los Angeles" }] },
  { id: "RTE-003", vesselId: "VSL-004", vesselName: "MV Coral Dawn", origin: "Sydney", destination: "Shanghai", departureTime: "2026-03-22T05:00:00Z", eta: "2026-04-05T22:00:00Z", status: "in-transit", progress: 22, distance: 4900, distanceCovered: 1078, waypoints: [{ lat: -33.87, lng: 151.21, name: "Sydney" }, { lat: -10.50, lng: 142.20, name: "Torres Strait" }, { lat: 31.23, lng: 121.47, name: "Shanghai" }] },
  { id: "RTE-004", vesselId: "VSL-006", vesselName: "MV Neptune's Grace", origin: "London", destination: "Yokohama", departureTime: "2026-03-19T16:00:00Z", eta: "2026-04-18T10:00:00Z", status: "in-transit", progress: 20, distance: 11200, distanceCovered: 2240, waypoints: [{ lat: 51.51, lng: -0.13, name: "London" }, { lat: 30.04, lng: 32.57, name: "Suez Canal" }, { lat: 12.50, lng: 43.15, name: "Bab el-Mandeb" }, { lat: 1.26, lng: 103.82, name: "Singapore Strait" }, { lat: 35.44, lng: 139.64, name: "Yokohama" }] },
  { id: "RTE-005", vesselId: "VSL-007", vesselName: "MV Sapphire Tide", origin: "Gibraltar", destination: "Durban", departureTime: "2026-03-21T09:00:00Z", eta: "2026-04-10T18:00:00Z", status: "in-transit", progress: 19, distance: 6200, distanceCovered: 1178, waypoints: [{ lat: 36.85, lng: -5.76, name: "Gibraltar" }, { lat: 14.69, lng: -17.44, name: "Dakar" }, { lat: -6.17, lng: 12.50, name: "Luanda" }, { lat: -29.88, lng: 31.05, name: "Durban" }] },
  { id: "RTE-006", vesselId: "VSL-009", vesselName: "MV Tempest Runner", origin: "Dubai", destination: "Mumbai", departureTime: "2026-03-24T11:00:00Z", eta: "2026-03-30T04:00:00Z", status: "in-transit", progress: 18, distance: 1200, distanceCovered: 216, waypoints: [{ lat: 25.20, lng: 55.27, name: "Dubai" }, { lat: 18.93, lng: 72.84, name: "Mumbai" }] },
  { id: "RTE-007", vesselId: "VSL-010", vesselName: "MV Boreal Spirit", origin: "Rio de Janeiro", destination: "Santos", departureTime: "2026-03-25T06:00:00Z", eta: "2026-03-28T12:00:00Z", status: "in-transit", progress: 10, distance: 220, distanceCovered: 22, waypoints: [{ lat: -22.91, lng: -43.17, name: "Rio de Janeiro" }, { lat: -23.95, lng: -46.33, name: "Santos" }] },
  { id: "RTE-008", vesselId: "VSL-003", vesselName: "MV Arctic Breeze", origin: "Galveston", destination: "Houston", departureTime: "2026-03-15T10:00:00Z", eta: "2026-03-16T02:00:00Z", status: "completed", progress: 100, distance: 45, distanceCovered: 45, waypoints: [{ lat: 29.30, lng: -94.79, name: "Galveston" }, { lat: 29.76, lng: -95.37, name: "Houston" }] },
];

const assets = [
  { id: "AST-001", vesselId: "VSL-001", name: "Main Engine A", type: "Propulsion", status: "operational", condition: "excellent", lastInspection: "2026-02-15", nextMaintenance: "2026-06-15", hoursOperated: 12450, location: "Engine Room" },
  { id: "AST-002", vesselId: "VSL-001", name: "Navigation Radar", type: "Navigation", status: "operational", condition: "good", lastInspection: "2026-01-20", nextMaintenance: "2026-07-20", hoursOperated: 18200, location: "Bridge" },
  { id: "AST-003", vesselId: "VSL-003", name: "Cargo Pump System", type: "Cargo Handling", status: "maintenance", condition: "fair", lastInspection: "2026-03-10", nextMaintenance: "2026-03-30", hoursOperated: 22100, location: "Pump Room" },
  { id: "AST-004", vesselId: "VSL-002", name: "Ballast Water Treatment", type: "Environmental", status: "operational", condition: "good", lastInspection: "2026-02-28", nextMaintenance: "2026-08-28", hoursOperated: 8900, location: "Lower Deck" },
  { id: "AST-005", vesselId: "VSL-006", name: "LNG Containment Tank #1", type: "Cargo", status: "operational", condition: "excellent", lastInspection: "2026-03-01", nextMaintenance: "2026-09-01", hoursOperated: 6200, location: "Cargo Hold" },
  { id: "AST-006", vesselId: "VSL-004", name: "Auxiliary Generator B", type: "Power", status: "operational", condition: "good", lastInspection: "2026-02-10", nextMaintenance: "2026-05-10", hoursOperated: 15800, location: "Engine Room" },
  { id: "AST-007", vesselId: "VSL-005", name: "Crane System #2", type: "Cargo Handling", status: "operational", condition: "good", lastInspection: "2026-01-15", nextMaintenance: "2026-04-15", hoursOperated: 9400, location: "Deck" },
  { id: "AST-008", vesselId: "VSL-007", name: "Vehicle Ramp - Stern", type: "Cargo Handling", status: "operational", condition: "excellent", lastInspection: "2026-03-05", nextMaintenance: "2026-09-05", hoursOperated: 4300, location: "Stern" },
  { id: "AST-009", vesselId: "VSL-003", name: "Inert Gas System", type: "Safety", status: "maintenance", condition: "poor", lastInspection: "2026-03-12", nextMaintenance: "2026-03-28", hoursOperated: 25600, location: "Pump Room" },
  { id: "AST-010", vesselId: "VSL-008", name: "Container Lashing System", type: "Cargo Handling", status: "operational", condition: "excellent", lastInspection: "2026-03-18", nextMaintenance: "2026-09-18", hoursOperated: 3100, location: "Deck" },
  { id: "AST-011", vesselId: "VSL-009", name: "Chemical Tank Coating", type: "Cargo", status: "operational", condition: "good", lastInspection: "2026-02-20", nextMaintenance: "2026-08-20", hoursOperated: 11000, location: "Cargo Tanks" },
  { id: "AST-012", vesselId: "VSL-010", name: "Refrigeration Plant", type: "Cargo", status: "operational", condition: "excellent", lastInspection: "2026-03-15", nextMaintenance: "2026-06-15", hoursOperated: 7800, location: "Below Deck" },
];

const alerts = [
  { id: "ALT-001", type: "weather", severity: "high", title: "Tropical Storm Warning — Indian Ocean", message: "Tropical storm Anila forming near 10°N 72°E with sustained winds of 65 knots. Vessels in the Arabian Sea corridor should adjust routes to maintain safe distance. MV Tempest Runner (VSL-009) currently within advisory zone.", vesselId: "VSL-009", timestamp: "2026-03-25T08:30:00Z", acknowledged: false, lat: 10.0, lng: 72.0 },
  { id: "ALT-002", type: "maintenance", severity: "critical", title: "Inert Gas System — Immediate Attention Required", message: "MV Arctic Breeze (VSL-003) inert gas system has exceeded maximum service interval. Safety compliance requires immediate inspection before next cargo operation. Asset AST-009 flagged for emergency maintenance.", vesselId: "VSL-003", timestamp: "2026-03-25T06:15:00Z", acknowledged: false, lat: 29.76, lng: -95.37 },
  { id: "ALT-003", type: "route-deviation", severity: "medium", title: "Route Deviation — MV Sapphire Tide", message: "MV Sapphire Tide (VSL-007) has deviated 12nm from planned route RTE-005 near West African coast. Deviation attributed to local traffic congestion off Dakar port approaches.", vesselId: "VSL-007", timestamp: "2026-03-25T04:45:00Z", acknowledged: true, lat: 14.69, lng: -17.44 },
  { id: "ALT-004", type: "compliance", severity: "medium", title: "MARPOL Compliance — Emissions Zone Entry", message: "SS Pacific Venture (VSL-002) approaching North American Emission Control Area. Fuel switch from HFO to VLSFO required within 200nm of US coastline per MARPOL Annex VI regulations.", vesselId: "VSL-002", timestamp: "2026-03-25T02:00:00Z", acknowledged: false, lat: 35.68, lng: -140.0 },
  { id: "ALT-005", type: "security", severity: "high", title: "Piracy Advisory — Gulf of Guinea", message: "IMB Piracy Reporting Centre has issued an advisory for the Gulf of Guinea region. Multiple incidents reported in the past 72 hours. MV Sapphire Tide (VSL-007) route passes through advisory zone.", vesselId: "VSL-007", timestamp: "2026-03-24T22:30:00Z", acknowledged: true, lat: 4.0, lng: 2.0 },
  { id: "ALT-006", type: "weather", severity: "low", title: "Fog Advisory — English Channel", message: "Dense fog reported in the English Channel and Dover Strait. Visibility below 0.5nm expected for the next 12 hours. No SZL vessels currently in the affected area.", vesselId: null, timestamp: "2026-03-24T20:00:00Z", acknowledged: true, lat: 51.0, lng: 1.5 },
  { id: "ALT-007", type: "maintenance", severity: "medium", title: "Scheduled Drydock — MV Arctic Breeze", message: "MV Arctic Breeze (VSL-003) scheduled drydock at Houston Shipyard commencing April 5, 2026. Estimated duration: 14 days. Pre-drydock survey and specification review pending.", vesselId: "VSL-003", timestamp: "2026-03-24T16:00:00Z", acknowledged: true, lat: 29.76, lng: -95.37 },
  { id: "ALT-008", type: "port", severity: "low", title: "Port Congestion — Shanghai", message: "Shanghai port reporting average anchorage wait times of 3-4 days for container vessels. MV Coral Dawn (VSL-004) ETA may require adjustment. Consider diverting to Ningbo-Zhoushan as alternative.", vesselId: "VSL-004", timestamp: "2026-03-24T14:00:00Z", acknowledged: false, lat: 31.23, lng: 121.47 },
  { id: "ALT-009", type: "compliance", severity: "high", title: "Ballast Water Convention — Inspection Due", message: "SS Iron Monarch (VSL-005) ballast water management plan requires D-2 standard verification before entering Hong Kong waters. Port state control inspection likely upon arrival.", vesselId: "VSL-005", timestamp: "2026-03-24T10:00:00Z", acknowledged: false, lat: 22.32, lng: 114.17 },
  { id: "ALT-010", type: "weather", severity: "medium", title: "Heavy Seas — Southern Indian Ocean", message: "Significant wave heights of 5-7 meters reported along the southern Indian Ocean route. MV Neptune's Grace (VSL-006) may experience delays if routing through the affected corridor.", vesselId: "VSL-006", timestamp: "2026-03-24T08:00:00Z", acknowledged: true, lat: -35.0, lng: 60.0 },
];

const intelligence = [
  { id: "INT-001", category: "market", title: "Trans-Pacific Freight Rates Surge 15%", summary: "Container freight rates on Trans-Pacific routes have increased 15% over the past two weeks due to port congestion in Long Beach and equipment shortages. Spot rates now averaging $4,200/FEU.", source: "Maritime Analytics Weekly", timestamp: "2026-03-25T07:00:00Z", impact: "high", tags: ["freight-rates", "trans-pacific", "container"] },
  { id: "INT-002", category: "regulatory", title: "IMO 2026 Carbon Intensity Deadline Approaches", summary: "The International Maritime Organization's Carbon Intensity Indicator (CII) ratings for 2025 are due for submission by March 31. Vessels rated D or E for two consecutive years face operational restrictions.", source: "IMO Circular", timestamp: "2026-03-24T12:00:00Z", impact: "critical", tags: ["imo", "cii", "emissions", "regulatory"] },
  { id: "INT-003", category: "geopolitical", title: "Suez Canal Transit Delays — Security Operations", summary: "Enhanced security screening at Suez Canal has increased average transit time by 6-8 hours. Egyptian authorities cite ongoing regional security concerns. Impact on Asia-Europe routes expected through Q2.", source: "Suez Canal Authority", timestamp: "2026-03-24T09:00:00Z", impact: "medium", tags: ["suez", "security", "delays"] },
  { id: "INT-004", category: "technology", title: "New AIS Satellite Constellation Launches", summary: "SpaceTrack Maritime has launched 24 new AIS monitoring satellites, improving global vessel tracking coverage to near-real-time updates every 2 minutes in previously underserved polar and deep ocean regions.", source: "Maritime Tech Review", timestamp: "2026-03-23T15:00:00Z", impact: "low", tags: ["ais", "satellite", "tracking"] },
  { id: "INT-005", category: "market", title: "LNG Carrier Demand Reaches Record High", summary: "Global LNG carrier demand has hit all-time highs with day rates exceeding $120,000. New build orders at South Korean yards are booked through 2028, creating a significant supply-demand imbalance.", source: "LNG Shipping Gazette", timestamp: "2026-03-23T10:00:00Z", impact: "high", tags: ["lng", "charter-rates", "newbuilds"] },
  { id: "INT-006", category: "regulatory", title: "EU ETS Maritime Compliance Update", summary: "European Union Emissions Trading System now requires 70% of maritime emissions within EU waters to be covered by allowances (up from 40% in 2025). Fleet operators should review CO2 reporting obligations.", source: "EU Maritime Affairs", timestamp: "2026-03-22T14:00:00Z", impact: "high", tags: ["eu-ets", "emissions", "compliance"] },
  { id: "INT-007", category: "geopolitical", title: "Panama Canal Water Levels Stabilizing", summary: "Panama Canal Authority reports water levels in Gatun Lake have improved following recent rainfall, allowing daily transits to increase from 24 to 30 slots. Booking wait times reduced to 5-7 days.", source: "Panama Canal Authority", timestamp: "2026-03-22T08:00:00Z", impact: "medium", tags: ["panama", "canal", "drought"] },
  { id: "INT-008", category: "market", title: "Dry Bulk Index Recovers After Q1 Slump", summary: "The Baltic Dry Index has rebounded 22% from its Q1 low, driven by renewed Chinese iron ore imports and grain shipments from South America. Capesize rates leading the recovery.", source: "Baltic Exchange", timestamp: "2026-03-21T11:00:00Z", impact: "medium", tags: ["bdi", "dry-bulk", "rates"] },
];

router.get("/vessels/fleet", (_req, res) => {
  const activeVessels = fleet.filter(v => v.status === "underway").length;
  const atPort = fleet.filter(v => v.status === "at-port").length;
  const anchored = fleet.filter(v => v.status === "anchored").length;
  const avgUtilization = Math.round(fleet.reduce((sum, v) => sum + v.utilization, 0) / fleet.length);

  res.json({
    summary: {
      totalVessels: fleet.length,
      activeVessels,
      atPort,
      anchored,
      avgUtilization,
      activeAlerts: alerts.filter(a => !a.acknowledged).length,
      routesInProgress: routes.filter(r => r.status === "in-transit").length,
    },
    vessels: fleet,
  });
});

router.get("/vessels/routes", (_req, res) => {
  res.json({ routes });
});

router.get("/vessels/assets", (_req, res) => {
  res.json({ assets });
});

router.get("/vessels/alerts", (_req, res) => {
  const sorted = [...alerts].sort((a, b) => {
    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  res.json({ alerts: sorted });
});

router.get("/vessels/intelligence", (_req, res) => {
  res.json({ intelligence });
});

export default router;
