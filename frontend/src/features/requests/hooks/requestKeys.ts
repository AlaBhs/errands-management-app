import type { PaginationParams } from "@/shared/api/types";

export const requestKeys = {
  all: ["requests"] as const,
  list: (params?: PaginationParams) => [...requestKeys.all, "list", params] as const,
  detail: (id: string) => [...requestKeys.all, "detail", id] as const,
};