import { ImportCenter, type ImportType } from "@szl-holdings/ui";
import { Palette, Image, Droplets, Type } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const importTypes: ImportType[] = [
  {
    id: "figma-export",
    label: "Figma Export Import",
    description: "Upload Figma JSON exports to populate design system inventories",
    icon: Palette,
    acceptedTypes: [".json"],
    targetFields: [
      { name: "name", label: "Component Name", required: true },
      { name: "type", label: "Component Type", required: true },
      { name: "description", label: "Description" },
      { name: "variants", label: "Variants" },
      { name: "category", label: "Category" },
    ],
  },
  {
    id: "moodboard",
    label: "Moodboard Import",
    description: "Bulk upload images and design references with tagging",
    icon: Image,
    acceptedTypes: [".csv", ".json"],
    targetFields: [
      { name: "name", label: "Reference Name", required: true },
      { name: "url", label: "Image URL" },
      { name: "tags", label: "Tags" },
      { name: "category", label: "Category", required: true },
      { name: "notes", label: "Notes" },
    ],
  },
  {
    id: "color-palettes",
    label: "Color Palette Import",
    description: "Import ASE/ACO/JSON color palettes from Adobe or design tools",
    icon: Droplets,
    acceptedTypes: [".json", ".csv"],
    targetFields: [
      { name: "name", label: "Color Name", required: true },
      { name: "hex", label: "Hex Value", required: true },
      { name: "rgb", label: "RGB Value" },
      { name: "category", label: "Palette Group" },
      { name: "usage", label: "Usage" },
    ],
  },
  {
    id: "typography",
    label: "Typography Import",
    description: "Upload font specimen sheets and typographic scale definitions",
    icon: Type,
    acceptedTypes: [".json", ".csv"],
    targetFields: [
      { name: "fontFamily", label: "Font Family", required: true },
      { name: "weight", label: "Weight", required: true },
      { name: "size", label: "Size" },
      { name: "lineHeight", label: "Line Height" },
      { name: "usage", label: "Usage Context" },
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
    body: JSON.stringify({ data, domain: "dreamscape", type: importTypeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Import failed");
  }
  return res.json();
}

export default function DreamscapeImportCenter() {
  return (
    <div className="max-w-5xl mx-auto">
      <ImportCenter
        title="Design Asset Import"
        description="Import Figma exports, moodboards, color palettes, and typography definitions"
        importTypes={importTypes}
        onImport={handleImport}
        accentColor="#ec4899"
      />
    </div>
  );
}
