export interface AnalyticsSummary {
  totalRequests: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  avgCompletionTimeMinutes: number | null;
  avgSurveyRating: number | null;
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