import type { RequestQueryParams } from "../types";

export const requestKeys = {
  all: ["requests"] as const,
  list: (params?: RequestQueryParams) =>
    [...requestKeys.all, "list", params] as const,
  mine: (params?: RequestQueryParams) =>
    [...requestKeys.all, "mine", params] as const,
  assignments: (params?: RequestQueryParams) =>
    [...requestKeys.all, "assignments", params] as const,
  detail: (id: string) => [...requestKeys.all, "detail", id] as const,
  candidates: (id: string) =>
    [...requestKeys.detail(id), "candidates"] as const,
  expenses: (requestId: string) =>
    [...requestKeys.detail(requestId), "expenses"] as const,
  expenseSummary: (requestId: string) =>
    [...requestKeys.detail(requestId), "expenseSummary"] as const,
};
