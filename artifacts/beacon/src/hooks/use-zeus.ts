import { useQueryClient } from "@tanstack/react-query";
import {
  useListZeusModules,
  useCreateZeusModule,
  useUpdateZeusModule,
  useDeleteZeusModule,
  useListZeusLogs,
  useCreateZeusLog,
  getListZeusModulesQueryKey,
  getListZeusLogsQueryKey
} from "@workspace/api-client-react";

export function useModules() {
  return useListZeusModules();
}

export function useMutateModules() {
  const queryClient = useQueryClient();
  
  const create = useCreateZeusModule({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListZeusModulesQueryKey() }) }
  });
  
  const update = useUpdateZeusModule({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListZeusModulesQueryKey() }) }
  });
  
  const remove = useDeleteZeusModule({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListZeusModulesQueryKey() }) }
  });

  return { create, update, remove };
}

export function useLogs() {
  return useListZeusLogs();
}

export function useMutateLogs() {
  const queryClient = useQueryClient();
  const create = useCreateZeusLog({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListZeusLogsQueryKey() }) }
  });
  return { create };
}
