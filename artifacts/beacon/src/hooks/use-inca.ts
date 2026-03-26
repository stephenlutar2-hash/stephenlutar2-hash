import { useQueryClient } from "@tanstack/react-query";
import {
  useListIncaProjects,
  useCreateIncaProject,
  useUpdateIncaProject,
  useDeleteIncaProject,
  useListIncaExperiments,
  useCreateIncaExperiment,
  getListIncaProjectsQueryKey,
  getListIncaExperimentsQueryKey
} from "@szl-holdings/api-client-react";

export function useIncaProjects() {
  return useListIncaProjects();
}

export function useMutateIncaProjects() {
  const queryClient = useQueryClient();
  
  const create = useCreateIncaProject({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListIncaProjectsQueryKey() }) }
  });
  
  const update = useUpdateIncaProject({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListIncaProjectsQueryKey() }) }
  });
  
  const remove = useDeleteIncaProject({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListIncaProjectsQueryKey() }) }
  });

  return { create, update, remove };
}

export function useExperiments() {
  return useListIncaExperiments();
}

export function useMutateExperiments() {
  const queryClient = useQueryClient();
  const create = useCreateIncaExperiment({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListIncaExperimentsQueryKey() }) }
  });
  return { create };
}
