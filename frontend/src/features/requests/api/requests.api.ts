import { apiClient } from "@/shared/api/client";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/shared/api/types";
import type {
  RequestListItemDto,
  RequestDetailsDto,
  CreateRequestPayload,
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
};