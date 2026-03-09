import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi } from "../api/requests.api";
import type { PaginationParams } from "@/shared/api/types";
import type { AssignRequestPayload, CancelRequestPayload, CompleteRequestPayload, CreateRequestPayload, SubmitSurveyPayload } from "../types/request.types";

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

export function useAssignRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignRequestPayload) => requestsApi.assign(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
    },
  });
}

export function useStartRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => requestsApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
    },
  });
}

export function useCancelRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CancelRequestPayload) => requestsApi.cancel(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
    },
  });
}

export function useCompleteRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompleteRequestPayload) => requestsApi.complete(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
    },
  });
}

export function useSubmitSurvey(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitSurveyPayload) => requestsApi.submitSurvey(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
    },
  });
}