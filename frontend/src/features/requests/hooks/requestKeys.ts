import type { RequestQueryParams } from "../types";

export const requestKeys = {
  all: ["requests"] as const,
  list: (params?: RequestQueryParams) => [...requestKeys.all, "list", params] as const,
  detail: (id: string) => [...requestKeys.all, "detail", id] as const,
};