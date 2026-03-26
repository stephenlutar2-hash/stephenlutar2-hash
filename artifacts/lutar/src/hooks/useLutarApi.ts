import { useQuery } from "@tanstack/react-query";

const getToken = () => localStorage.getItem("szl_token");

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api/lutar${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["lutar", "dashboard"],
    queryFn: () => apiFetch<any>("/dashboard"),
    staleTime: 30000,
  });
}

export function useResearchItems() {
  return useQuery({
    queryKey: ["lutar", "research"],
    queryFn: () => apiFetch<any[]>("/research"),
    staleTime: 30000,
  });
}

export function useSustainabilityMetrics() {
  return useQuery({
    queryKey: ["lutar", "sustainability"],
    queryFn: () => apiFetch<any[]>("/sustainability"),
    staleTime: 30000,
  });
}

export function useFinancialData() {
  return useQuery({
    queryKey: ["lutar", "financial"],
    queryFn: () => apiFetch<any[]>("/financial"),
    staleTime: 30000,
  });
}

export function useDivisionData() {
  return useQuery({
    queryKey: ["lutar", "divisions"],
    queryFn: () => apiFetch<any[]>("/divisions"),
    staleTime: 30000,
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ["lutar", "insights"],
    queryFn: () => apiFetch<any[]>("/insights"),
    staleTime: 30000,
  });
}
