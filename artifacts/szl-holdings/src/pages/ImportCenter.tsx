import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Building2, TrendingUp, Users, Newspaper } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "portfolio-companies",
    label: "Portfolio Company Import",
    description: "Bulk upload venture/portfolio company details (name, status, tech stack, metrics)",
    icon: Building2,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Company Name", required: true },
      { name: "sector", label: "Sector", required: true },
      { name: "status", label: "Status" },
      { name: "stage", label: "Investment Stage" },
      { name: "techStack", label: "Tech Stack" },
      { name: "valuation", label: "Valuation" },
      { name: "employees", label: "Employee Count" },
    ],
  },
  {
    id: "financial-summary",
    label: "Financial Summary Import",
    description: "Upload investment performance data, valuations, and fund metrics",
    icon: TrendingUp,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "metric", label: "Metric Name", required: true },
      { name: "value", label: "Value", required: true },
      { name: "period", label: "Period", required: true },
      { name: "company", label: "Company" },
      { name: "category", label: "Category" },
    ],
  },
  {
    id: "team-directory",
    label: "Team Directory Import",
    description: "Bulk upload leadership bios and team information",
    icon: Users,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Full Name", required: true },
      { name: "title", label: "Job Title", required: true },
      { name: "department", label: "Department" },
      { name: "bio", label: "Bio" },
      { name: "email", label: "Email" },
      { name: "linkedin", label: "LinkedIn URL" },
    ],
  },
  {
    id: "press-media",
    label: "Press/Media Import",
    description: "Upload press mentions and media coverage for the portfolio",
    icon: Newspaper,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "title", label: "Article Title", required: true },
      { name: "publication", label: "Publication", required: true },
      { name: "date", label: "Publish Date", required: true },
      { name: "url", label: "URL" },
      { name: "company", label: "Related Company" },
      { name: "type", label: "Coverage Type" },
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
    body: JSON.stringify({ data, domain: "szl-holdings", type: importTypeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Import failed");
  }
  return res.json();
}

export default function SZLImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Portfolio Data Import"
        description="Import portfolio companies, financial summaries, team directories, and press coverage"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#6366f1"
      />
    </div>
  );
}
