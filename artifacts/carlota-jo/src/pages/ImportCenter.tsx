import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Users, Briefcase, Calendar, Linkedin } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "crm-contacts",
    label: "CRM Contact Import",
    description: "Bulk upload prospects and clients from Salesforce, HubSpot exports (CSV)",
    icon: Users,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Contact Name", required: true },
      { name: "email", label: "Email", required: true },
      { name: "company", label: "Company" },
      { name: "title", label: "Job Title" },
      { name: "phone", label: "Phone" },
      { name: "status", label: "Lead Status" },
      { name: "source", label: "Lead Source" },
    ],
  },
  {
    id: "engagements",
    label: "Engagement History Import",
    description: "Import past consulting engagements with dates, services, and outcomes",
    icon: Briefcase,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "client", label: "Client Name", required: true },
      { name: "service", label: "Service Type", required: true },
      { name: "startDate", label: "Start Date", required: true },
      { name: "endDate", label: "End Date" },
      { name: "status", label: "Status" },
      { name: "outcome", label: "Outcome" },
      { name: "revenue", label: "Revenue" },
    ],
  },
  {
    id: "calendar",
    label: "Calendar Import",
    description: "Upload ICS/iCal files to populate consultation schedules",
    icon: Calendar,
    acceptedTypes: [".ics", ".csv", ".json"],
    targetFields: [
      { name: "title", label: "Event Title", required: true },
      { name: "start", label: "Start Time", required: true },
      { name: "end", label: "End Time" },
      { name: "location", label: "Location" },
      { name: "description", label: "Description" },
    ],
  },
  {
    id: "linkedin",
    label: "LinkedIn Connections Import",
    description: "Upload LinkedIn connections export to seed the prospect pipeline",
    icon: Linkedin,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Name", required: true },
      { name: "company", label: "Company" },
      { name: "title", label: "Position" },
      { name: "email", label: "Email" },
      { name: "connectedOn", label: "Connected On" },
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
    body: JSON.stringify({ data, domain: "carlota-jo", type: importTypeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Import failed");
  }
  return res.json();
}

export default function CarlotaJoImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Client & Engagement Import"
        description="Import CRM contacts, engagement history, calendar events, and LinkedIn connections"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#d946ef"
      />
    </div>
  );
}
