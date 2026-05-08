export const operationalReportKeys = {
  all:    ["operational-reports"] as const,
  list:   () => [...operationalReportKeys.all, "list"] as const,
  detail: (id: string) => [...operationalReportKeys.all, "detail", id] as const,
};