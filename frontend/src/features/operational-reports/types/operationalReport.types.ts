export interface OperationalReportSummary {
  id: string;
  generatedAt: string;
  periodFrom: string;
  periodTo: string;
  aiUnavailable: boolean;
}

export interface AiAnalysis {
  anomalies: string[];
  causes: string[];
  actions: string[];
  highlights: string[];
}

export interface OperationalReport extends OperationalReportSummary {
  metricsSnapshot: string;
  aiAnalysis: string | null;
  generatedByUserId: string;
}

export interface MetricsSnapshot {
  Summary: {
    TotalRequests: number;
    ByStatus: Record<string, number>;
    ByCategory: Record<string, number>;
    AvgLifecycleMinutes: number | null;
    AvgExecutionMinutes: number | null;
    AvgQueueWaitMinutes: number | null;
    AvgPickupDelayMinutes: number | null;
    AvgSurveyRating: number | null;
    DeadlineComplianceRate: number | null;
    TotalEstimatedCost: number;
    TotalActualCost: number;
    BudgetVariance: number | null;
  };
}

export interface GenerateReportPayload {
  from?: string | null;
  to?: string | null;
}
