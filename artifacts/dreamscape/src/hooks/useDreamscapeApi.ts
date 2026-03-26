import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getToken = () => localStorage.getItem("szl_token");

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api/dreamscape${path}`, {
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

function norm(item: any, idField: string) {
  return { ...item, id: item[idField] || item.id };
}

export function useWorlds() {
  return useQuery({
    queryKey: ["dreamscape", "worlds"],
    queryFn: async () => {
      const data = await apiFetch<any[]>("/worlds");
      return data.map(w => norm(w, "worldId"));
    },
    staleTime: 30000,
  });
}

export function useWorld(worldId: string | undefined) {
  return useQuery({
    queryKey: ["dreamscape", "worlds", worldId],
    queryFn: async () => {
      const data = await apiFetch<any>(`/worlds/${worldId}`);
      return data ? norm(data, "worldId") : null;
    },
    enabled: !!worldId,
    staleTime: 30000,
  });
}

export function useProjects(worldId?: string) {
  const params = worldId ? `?worldId=${worldId}` : "";
  return useQuery({
    queryKey: ["dreamscape", "projects", worldId],
    queryFn: async () => {
      const data = await apiFetch<any[]>(`/projects${params}`);
      return data.map(p => norm(p, "projectId"));
    },
    staleTime: 30000,
  });
}

export function useArtifacts(opts?: { worldId?: string; projectId?: string }) {
  const params = new URLSearchParams();
  if (opts?.worldId) params.set("worldId", opts.worldId);
  if (opts?.projectId) params.set("projectId", opts.projectId);
  const qs = params.toString();
  return useQuery({
    queryKey: ["dreamscape", "artifacts", opts],
    queryFn: async () => {
      const data = await apiFetch<any[]>(`/artifacts${qs ? `?${qs}` : ""}`);
      return data.map(a => norm(a, "artifactId"));
    },
    staleTime: 15000,
  });
}

export function useArtifact(artifactId: string | undefined) {
  return useQuery({
    queryKey: ["dreamscape", "artifacts", artifactId],
    queryFn: async () => {
      const data = await apiFetch<any>(`/artifacts/${artifactId}`);
      return data ? norm(data, "artifactId") : null;
    },
    enabled: !!artifactId,
    staleTime: 30000,
  });
}

export function useGenerationHistory() {
  return useQuery({
    queryKey: ["dreamscape", "generation-history"],
    queryFn: async () => {
      const data = await apiFetch<any[]>("/generation-history");
      return data.map(g => norm(g, "genId"));
    },
    staleTime: 10000,
  });
}

export function useGenerate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { prompt: string; type: string; worldName: string; projectName: string; style?: string; creativity?: number; detail?: number; stylization?: number }) =>
      apiFetch<any>("/generate", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dreamscape", "generation-history"] });
      qc.invalidateQueries({ queryKey: ["dreamscape", "artifacts"] });
    },
  });
}

export function usePipelineItems() {
  return useQuery({
    queryKey: ["dreamscape", "pipeline"],
    queryFn: () => apiFetch<any[]>("/pipeline"),
    staleTime: 15000,
  });
}

export function useUpdatePipelineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; stage?: string; quality?: number }) =>
      apiFetch<any>(`/pipeline/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dreamscape", "pipeline"] });
    },
  });
}
