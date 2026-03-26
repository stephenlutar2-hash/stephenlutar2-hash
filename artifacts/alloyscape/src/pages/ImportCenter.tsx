import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Cloud, DollarSign, FileCode, Container } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "cloud-resources",
    label: "AWS/Azure/GCP Resource Import",
    description: "Upload cloud resource inventory exports (CSV/JSON)",
    icon: Cloud,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Resource Name", required: true },
      { name: "type", label: "Resource Type", required: true },
      { name: "provider", label: "Cloud Provider", required: true },
      { name: "region", label: "Region" },
      { name: "status", label: "Status" },
      { name: "cost", label: "Monthly Cost" },
      { name: "tags", label: "Tags" },
    ],
  },
  {
    id: "cost-allocation",
    label: "Cost Allocation Import",
    description: "Upload cloud billing exports for infrastructure cost analysis",
    icon: DollarSign,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "service", label: "Service Name", required: true },
      { name: "cost", label: "Cost", required: true },
      { name: "currency", label: "Currency" },
      { name: "period", label: "Billing Period", required: true },
      { name: "account", label: "Account" },
      { name: "tags", label: "Cost Tags" },
    ],
  },
  {
    id: "terraform-state",
    label: "Terraform State Import",
    description: "Parse tfstate files to visualize infrastructure topology",
    icon: FileCode,
    acceptedTypes: [".json"],
    targetFields: [
      { name: "name", label: "Resource Name", required: true },
      { name: "type", label: "Resource Type", required: true },
      { name: "provider", label: "Provider", required: true },
      { name: "module", label: "Module" },
      { name: "attributes", label: "Attributes" },
    ],
  },
  {
    id: "k8s-manifests",
    label: "Kubernetes Manifest Import",
    description: "Upload K8s YAML manifests to map workload configurations",
    icon: Container,
    acceptedTypes: [".yaml", ".yml", ".json"],
    targetFields: [
      { name: "name", label: "Workload Name", required: true },
      { name: "kind", label: "Kind", required: true },
      { name: "namespace", label: "Namespace" },
      { name: "replicas", label: "Replicas" },
      { name: "image", label: "Container Image" },
      { name: "status", label: "Status" },
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
    body: JSON.stringify({ data, domain: "alloyscape", type: importTypeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Import failed");
  }
  return res.json();
}

export default function AlloyscapeImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Infrastructure Import"
        description="Import cloud resources, cost data, Terraform state, and Kubernetes manifests"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#14b8a6"
      />
    </div>
  );
}
