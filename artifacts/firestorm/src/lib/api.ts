const API_BASE = "/api/firestorm";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("szl_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleAuthError(res: Response) {
  if (res.status === 401) {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    window.location.href = import.meta.env.BASE_URL + "login";
  }
}

export async function fetchScenarios() {
  const res = await fetch(`${API_BASE}/scenarios`, { headers: authHeaders() });
  if (!res.ok) { handleAuthError(res); return []; }
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
  if (!res.ok) { handleAuthError(res); return []; }
  return res.json();
}

export async function fetchDetectionCoverage() {
  const res = await fetch(`${API_BASE}/detections/coverage`, { headers: authHeaders() });
  if (!res.ok) { handleAuthError(res); return null; }
  return res.json();
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/reports`, { headers: authHeaders() });
  if (!res.ok) { handleAuthError(res); return { reports: [], summary: null }; }
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
