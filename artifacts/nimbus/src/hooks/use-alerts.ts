import { useQueryClient } from "@tanstack/react-query";
import {
  useListNimbusAlerts,
  useCreateNimbusAlert,
  useDeleteNimbusAlert,
  getListNimbusAlertsQueryKey,
} from "@szl-holdings/api-client-react";

export function useAlerts() {
  return useListNimbusAlerts();
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useCreateNimbusAlert({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListNimbusAlertsQueryKey(),
        });
      },
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useDeleteNimbusAlert({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListNimbusAlertsQueryKey(),
        });
      },
    },
  });
}
