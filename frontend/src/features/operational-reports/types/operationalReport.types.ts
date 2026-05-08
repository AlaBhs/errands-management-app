export interface OperationalReportSummary {
  id: string;
  generatedAt: string;   // ISO string
  periodFrom: string;
  periodTo: string;
  aiUnavailable: boolean;
}

export interface AiAnalysis {
  anomalies: string[];
  causes: string[];
  actions: string[];
}

export interface OperationalReport extends OperationalReportSummary {
  metricsSnapshot: string;   // raw JSON — parse before use
  aiAnalysis: string | null; // raw JSON — parse before use
  generatedByUserId: string;
}

// Parsed metrics shape (subset used by the UI)
export interface MetricsSnapshot {
  Summary: {
    totalRequests: number;
    avgExecutionMinutes: number | null;
    deadlineComplianceRate: number | null;
    totalEstimatedCost: number;
    totalActualCost: number;
    budgetVariance: number | null;
  };
}

export interface GenerateReportPayload {
  from?: string | null;
  to?: string | null;
}