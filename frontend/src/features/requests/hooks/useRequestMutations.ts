import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi } from "../api/requests.api";
import { requestKeys } from "./requestKeys";
import type {
  CreateRequestPayload,
  AssignRequestPayload,
  CancelRequestPayload,
  CompleteRequestPayload,
  SubmitSurveyPayload,
} from "../types";

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => requestsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
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