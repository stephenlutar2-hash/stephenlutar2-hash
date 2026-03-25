import { useQueryClient } from "@tanstack/react-query";
import {
  useListBeaconMetrics,
  useCreateBeaconMetric,
  useUpdateBeaconMetric,
  useDeleteBeaconMetric,
  useListBeaconProjects,
  useCreateBeaconProject,
  useUpdateBeaconProject,
  useDeleteBeaconProject,
  getListBeaconMetricsQueryKey,
  getListBeaconProjectsQueryKey
} from "@workspace/api-client-react";

export function useMetrics() {
  return useListBeaconMetrics();
}

export function useMutateMetrics() {
  const queryClient = useQueryClient();
  
  const create = useCreateBeaconMetric({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBeaconMetricsQueryKey() })
    }
  });
  
  const update = useUpdateBeaconMetric({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBeaconMetricsQueryKey() })
    }
  });
  
  const remove = useDeleteBeaconMetric({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBeaconMetricsQueryKey() })
    }
  });

  return { create, update, remove };
}

export function useProjects() {
  return useListBeaconProjects();
}

export function useMutateProjects() {
  const queryClient = useQueryClient();
  
  const create = useCreateBeaconProject({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBeaconProjectsQueryKey() })
    }
  });
  
  const update = useUpdateBeaconProject({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBeaconProjectsQueryKey() })
    }
  });
  
  const remove = useDeleteBeaconProject({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBeaconProjectsQueryKey() })
    }
  });

  return { create, update, remove };
}
