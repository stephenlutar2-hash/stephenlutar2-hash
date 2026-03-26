import { useQueryClient } from "@tanstack/react-query";
import {
  useListDreameraContent,
  useCreateDreameraContent,
  useUpdateDreameraContent,
  useDeleteDreameraContent,
  useListDreameraCampaigns,
  useCreateDreameraCampaign,
  useDeleteDreameraCampaign,
  getListDreameraContentQueryKey,
  getListDreameraCampaignsQueryKey
} from "@szl-holdings/api-client-react";

export function useContent() {
  return useListDreameraContent();
}

export function useMutateContent() {
  const queryClient = useQueryClient();
  
  const create = useCreateDreameraContent({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDreameraContentQueryKey() }) }
  });
  
  const update = useUpdateDreameraContent({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDreameraContentQueryKey() }) }
  });
  
  const remove = useDeleteDreameraContent({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDreameraContentQueryKey() }) }
  });

  return { create, update, remove };
}

export function useCampaigns() {
  return useListDreameraCampaigns();
}

export function useMutateCampaigns() {
  const queryClient = useQueryClient();
  const create = useCreateDreameraCampaign({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDreameraCampaignsQueryKey() }) }
  });
  const remove = useDeleteDreameraCampaign({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDreameraCampaignsQueryKey() }) }
  });
  return { create, remove };
}
