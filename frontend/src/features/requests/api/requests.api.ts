import { apiClient } from "@/shared/api/client";
import type { ApiResponse, PaginatedResponse } from "@/shared/api/types";
import type {
  RequestListItemDto,
  RequestDetailsDto,
  CreateRequestPayload,
  AssignRequestPayload,
  CancelRequestPayload,
  CompleteRequestPayload,
  SubmitSurveyPayload,
  RequestQueryParams,
} from "@/features/requests/types";

export const requestsApi = {
  getAll: (params?: RequestQueryParams) =>
    apiClient
      .get<PaginatedResponse<RequestListItemDto>>("/requests", { params })
      .then((res) => res.data),

  getMine: (params?: RequestQueryParams) =>
    apiClient
      .get<PaginatedResponse<RequestListItemDto>>("/requests/mine", { params })
      .then((res) => res.data),

  getMyAssignments: (params?: RequestQueryParams) =>
    apiClient
      .get<
        PaginatedResponse<RequestListItemDto>
      >("/requests/assignments", { params })
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

  complete: async (
    id: string,
    payload: CompleteRequestPayload,
  ): Promise<ApiResponse<null>> => {
    const form = new FormData();

    if (payload.actualCost !== undefined && payload.actualCost !== null)
      form.append("actualCost", payload.actualCost.toString());

    if (payload.note) form.append("note", payload.note);

    if (payload.dischargePhoto)
      form.append("dischargePhoto", payload.dischargePhoto);

    const { data } = await apiClient.post<ApiResponse<null>>(
      `/requests/${id}/complete`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  submitSurvey: (id: string, payload: SubmitSurveyPayload) =>
    apiClient
      .post<ApiResponse<null>>(`/requests/${id}/survey`, payload)
      .then((res) => res.data),
};
