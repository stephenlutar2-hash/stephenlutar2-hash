import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Activity, BarChart2, Target, Clock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "opentelemetry",
    label: "OpenTelemetry Import",
    description: "Upload OTLP-formatted traces and metrics (JSON)",
    icon: Activity,
    acceptedTypes: [".json"],
    targetFields: [
      { name: "serviceName", label: "Service Name", required: true },
      { name: "traceId", label: "Trace ID" },
      { name: "spanName", label: "Span Name", required: true },
      { name: "duration", label: "Duration (ms)" },
      { name: "status", label: "Status" },
      { name: "attributes", label: "Attributes" },
    ],
  },
  {
    id: "prometheus",
    label: "Prometheus Metrics Import",
    description: "Upload Prometheus snapshot exports",
    icon: BarChart2,
    acceptedTypes: [".json", ".csv"],
    targetFields: [
      { name: "metricName", label: "Metric Name", required: true },
      { name: "value", label: "Value", required: true },
      { name: "timestamp", label: "Timestamp" },
      { name: "labels", label: "Labels" },
      { name: "type", label: "Metric Type" },
    ],
  },
  {
    id: "slo-definitions",
    label: "SLO Definition Import",
    description: "Bulk upload Service Level Objectives from spreadsheets",
    icon: Target,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "SLO Name", required: true },
      { name: "service", label: "Service", required: true },
      { name: "target", label: "Target (%)", required: true },
      { name: "current", label: "Current (%)" },
      { name: "window", label: "Window (days)" },
      { name: "type", label: "SLO Type" },
    ],
  },
  {
    id: "incident-timeline",
    label: "Incident Timeline Import",
    description: "Upload post-mortem timelines and correlate with telemetry data",
    icon: Clock,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "title", label: "Incident Title", required: true },
      { name: "timestamp", label: "Timestamp", required: true },
      { name: "severity", label: "Severity" },
      { name: "description", label: "Description", required: true },
      { name: "rootCause", label: "Root Cause" },
      { name: "resolution", label: "Resolution" },
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
    body: JSON.stringify({ data, domain: "lyte", type: importTypeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Import failed");
  }
  return res.json();
}

export default function LyteImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Telemetry Import"
        description="Import OpenTelemetry traces, Prometheus metrics, SLO definitions, and incident timelines"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#06b6d4"
      />
    </div>
  );
}
