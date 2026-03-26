import { useState, useEffect, useCallback } from "react";

export interface SocialPlatformStatus {
  platform: string;
  configured: boolean;
  connected: boolean;
  message: string;
  tokenHealth?: string;
}

export interface SocialStatusResult {
  platforms: SocialPlatformStatus[];
  anyConfigured: boolean;
  anyConnected: boolean;
}

export interface QuickPostPayload {
  platform: string;
  content: string;
  status?: string;
  scheduledAt?: string | null;
  mediaUrl?: string | null;
}

export interface SocialPost {
  id: number;
  platform: string;
  content: string;
  status: string;
  scheduledAt?: string | null;
  createdAt?: string;
}

export interface GenerateContentPayload {
  topic: string;
  platforms: string[];
  tone?: string;
  includeHashtags?: boolean;
}

export interface GeneratedPost {
  platform: string;
  content: string;
  hashtags: string[];
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("szl_token");
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

function apiBase(): string {
  if (typeof window === "undefined") return "";
  const base = (window as any).__SZL_API_BASE || "";
  return base;
}

export function useSocialStatus() {
  const [data, setData] = useState<SocialStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase()}/api/social/status`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch social status");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useQuickPost() {
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = useCallback(async (payload: QuickPostPayload) => {
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/api/social-command/posts`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create post");
      const json = await res.json();
      return json.data as SocialPost;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setPosting(false);
    }
  }, []);

  return { createPost, posting, error };
}

export function useSocialFeed(limit = 10) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase()}/api/social-command/posts`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const json = await res.json();
      setPosts((json.data || []).slice(0, limit));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { posts, loading, refresh };
}

export function useContentGenerate() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (payload: GenerateContentPayload) => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/api/social-command/generate`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to generate content");
      const json = await res.json();
      return json.posts as GeneratedPost[];
    } catch (e: any) {
      setError(e.message);
      return [];
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generate, generating, error };
}
