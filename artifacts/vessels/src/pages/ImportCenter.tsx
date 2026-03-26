import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Ship, Fuel, Navigation, Anchor, FileSpreadsheet } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "fleet",
    label: "Fleet Register Import",
    description: "Bulk vessel registration from IHS/Clarksons fleet data exports",
    icon: Ship,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "vesselCode", label: "Vessel Code", required: true },
      { name: "name", label: "Vessel Name", required: true },
      { name: "imo", label: "IMO Number", required: true },
      { name: "flag", label: "Flag State", required: true },
      { name: "type", label: "Vessel Type", required: true },
      { name: "dwt", label: "DWT (tons)", required: true },
      { name: "cbm", label: "CBM Capacity", required: true },
      { name: "built", label: "Year Built", required: true },
      { name: "class", label: "Classification Society", required: true },
      { name: "status", label: "Status" },
      { name: "speed", label: "Speed (kn)" },
      { name: "lat", label: "Latitude" },
      { name: "lng", label: "Longitude" },
    ],
  },
  {
    id: "emissions",
    label: "Emissions Reporting Import",
    description: "IMO DCS / MRV spreadsheet upload for CO₂, fuel consumption, and CII calculations",
    icon: Fuel,
    acceptedTypes: [".csv", ".json", ".xml"],
    targetFields: [
      { name: "vesselId", label: "Vessel ID", required: true },
      { name: "date", label: "Reporting Date", required: true },
      { name: "co2Tons", label: "CO₂ (tons)", required: true },
      { name: "fuelConsumedTons", label: "Fuel Consumed (tons)", required: true },
      { name: "fuelType", label: "Fuel Type" },
      { name: "distanceNm", label: "Distance (NM)" },
    ],
  },
  {
    id: "voyages",
    label: "Voyage Fixture Import",
    description: "Bulk upload voyage fixtures from broker recaps (structured CSV with charterer, cargo, laycan, rates)",
    icon: Navigation,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "voyageCode", label: "Voyage Code", required: true },
      { name: "vesselId", label: "Vessel ID", required: true },
      { name: "origin", label: "Origin Port", required: true },
      { name: "destination", label: "Destination Port", required: true },
      { name: "status", label: "Status" },
      { name: "cargo", label: "Cargo Type" },
      { name: "cargoVolume", label: "Cargo Volume" },
      { name: "progress", label: "Progress (%)" },
    ],
  },
  {
    id: "ports",
    label: "Port Schedule Import",
    description: "Upload terminal schedules and berth availability data",
    icon: Anchor,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Port Name", required: true },
      { name: "code", label: "Port Code", required: true },
      { name: "country", label: "Country", required: true },
      { name: "lat", label: "Latitude", required: true },
      { name: "lng", label: "Longitude", required: true },
      { name: "type", label: "Type" },
    ],
  },
  {
    id: "shipments",
    label: "AIS Data Import",
    description: "Upload AIS logs (CSV/NMEA format) to populate vessel positions and voyage history",
    icon: FileSpreadsheet,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "shipmentCode", label: "Shipment Code", required: true },
      { name: "vesselId", label: "Vessel ID", required: true },
      { name: "cargo", label: "Cargo", required: true },
      { name: "volume", label: "Volume", required: true },
      { name: "origin", label: "Origin", required: true },
      { name: "destination", label: "Destination", required: true },
      { name: "progress", label: "Progress (%)" },
    ],
  },
];

async function handleImport(importTypeId: string, data: Record<string, any>[]) {
  const token = localStorage.getItem("szl_token");
  const res = await fetch(`${API_BASE}/api/import/vessels/${importTypeId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Import failed");
  }
  return res.json();
}

export default function VesselsImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Maritime Data Import"
        description="Import fleet registers, AIS data, emissions reports, voyage fixtures, and port schedules"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#0ea5e9"
      />
    </div>
  );
}
