import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Linkedin, FileText, Github, Award } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "linkedin-profile",
    label: "LinkedIn Profile Import",
    description: "Upload LinkedIn data export to auto-populate work history, skills, and education",
    icon: Linkedin,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "company", label: "Company", required: true },
      { name: "title", label: "Job Title", required: true },
      { name: "startDate", label: "Start Date", required: true },
      { name: "endDate", label: "End Date" },
      { name: "description", label: "Description" },
      { name: "location", label: "Location" },
      { name: "skills", label: "Skills" },
    ],
  },
  {
    id: "resume",
    label: "Resume/CV Import",
    description: "Parse structured resume data to extract career information",
    icon: FileText,
    acceptedTypes: [".json", ".csv"],
    targetFields: [
      { name: "section", label: "Section", required: true },
      { name: "title", label: "Title/Position", required: true },
      { name: "organization", label: "Organization" },
      { name: "startDate", label: "Start Date" },
      { name: "endDate", label: "End Date" },
      { name: "description", label: "Description" },
    ],
  },
  {
    id: "github",
    label: "GitHub Contributions Import",
    description: "Fetch public contribution data to showcase development activity",
    icon: Github,
    acceptedTypes: [".json", ".csv"],
    targetFields: [
      { name: "repository", label: "Repository", required: true },
      { name: "language", label: "Language" },
      { name: "stars", label: "Stars" },
      { name: "contributions", label: "Contributions" },
      { name: "description", label: "Description" },
      { name: "url", label: "URL" },
    ],
  },
  {
    id: "certifications",
    label: "Certification Import",
    description: "Bulk upload professional certifications with dates and issuers",
    icon: Award,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Certification Name", required: true },
      { name: "issuer", label: "Issuing Organization", required: true },
      { name: "issueDate", label: "Issue Date", required: true },
      { name: "expiryDate", label: "Expiry Date" },
      { name: "credentialId", label: "Credential ID" },
      { name: "url", label: "Verification URL" },
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
    body: JSON.stringify({ data, domain: "career", type: importTypeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Import failed");
  }
  return res.json();
}

export default function CareerImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Professional History Import"
        description="Import LinkedIn profiles, resumes, GitHub contributions, and certifications"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#3b82f6"
      />
    </div>
  );
}
