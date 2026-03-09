import { apiClient } from "@/shared/api/client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/shared/api/types";
import type {
  RequestListItemDto,
  RequestDetailsDto,
  CreateRequestPayload,
  AssignRequestPayload,
  CancelRequestPayload,
  CompleteRequestPayload,
  SubmitSurveyPayload,
} from "../types/request.types";

export const requestsApi = {
  getAll: (params?: PaginationParams) =>
    apiClient
      .get<PaginatedResponse<RequestListItemDto>>("/requests", { params })
      .then((res) => res.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<RequestDetailsDto>>(`/requests/${id}`)
      .then((res) => res.data),

  create: (payload: CreateRequestPayload) =>
    apiClient
      .post<ApiResponse<string>>("/requests", payload)
      .then((res) => res.data),
  assign: (id: string, payload: AssignRequestPayload) =>
    apiClient
      .post<ApiResponse<null>>(`/requests/${id}/assign`, payload)
      .then((res) => res.data),

  start: (id: string) =>
    apiClient
      .post<ApiResponse<null>>(`/requests/${id}/start`, {})
      .then((res) => res.data),

  cancel: (id: string, payload: CancelRequestPayload) =>
    apiClient
      .post<ApiResponse<null>>(`/requests/${id}/cancel`, payload)
      .then((res) => res.data),

  complete: (id: string, payload: CompleteRequestPayload) =>
    apiClient
      .post<ApiResponse<null>>(`/requests/${id}/complete`, payload)
      .then((res) => res.data),

  submitSurvey: (id: string, payload: SubmitSurveyPayload) =>
    apiClient
      .post<ApiResponse<null>>(`/requests/${id}/survey`, payload)
      .then((res) => res.data),
};
