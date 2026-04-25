import { useQuery } from "@tanstack/react-query";
import { templatesApi } from "../api/templates.api";
import { templateKeys } from "./templateKeys";
import type { TemplateQueryParams } from "../types";

export function useMyTemplates(params?: TemplateQueryParams) {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: () => templatesApi.getAll(params),
    select: (res) => res.data,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => templatesApi.getById(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}