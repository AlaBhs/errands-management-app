import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { templatesApi } from "../api/templates.api";
import { templateKeys } from "./templateKeys";
import { isApiError } from "@/shared/api/client";
import type { CreateTemplateFromRequestPayload } from "../types";

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTemplateFromRequestPayload) =>
      templatesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
      toast.success("Template created successfully.");
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : "Failed to create template.");
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
      toast.success("Template deleted.");
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : "Failed to delete template.");
    },
  });
}