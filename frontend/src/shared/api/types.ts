// The envelope every API response arrives in
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  traceId: string;
}

// Error envelope — success: false
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  errors: Record<string, string[]>;
  traceId: string;
}

// Paginated data shape
export interface PaginatedData<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Paginated response = ApiResponse wrapping PaginatedData
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

// Query params reused across all list endpoints
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  descending?: boolean;
}