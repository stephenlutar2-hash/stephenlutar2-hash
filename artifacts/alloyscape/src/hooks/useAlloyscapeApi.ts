import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getToken = () => localStorage.getItem("szl_token");

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api/alloyscape${path}`, {
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

function normalize(item: any, idField: string) {
  return { ...item, id: item[idField] || item.id };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["alloyscape", "dashboard"],
    queryFn: () => apiFetch<any>("/dashboard"),
    staleTime: 30000,
  });
}

export function useModules() {
  return useQuery({
    queryKey: ["alloyscape", "modules"],
    queryFn: async () => {
      const data = await apiFetch<any[]>("/modules");
      return data.map(m => normalize(m, "moduleId"));
    },
    staleTime: 15000,
  });
}

export function useRestartModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (moduleId: string) => apiFetch<any>(`/modules/${moduleId}/restart`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alloyscape", "modules"] });
      qc.invalidateQueries({ queryKey: ["alloyscape", "dashboard"] });
    },
  });
}

export function useUpdateModuleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, status }: { moduleId: string; status: string }) =>
      apiFetch<any>(`/modules/${moduleId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alloyscape", "modules"] });
      qc.invalidateQueries({ queryKey: ["alloyscape", "dashboard"] });
    },
  });
}

export function useWorkflows() {
  return useQuery({
    queryKey: ["alloyscape", "workflows"],
    queryFn: async () => {
      const data = await apiFetch<any[]>("/workflows");
      return data.map(w => normalize(w, "workflowId"));
    },
    staleTime: 10000,
  });
}

export function useTriggerWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workflowId: string) => apiFetch<any>(`/workflows/${workflowId}/trigger`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alloyscape", "workflows"] });
      qc.invalidateQueries({ queryKey: ["alloyscape", "dashboard"] });
    },
  });
}

export function useUpdateWorkflowStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workflowId, status }: { workflowId: string; status: string }) =>
      apiFetch<any>(`/workflows/${workflowId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alloyscape", "workflows"] });
    },
  });
}

export function useLogs(opts?: { level?: string; service?: string }) {
  const params = new URLSearchParams();
  if (opts?.level) params.set("level", opts.level);
  if (opts?.service) params.set("service", opts.service);
  const qs = params.toString();
  return useQuery({
    queryKey: ["alloyscape", "logs", opts],
    queryFn: async () => {
      const data = await apiFetch<any[]>(`/logs${qs ? `?${qs}` : ""}`);
      return data.map(l => normalize(l, "logId"));
    },
    staleTime: 5000,
  });
}

export function useConnectors() {
  return useQuery({
    queryKey: ["alloyscape", "connectors"],
    queryFn: async () => {
      const data = await apiFetch<any[]>("/connectors");
      return data.map(c => normalize(c, "connectorId"));
    },
    staleTime: 15000,
  });
}

export function useUpdateConnectorStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ connectorId, status }: { connectorId: string; status: string }) =>
      apiFetch<any>(`/connectors/${connectorId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alloyscape", "connectors"] });
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["alloyscape", "services"],
    queryFn: async () => {
      const data = await apiFetch<any[]>("/services");
      return data.map(s => normalize(s, "serviceId"));
    },
    staleTime: 15000,
  });
}
