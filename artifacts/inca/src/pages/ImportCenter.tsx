import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { FileSpreadsheet, FlaskConical, Activity, FileCode, Github } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "projects",
    label: "AI Project Definitions",
    description: "Bulk import AI project definitions with model name, architecture, accuracy, and status",
    icon: FileSpreadsheet,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Project Name", required: true },
      { name: "description", label: "Description", required: true },
      { name: "status", label: "Status" },
      { name: "aiModel", label: "AI Model", required: true },
      { name: "accuracy", label: "Accuracy" },
    ],
  },
  {
    id: "experiments",
    label: "Experiment Results",
    description: "Import experiment results from MLflow/Weights & Biases export formats (CSV/JSON)",
    icon: FlaskConical,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "projectId", label: "Project ID", required: true },
      { name: "name", label: "Experiment Name", required: true },
      { name: "hypothesis", label: "Hypothesis", required: true },
      { name: "result", label: "Result", required: true },
      { name: "status", label: "Status" },
      { name: "accuracy", label: "Accuracy" },
    ],
  },
  {
    id: "model-performance",
    label: "Model Performance Data",
    description: "Batch upload accuracy benchmarks, training metrics, and model performance data",
    icon: Activity,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Model Name", required: true },
      { name: "description", label: "Description", required: true },
      { name: "aiModel", label: "Architecture", required: true },
      { name: "accuracy", label: "Accuracy Score" },
      { name: "status", label: "Status" },
    ],
  },
  {
    id: "notebooks",
    label: "Jupyter Notebook Metadata",
    description: "Parse .ipynb files to extract experiment metadata and cell information",
    icon: FileCode,
    acceptedTypes: [".ipynb", ".json"],
    targetFields: [
      { name: "name", label: "Notebook Name", required: true },
      { name: "description", label: "Description", required: true },
      { name: "aiModel", label: "Model Used", required: true },
      { name: "status", label: "Status" },
      { name: "accuracy", label: "Accuracy" },
    ],
  },
  {
    id: "github-repos",
    label: "GitHub Repo Scanner",
    description: "Import ML project structure from GitHub repository exports",
    icon: Github,
    acceptedTypes: [".json", ".csv"],
    targetFields: [
      { name: "name", label: "Repository Name", required: true },
      { name: "description", label: "Description", required: true },
      { name: "aiModel", label: "ML Framework", required: true },
      { name: "status", label: "Status" },
    ],
  },
];

async function handleImport(importTypeId: string, data: Record<string, any>[]) {
  const token = localStorage.getItem("szl_token");
  const endpoint = importTypeId === "projects" || importTypeId === "model-performance" || importTypeId === "notebooks" || importTypeId === "github-repos"
    ? `${API_BASE}/api/import/inca/projects`
    : `${API_BASE}/api/import/inca/experiments`;

  const res = await fetch(endpoint, {
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

export default function IncaImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Import Center"
        description="Import AI research data, experiment results, model performance metrics, and more into INCA"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#6366f1"
      />
    </div>
  );
}
