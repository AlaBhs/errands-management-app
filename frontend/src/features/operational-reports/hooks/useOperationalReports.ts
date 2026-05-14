import { useQuery } from "@tanstack/react-query";
import { operationalReportsApi } from "../api/operationalReports.api";
import { operationalReportKeys } from "./operationalReportKeys";

export const useOperationalReports = () =>
  useQuery({
    queryKey: operationalReportKeys.list(),
    queryFn: () => operationalReportsApi.getAll(),
    select: (res) => res.data,
  });

export const useOperationalReportById = (id: string | null) =>
  useQuery({
    queryKey: operationalReportKeys.detail(id ?? ""),
    queryFn: () => operationalReportsApi.getById(id!),
    select: (res) => res.data,
    enabled: !!id,
  });