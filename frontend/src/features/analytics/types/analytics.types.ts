export interface AnalyticsSummary {
  totalRequests: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  avgLifecycleMinutes: number | null;
  avgExecutionMinutes: number | null; // Started → Completed
  avgQueueWaitMinutes: number | null; // Created → Assigned
  avgPickupDelayMinutes: number | null; // Assigned → Started
  avgSurveyRating: number | null;
  deadlineComplianceRate: number | null;
  totalEstimatedCost: number;
  totalActualCost: number;
}

export interface TrendPoint {
  year: number;
  month: number;
  count: number;
}

export interface CostBreakdown {
  category: string;
  estimatedCost: number;
  actualCost: number;
}

export interface CourierPerformance {
  courierId: string;
  courierName: string;
  totalAssignments: number;
  completed: number;
  cancelled: number;
  avgExecutionMinutes: number | null;
  avgRating: number | null;
  onTimeRate: number | null;
}

export interface AnalyticsFilter {
  from: string | null; // ISO date string YYYY-MM-DD
  to: string | null;
}