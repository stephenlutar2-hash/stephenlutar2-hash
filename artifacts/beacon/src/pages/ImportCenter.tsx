import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { BarChart3, FolderKanban, LineChart, DollarSign } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "metrics",
    label: "Google Analytics Import",
    description: "Upload GA4 export data (CSV) to populate traffic and engagement metrics",
    icon: BarChart3,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Metric Name", required: true },
      { name: "value", label: "Value", required: true },
      { name: "unit", label: "Unit", required: true },
      { name: "change", label: "Change (%)", required: true },
      { name: "category", label: "Category", required: true },
    ],
  },
  {
    id: "kpis",
    label: "Spreadsheet KPI Import",
    description: "Bulk upload organizational KPIs from Excel/Google Sheets exports",
    icon: LineChart,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "KPI Name", required: true },
      { name: "value", label: "Current Value", required: true },
      { name: "unit", label: "Unit", required: true },
      { name: "change", label: "Change (%)", required: true },
      { name: "category", label: "Category", required: true },
    ],
  },
  {
    id: "projects",
    label: "Project Management Import",
    description: "Import project data from Jira, Asana, or Monday.com exports (CSV/JSON)",
    icon: FolderKanban,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Project Name", required: true },
      { name: "description", label: "Description", required: true },
      { name: "status", label: "Status" },
      { name: "progress", label: "Progress (%)" },
      { name: "platform", label: "Platform", required: true },
    ],
  },
  {
    id: "financial",
    label: "Financial Metrics Import",
    description: "Upload P&L summaries, revenue data, and budget allocations",
    icon: DollarSign,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Metric Name", required: true },
      { name: "value", label: "Amount", required: true },
      { name: "unit", label: "Currency/Unit", required: true },
      { name: "change", label: "Change (%)", required: true },
      { name: "category", label: "Category", required: true },
    ],
  },
];

async function handleImport(importTypeId: string, data: Record<string, any>[]) {
  const token = localStorage.getItem("szl_token");
  const type = importTypeId === "kpis" || importTypeId === "financial" ? "metrics" : importTypeId;
  const res = await fetch(`${API_BASE}/api/import/beacon/${type}`, {
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

export default function BeaconImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Analytics Import Center"
        description="Import Google Analytics data, KPIs, project data, and financial metrics"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#f59e0b"
      />
    </div>
  );
}
