import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Settings, FileCode, Activity } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "modules",
    label: "Module Configuration Import",
    description: "Upload YAML/JSON configuration files for system modules",
    icon: Settings,
    acceptedTypes: [".json", ".yaml", ".yml", ".csv"],
    targetFields: [
      { name: "name", label: "Module Name", required: true },
      { name: "description", label: "Description", required: true },
      { name: "version", label: "Version", required: true },
      { name: "status", label: "Status" },
      { name: "category", label: "Category", required: true },
      { name: "uptime", label: "Uptime (%)" },
    ],
  },
  {
    id: "iac",
    label: "Infrastructure-as-Code Import",
    description: "Parse Terraform/ARM templates to populate module definitions",
    icon: FileCode,
    acceptedTypes: [".json", ".yaml", ".yml"],
    targetFields: [
      { name: "name", label: "Resource Name", required: true },
      { name: "description", label: "Description", required: true },
      { name: "version", label: "Version", required: true },
      { name: "category", label: "Resource Type", required: true },
      { name: "status", label: "Status" },
    ],
  },
  {
    id: "logs",
    label: "System Health Baseline Import",
    description: "Upload historical uptime and performance baselines",
    icon: Activity,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "level", label: "Log Level" },
      { name: "message", label: "Message", required: true },
      { name: "module", label: "Module", required: true },
    ],
  },
];

async function handleImport(importTypeId: string, data: Record<string, any>[]) {
  const token = localStorage.getItem("szl_token");
  const type = importTypeId === "iac" ? "modules" : importTypeId;
  const res = await fetch(`${API_BASE}/api/import/zeus/${type}`, {
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

export default function ZeusImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Module & Config Import"
        description="Import module configurations, Infrastructure-as-Code templates, and system health baselines"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#f59e0b"
      />
    </div>
  );
}
