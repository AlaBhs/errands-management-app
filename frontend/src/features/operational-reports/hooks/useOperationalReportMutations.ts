import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isApiError } from "@/shared/api/client";
import { operationalReportsApi } from "../api/operationalReports.api";
import { operationalReportKeys } from "./operationalReportKeys";
import type { GenerateReportPayload } from "../types/operationalReport.types";

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateReportPayload) =>
      operationalReportsApi.generate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: operationalReportKeys.list() });
      toast.success("Report generated successfully.");
    },
    onError: (err) => {
      toast.error(
        isApiError(err) ? err.message : "Failed to generate report.",
      );
    },
  });
}