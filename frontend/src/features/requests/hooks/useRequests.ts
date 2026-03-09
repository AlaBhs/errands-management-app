import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi } from "../api/requests.api";
import type { PaginationParams } from "@/shared/api/types";
import type { CreateRequestPayload } from "../types/request.types";

export const requestKeys = {
  all: ["requests"] as const,
  list: (params?: PaginationParams) => [...requestKeys.all, "list", params] as const,
  detail: (id: string) => [...requestKeys.all, "detail", id] as const,
};

export function useRequests(params?: PaginationParams) {
  return useQuery({
    queryKey: requestKeys.list(params),
    queryFn: () => requestsApi.getAll(params),
    select: (res) => res.data,
  });
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => requestsApi.getById(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => requestsApi.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
      return res.data;
    },
  });
}