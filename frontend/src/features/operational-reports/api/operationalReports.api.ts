import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type {
  GenerateReportPayload,
  OperationalReport,
  OperationalReportSummary,
} from "../types/operationalReport.types";

export const operationalReportsApi = {
  generate: (payload: GenerateReportPayload) =>
    apiClient
      .post<ApiResponse<OperationalReport>>(
        "/operational-reports/generate",
        payload,
      )
      .then((res) => res.data),

  getAll: () =>
    apiClient
      .get<ApiResponse<OperationalReportSummary[]>>("/operational-reports")
      .then((res) => res.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<OperationalReport>>(`/operational-reports/${id}`)
      .then((res) => res.data),
};