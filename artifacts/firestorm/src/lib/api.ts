const API_BASE = "/api/firestorm";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("szl_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchScenarios() {
  const res = await fetch(`${API_BASE}/scenarios`, { headers: authHeaders() });
  return res.json();
}

export async function startScenario(id: string) {
  const res = await fetch(`${API_BASE}/scenarios/${id}/start`, { method: "POST", headers: authHeaders() });
  return res.json();
}

export async function stopScenario(id: string) {
  const res = await fetch(`${API_BASE}/scenarios/${id}/stop`, { method: "POST", headers: authHeaders() });
  return res.json();
}

export async function fetchLiveEvents() {
  const res = await fetch(`${API_BASE}/events/live`, { headers: authHeaders() });
  return res.json();
}

export async function fetchDetectionCoverage() {
  const res = await fetch(`${API_BASE}/detections/coverage`, { headers: authHeaders() });
  return res.json();
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/reports`, { headers: authHeaders() });
  return res.json();
}

export async function downloadExport(format: "json" | "csv") {
  const res = await fetch(`${API_BASE}/reports/export?format=${format}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `firestorm-report.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
