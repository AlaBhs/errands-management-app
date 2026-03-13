import type { UserQueryParameters } from "../types";

export const userKeys = {
  all: ["users"] as const,
  list: (params?: UserQueryParameters) =>
    [...userKeys.all, "list", params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};
