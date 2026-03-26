const BASE = import.meta.env.BASE_URL || "/aegis/";

function getApiBase(): string {
  if (typeof window !== "undefined" && window.location) {
    return window.location.origin;
  }
  return "";
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("szl_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function aegisFetch<T>(endpoint: string): Promise<T> {
  const base = getApiBase();
  const url = `${base}/api/aegis/${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
