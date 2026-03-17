import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requestsApi } from "../api/requests.api";
import { requestKeys } from "./requestKeys";
import { isApiError } from "@/shared/api/client";
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
      toast.success("Request submitted successfully.");
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : "Failed to submit request.");
    },
  });
}

export function useAssignRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignRequestPayload) =>
      requestsApi.assign(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      toast.success("Courier assigned successfully.");
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : "Failed to assign courier.");
    },
  });
}

export function useStartRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => requestsApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      toast.success("Request started.");
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : "Failed to start request.");
    },
  });
}

export function useCancelRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CancelRequestPayload) =>
      requestsApi.cancel(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      toast.success("Request cancelled.");
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : "Failed to cancel request.");
    },
  });
}

export function useCompleteRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompleteRequestPayload) =>
      requestsApi.complete(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      toast.success("Request marked as completed.");
    },
    onError: (err) => {
      toast.error(
        isApiError(err) ? err.message : "Failed to complete request.",
      );
    },
  });
}

export function useSubmitSurvey(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitSurveyPayload) =>
      requestsApi.submitSurvey(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      toast.success("Survey submitted. Thank you for your feedback!");
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : "Failed to submit survey.");
    },
  });
}
