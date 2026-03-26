import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { FileText, Megaphone, Share2, Globe } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "content",
    label: "Content Library Import",
    description: "Bulk upload articles, blog posts, and creative assets (CSV with title, body, tags)",
    icon: FileText,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "title", label: "Title", required: true },
      { name: "body", label: "Body/Content", required: true },
      { name: "type", label: "Content Type" },
      { name: "status", label: "Status" },
      { name: "views", label: "Views" },
      { name: "engagement", label: "Engagement Rate" },
    ],
  },
  {
    id: "campaigns",
    label: "Campaign Data Import",
    description: "Import marketing campaign metrics from HubSpot, Mailchimp exports (CSV)",
    icon: Megaphone,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Campaign Name", required: true },
      { name: "description", label: "Description", required: true },
      { name: "status", label: "Status" },
      { name: "budget", label: "Budget" },
      { name: "reach", label: "Reach" },
      { name: "startDate", label: "Start Date", required: true },
      { name: "endDate", label: "End Date", required: true },
    ],
  },
  {
    id: "social-analytics",
    label: "Social Media Analytics",
    description: "Upload engagement data from platform exports (Instagram, Twitter, LinkedIn)",
    icon: Share2,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "title", label: "Post Title", required: true },
      { name: "body", label: "Content", required: true },
      { name: "type", label: "Platform" },
      { name: "views", label: "Impressions" },
      { name: "engagement", label: "Engagement Rate" },
      { name: "status", label: "Status" },
    ],
  },
  {
    id: "cms-export",
    label: "WordPress/CMS Export",
    description: "Parse WXR (WordPress eXtended RSS) or Contentful exports",
    icon: Globe,
    acceptedTypes: [".xml", ".json", ".csv"],
    targetFields: [
      { name: "title", label: "Title", required: true },
      { name: "body", label: "Content", required: true },
      { name: "type", label: "Post Type" },
      { name: "status", label: "Publication Status" },
      { name: "views", label: "Page Views" },
    ],
  },
];

async function handleImport(importTypeId: string, data: Record<string, any>[]) {
  const token = localStorage.getItem("szl_token");
  const type = importTypeId === "social-analytics" || importTypeId === "cms-export" ? "content" : importTypeId;
  const res = await fetch(`${API_BASE}/api/import/dreamera/${type}`, {
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

export default function DreameraImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Content Import Center"
        description="Import content libraries, campaign data, social analytics, and CMS exports"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#a855f7"
      />
    </div>
  );
}
