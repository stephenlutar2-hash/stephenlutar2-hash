import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Shield, Bug, AlertTriangle, Scan, FileText } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "threats",
    label: "STIX/TAXII Threat Feed",
    description: "Ingest structured threat intelligence in standard cybersecurity formats",
    icon: Shield,
    acceptedTypes: [".json", ".csv", ".xml"],
    targetFields: [
      { name: "type", label: "Threat Type", required: true },
      { name: "source", label: "Source", required: true },
      { name: "target", label: "Target", required: true },
      { name: "severity", label: "Severity", required: true },
      { name: "status", label: "Status" },
      { name: "description", label: "Description", required: true },
    ],
  },
  {
    id: "csv-threats",
    label: "CSV Threat Indicators",
    description: "Bulk upload threat indicators (IPs, domains, hashes, severity)",
    icon: Bug,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "type", label: "Indicator Type", required: true },
      { name: "source", label: "Source IP/Domain", required: true },
      { name: "target", label: "Target System", required: true },
      { name: "severity", label: "Severity", required: true },
      { name: "description", label: "Description", required: true },
      { name: "status", label: "Status" },
    ],
  },
  {
    id: "incidents",
    label: "Incident History Import",
    description: "Migrate past incident data from ServiceNow, PagerDuty, or Jira exports",
    icon: AlertTriangle,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "title", label: "Incident Title", required: true },
      { name: "description", label: "Description", required: true },
      { name: "severity", label: "Severity", required: true },
      { name: "status", label: "Status" },
      { name: "assignee", label: "Assignee" },
      { name: "platform", label: "Platform", required: true },
      { name: "resolved", label: "Resolved" },
    ],
  },
  {
    id: "scans",
    label: "Vulnerability Scan Import",
    description: "Upload Nessus, Qualys, or OpenVAS scan results (XML/CSV)",
    icon: Scan,
    acceptedTypes: [".csv", ".json", ".xml"],
    targetFields: [
      { name: "platform", label: "Platform", required: true },
      { name: "scanType", label: "Scan Type", required: true },
      { name: "status", label: "Status" },
      { name: "threatsFound", label: "Threats Found" },
      { name: "threatsBlocked", label: "Threats Blocked" },
      { name: "duration", label: "Duration (s)" },
    ],
  },
  {
    id: "siem-logs",
    label: "SIEM Log Import",
    description: "Structured log ingestion from Splunk/Elastic exports",
    icon: FileText,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "type", label: "Log Type", required: true },
      { name: "source", label: "Source", required: true },
      { name: "target", label: "Target", required: true },
      { name: "severity", label: "Severity" },
      { name: "description", label: "Log Message", required: true },
      { name: "status", label: "Status" },
    ],
  },
];

async function handleImport(importTypeId: string, data: Record<string, any>[]) {
  const token = localStorage.getItem("szl_token");
  const type = importTypeId === "csv-threats" || importTypeId === "siem-logs" ? "threats" : importTypeId;
  const res = await fetch(`${API_BASE}/api/import/rosie/${type}`, {
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

export default function RosieImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Threat Intelligence Import"
        description="Import threat feeds, incident history, vulnerability scans, and SIEM logs into ROSIE"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#f43f5e"
      />
    </div>
  );
}
