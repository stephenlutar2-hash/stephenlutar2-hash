import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Wallet, FolderKanban, Target, HeartPulse } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "financial",
    label: "Financial Data Import",
    description: "Upload bank/brokerage CSV exports for net worth tracking",
    icon: Wallet,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "account", label: "Account Name", required: true },
      { name: "type", label: "Account Type", required: true },
      { name: "balance", label: "Balance", required: true },
      { name: "currency", label: "Currency" },
      { name: "institution", label: "Institution" },
      { name: "date", label: "Date" },
    ],
  },
  {
    id: "projects",
    label: "Project Tracker Import",
    description: "Import personal project lists from Notion, Trello, or Todoist exports",
    icon: FolderKanban,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Project Name", required: true },
      { name: "description", label: "Description" },
      { name: "status", label: "Status" },
      { name: "priority", label: "Priority" },
      { name: "dueDate", label: "Due Date" },
      { name: "category", label: "Category" },
    ],
  },
  {
    id: "goals",
    label: "Goal/OKR Import",
    description: "Bulk upload personal objectives and key results from spreadsheets",
    icon: Target,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "objective", label: "Objective", required: true },
      { name: "keyResult", label: "Key Result", required: true },
      { name: "progress", label: "Progress (%)" },
      { name: "deadline", label: "Deadline" },
      { name: "category", label: "Category" },
      { name: "status", label: "Status" },
    ],
  },
  {
    id: "health",
    label: "Health/Fitness Import",
    description: "Upload Apple Health or Fitbit CSV exports for wellness tracking",
    icon: HeartPulse,
    acceptedTypes: [".csv", ".json", ".xml"],
    targetFields: [
      { name: "metric", label: "Metric Name", required: true },
      { name: "value", label: "Value", required: true },
      { name: "unit", label: "Unit" },
      { name: "date", label: "Date", required: true },
      { name: "source", label: "Device/Source" },
    ],
  },
];

async function handleImport(importTypeId: string, data: Record<string, any>[]) {
  const token = localStorage.getItem("szl_token");
  const res = await fetch(`${API_BASE}/api/import/generic`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ data, domain: "lutar", type: importTypeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Import failed");
  }
  return res.json();
}

export default function LutarImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Life Data Import"
        description="Import financial data, project trackers, goals/OKRs, and health metrics"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#f97316"
      />
    </div>
  );
}
