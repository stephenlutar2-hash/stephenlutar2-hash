import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Shield, FileSpreadsheet, Server, AlertTriangle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "compliance",
    label: "Compliance Framework Import",
    description: "Upload NIST, ISO 27001, or SOC 2 control checklists (CSV/XLSX)",
    icon: Shield,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Control Name", required: true },
      { name: "description", label: "Description", required: true },
      { name: "status", label: "Compliance Status" },
      { name: "category", label: "Framework/Category", required: true },
      { name: "priority", label: "Priority" },
    ],
  },
  {
    id: "pentest",
    label: "Penetration Test Reports",
    description: "Parse structured pentest results to populate vulnerability dashboards",
    icon: AlertTriangle,
    acceptedTypes: [".csv", ".json", ".xml"],
    targetFields: [
      { name: "title", label: "Finding Title", required: true },
      { name: "description", label: "Description", required: true },
      { name: "severity", label: "Severity", required: true },
      { name: "status", label: "Remediation Status" },
      { name: "category", label: "Category" },
      { name: "affectedAsset", label: "Affected Asset" },
    ],
  },
  {
    id: "assets",
    label: "Asset Inventory Import",
    description: "Bulk upload IT assets (servers, endpoints, cloud resources) from CMDB exports",
    icon: Server,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Asset Name", required: true },
      { name: "type", label: "Asset Type", required: true },
      { name: "description", label: "Description" },
      { name: "status", label: "Status" },
      { name: "owner", label: "Owner" },
      { name: "location", label: "Location" },
      { name: "criticality", label: "Criticality" },
    ],
  },
  {
    id: "risk-register",
    label: "Risk Register Import",
    description: "Migrate existing risk assessments from spreadsheets",
    icon: FileSpreadsheet,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "title", label: "Risk Title", required: true },
      { name: "description", label: "Description", required: true },
      { name: "likelihood", label: "Likelihood" },
      { name: "impact", label: "Impact" },
      { name: "severity", label: "Risk Score" },
      { name: "owner", label: "Risk Owner" },
      { name: "status", label: "Mitigation Status" },
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
    body: JSON.stringify({ data, domain: "aegis", type: importTypeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Import failed");
  }
  return res.json();
}

export default function AegisImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Security Assessment Import"
        description="Import compliance frameworks, pentest reports, asset inventories, and risk registers"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#10b981"
      />
    </div>
  );
}
