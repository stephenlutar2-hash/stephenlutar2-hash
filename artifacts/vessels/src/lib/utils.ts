import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiBase() {
  return "/api/vessels";
}

export function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCoord(val: number, type: "lat" | "lng") {
  const dir = type === "lat" ? (val >= 0 ? "N" : "S") : (val >= 0 ? "E" : "W");
  return `${Math.abs(val).toFixed(4)}° ${dir}`;
}

export function severityColor(severity: string) {
  switch (severity) {
    case "critical": return "text-red-400 bg-red-500/15 border-red-500/30";
    case "high": return "text-orange-400 bg-orange-500/15 border-orange-500/30";
    case "medium": return "text-yellow-400 bg-yellow-500/15 border-yellow-500/30";
    case "low": return "text-blue-400 bg-blue-500/15 border-blue-500/30";
    default: return "text-gray-400 bg-gray-500/15 border-gray-500/30";
  }
}

export function statusColor(status: string) {
  switch (status) {
    case "underway": return "text-emerald-400 bg-emerald-500/15";
    case "at-port": return "text-blue-400 bg-blue-500/15";
    case "anchored": return "text-yellow-400 bg-yellow-500/15";
    case "in-transit": return "text-emerald-400 bg-emerald-500/15";
    case "completed": return "text-gray-400 bg-gray-500/15";
    case "operational": return "text-emerald-400 bg-emerald-500/15";
    case "maintenance": return "text-yellow-400 bg-yellow-500/15";
    default: return "text-gray-400 bg-gray-500/15";
  }
}

export function conditionColor(condition: string) {
  switch (condition) {
    case "excellent": return "text-emerald-400";
    case "good": return "text-blue-400";
    case "fair": return "text-yellow-400";
    case "poor": return "text-red-400";
    default: return "text-gray-400";
  }
}
