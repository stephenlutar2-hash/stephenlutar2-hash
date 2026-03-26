import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Crosshair, Network, History } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "attack-scenarios",
    label: "Attack Scenario Import",
    description: "Upload structured MITRE ATT&CK technique lists (JSON/CSV) to create simulation campaigns",
    icon: Crosshair,
    acceptedTypes: [".json", ".csv"],
    targetFields: [
      { name: "name", label: "Technique Name", required: true },
      { name: "description", label: "Description", required: true },
      { name: "tacticId", label: "Tactic ID" },
      { name: "severity", label: "Severity", required: true },
      { name: "platform", label: "Target Platform" },
      { name: "status", label: "Status" },
    ],
  },
  {
    id: "network-topology",
    label: "Network Topology Import",
    description: "Upload infrastructure maps to model attack surfaces",
    icon: Network,
    acceptedTypes: [".json", ".csv", ".xml"],
    targetFields: [
      { name: "name", label: "Node Name", required: true },
      { name: "type", label: "Node Type", required: true },
      { name: "ipAddress", label: "IP Address" },
      { name: "subnet", label: "Subnet" },
      { name: "services", label: "Running Services" },
      { name: "vulnerabilities", label: "Known Vulnerabilities" },
    ],
  },
  {
    id: "simulation-results",
    label: "Previous Simulation Results",
    description: "Migrate historical red team exercise data",
    icon: History,
    acceptedTypes: [".json", ".csv"],
    targetFields: [
      { name: "name", label: "Simulation Name", required: true },
      { name: "description", label: "Description", required: true },
      { name: "date", label: "Date" },
      { name: "result", label: "Result" },
      { name: "techniquesUsed", label: "Techniques Used" },
      { name: "findings", label: "Key Findings" },
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
    body: JSON.stringify({ data, domain: "firestorm", type: importTypeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Import failed");
  }
  return res.json();
}

export default function FirestormImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Simulation Lab Import"
        description="Import MITRE ATT&CK scenarios, network topologies, and historical simulation data"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#ef4444"
      />
    </div>
  );
}
