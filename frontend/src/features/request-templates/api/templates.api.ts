import { apiClient } from "@/shared/api/client";
import type { ApiResponse, PaginatedResponse } from "@/shared/api/types";
import type {
  RequestTemplateListItemDto,
  RequestTemplateDetailsDto,
  CreateTemplateFromRequestPayload,
  TemplateQueryParams,
} from "../types";

export const templatesApi = {
  create: (payload: CreateTemplateFromRequestPayload) =>
    apiClient
      .post<ApiResponse<string>>("/request-templates", payload)
      .then((res) => res.data),

  getAll: (params?: TemplateQueryParams) =>
    apiClient
      .get<
        PaginatedResponse<RequestTemplateListItemDto>
      >("/request-templates", { params })
      .then((res) => res.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<RequestTemplateDetailsDto>>(`/request-templates/${id}`)
      .then((res) => {
        return res.data;
      }),

  delete: (id: string) =>
    apiClient
      .delete<ApiResponse<null>>(`/request-templates/${id}`)
      .then((res) => res.data),
};
