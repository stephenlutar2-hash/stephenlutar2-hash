import { useQueryClient } from "@tanstack/react-query";
import {
  useListNimbusPredictions,
  useCreateNimbusPrediction,
  useDeleteNimbusPrediction,
  getListNimbusPredictionsQueryKey,
} from "@szl-holdings/api-client-react";

export function usePredictions() {
  return useListNimbusPredictions();
}

export function useCreatePrediction() {
  const queryClient = useQueryClient();
  return useCreateNimbusPrediction({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListNimbusPredictionsQueryKey(),
        });
      },
    },
  });
}

export function useDeletePrediction() {
  const queryClient = useQueryClient();
  return useDeleteNimbusPrediction({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListNimbusPredictionsQueryKey(),
        });
      },
    },
  });
}
