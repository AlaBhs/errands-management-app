import { useQuery } from "@tanstack/react-query";
import { requestsApi } from "../api/requests.api";
import type { PaginationParams } from "@/shared/api/types";
import { requestKeys } from "./requestKeys";

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