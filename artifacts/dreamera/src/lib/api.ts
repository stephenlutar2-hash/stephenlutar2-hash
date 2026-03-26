const API_BASE = "/api";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("szl_token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export async function getSocialStatus() {
  return apiRequest<any>("/social/status");
}

export async function getSocialAnalytics(platform?: string) {
  const q = platform ? `?platform=${platform}` : "";
  return apiRequest<any>(`/social/analytics${q}`);
}

export async function publishPost(data: { platform: string; content: string; mediaUrl?: string }) {
  return apiRequest<any>("/social/publish", { method: "POST", body: JSON.stringify(data) });
}

export async function crossPost(data: { content: string; platforms: string[]; mediaUrl?: string; schedule?: boolean }) {
  return apiRequest<any>("/social/cross-post", { method: "POST", body: JSON.stringify(data) });
}

export async function adaptContent(data: { content: string; platforms?: string[] }) {
  return apiRequest<any>("/social/adapt-content", { method: "POST", body: JSON.stringify(data) });
}

export async function getOptimalTimes(platform?: string) {
  const q = platform ? `?platform=${platform}` : "";
  return apiRequest<any>(`/social/optimal-times${q}`);
}

export async function getOAuthUrl(platform: string) {
  return apiRequest<{ authUrl: string | null; directConnect?: boolean; connected?: boolean }>(`/social/oauth/${platform}/authorize`);
}

export async function disconnectPlatform(platform: string) {
  return apiRequest<any>("/social/disconnect", { method: "POST", body: JSON.stringify({ platform }) });
}

export async function listScheduledPosts(params?: { status?: string; platform?: string }) {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.platform) q.set("platform", params.platform);
  return apiRequest<any>(`/social-command/posts?${q}`);
}

export async function createScheduledPost(data: any) {
  return apiRequest<any>("/social-command/posts", { method: "POST", body: JSON.stringify(data) });
}

export async function updateScheduledPost(id: number, data: any) {
  return apiRequest<any>(`/social-command/posts/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteScheduledPost(id: number) {
  return apiRequest<any>(`/social-command/posts/${id}`, { method: "DELETE" });
}

export async function generateContent(data: { topic: string; platforms: string[]; tone: string; includeHashtags: boolean }) {
  return apiRequest<any>("/social-command/generate", { method: "POST", body: JSON.stringify(data) });
}

export async function listTemplates() {
  return apiRequest<any>("/social-command/templates");
}

export async function createTemplate(data: any) {
  return apiRequest<any>("/social-command/templates", { method: "POST", body: JSON.stringify(data) });
}

export async function updateTemplate(id: number, data: any) {
  return apiRequest<any>(`/social-command/templates/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteTemplate(id: number) {
  return apiRequest<any>(`/social-command/templates/${id}`, { method: "DELETE" });
}

export async function listBrandAssets() {
  return apiRequest<any>("/social-command/assets");
}

export async function createBrandAsset(data: any) {
  return apiRequest<any>("/social-command/assets", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteBrandAsset(id: number) {
  return apiRequest<any>(`/social-command/assets/${id}`, { method: "DELETE" });
}

export async function getCalendarData(month: number, year: number) {
  return apiRequest<any>(`/social-command/calendar?month=${month}&year=${year}`);
}

export async function reschedulePost(id: number, scheduledAt: string) {
  return apiRequest<any>(`/social-command/posts/${id}/reschedule`, { method: "POST", body: JSON.stringify({ scheduledAt }) });
}

export async function getTokenHealth() {
  return apiRequest<any>("/social/token-health");
}

export async function seedCalendar(data?: { username?: string; startDate?: string }) {
  return apiRequest<any>("/social/seed-calendar", { method: "POST", body: JSON.stringify(data || {}) });
}

export async function pollEngagement(postId: number) {
  return apiRequest<any>(`/social/poll-engagement/${postId}`, { method: "POST" });
}

export async function getEngagementFeed() {
  return apiRequest<any>("/social/engagement-feed");
}
