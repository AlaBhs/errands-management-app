import type { TemplateQueryParams } from "../types";

export const templateKeys = {
  all: ["request-templates"] as const,
  list: (params?: TemplateQueryParams) =>
    [...templateKeys.all, "list", params] as const,
  detail: (id: string) =>
    [...templateKeys.all, "detail", id] as const,
};