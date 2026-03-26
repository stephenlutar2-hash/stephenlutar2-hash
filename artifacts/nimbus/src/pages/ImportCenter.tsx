import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Database, LineChart, Clock, Link } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "predictions",
    label: "Training Dataset Import",
    description: "Upload historical data (CSV/JSON) for prediction model inputs",
    icon: Database,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "title", label: "Dataset Title", required: true },
      { name: "description", label: "Description", required: true },
      { name: "confidence", label: "Confidence", required: true },
      { name: "category", label: "Category", required: true },
      { name: "outcome", label: "Outcome", required: true },
      { name: "timeframe", label: "Timeframe", required: true },
      { name: "status", label: "Status" },
    ],
  },
  {
    id: "forecasts",
    label: "Forecast Import",
    description: "Bulk upload existing forecasts to compare against Nimbus predictions",
    icon: LineChart,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "title", label: "Forecast Title", required: true },
      { name: "description", label: "Description", required: true },
      { name: "confidence", label: "Confidence Score", required: true },
      { name: "category", label: "Category", required: true },
      { name: "outcome", label: "Expected Outcome", required: true },
      { name: "timeframe", label: "Timeframe", required: true },
    ],
  },
  {
    id: "timeseries",
    label: "Time Series Data Import",
    description: "Structured time-stamped data ingestion with auto-detection of frequency and trends",
    icon: Clock,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "title", label: "Series Name", required: true },
      { name: "description", label: "Description", required: true },
      { name: "confidence", label: "Confidence", required: true },
      { name: "category", label: "Category", required: true },
      { name: "outcome", label: "Outcome", required: true },
      { name: "timeframe", label: "Timeframe", required: true },
    ],
  },
  {
    id: "alerts",
    label: "External API Connector",
    description: "Paste an API endpoint URL to periodically pull prediction inputs",
    icon: Link,
    acceptedTypes: [".json", ".csv"],
    targetFields: [
      { name: "title", label: "Alert Title", required: true },
      { name: "message", label: "Message", required: true },
      { name: "severity", label: "Severity" },
      { name: "category", label: "Category", required: true },
    ],
  },
];

async function handleImport(importTypeId: string, data: Record<string, any>[]) {
  const token = localStorage.getItem("szl_token");
  const type = importTypeId === "forecasts" || importTypeId === "timeseries" ? "predictions" : importTypeId;
  const res = await fetch(`${API_BASE}/api/import/nimbus/${type}`, {
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

export default function NimbusImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Predictive Data Import"
        description="Import training datasets, forecasts, time series data, and external API connectors"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#8b5cf6"
      />
    </div>
  );
}
