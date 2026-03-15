import { useQuery } from "@tanstack/react-query";
import { requestsApi } from "../api/requests.api";
import { requestKeys } from "./requestKeys";
import type { RequestQueryParams } from "../types";

export function useRequests(params?: RequestQueryParams) {
  return useQuery({
    queryKey: requestKeys.list(params),
    queryFn: () => requestsApi.getAll(params),
    select: (res) => res.data,
  });
}

export function useMyRequests(params?: RequestQueryParams) {
  return useQuery({
    queryKey: requestKeys.mine(params),
    queryFn: () => requestsApi.getMine(params),
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
