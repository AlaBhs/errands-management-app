import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "./types";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  return config;
});

// Response interceptor — normalize errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const apiError = error.response?.data;

    const normalizedError = {
      statusCode: apiError?.statusCode ?? 500,
      errors: apiError?.errors ?? {},
      traceId: apiError?.traceId ?? "",
      message: extractFirstError(apiError?.errors),
    };

    return Promise.reject(normalizedError);
  }
);

function extractFirstError(
  errors?: Record<string, string[]>
): string {
  if (!errors) return "An unexpected error occurred.";
  const firstKey = Object.keys(errors)[0];
  return errors[firstKey]?.[0] ?? "An unexpected error occurred.";
}

export interface NormalizedApiError {
  statusCode: number;
  errors: Record<string, string[]>;
  traceId: string;
  message: string;
}

export function isApiError(error: unknown): error is NormalizedApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    "message" in error
  );
}