import type { RequestCategory } from "@/features/requests/types/request.enums";
import type { PaginationParams } from "@/shared/api/types";

export interface CreateTemplateFromRequestPayload {
  requestId: string;
  templateName: string;
}

export interface TemplateQueryParams extends PaginationParams {
  search?: string;
  category?: RequestCategory;
}