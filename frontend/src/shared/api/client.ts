import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiErrorResponse } from "./types";

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  const { useAuthStore } = await import("@/features/auth/store/authStore");
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalConfig = error.config as RetryableConfig;

    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = originalConfig?.url?.includes("/auth/refresh");
    const alreadyRetried = originalConfig?._retry;

    if (is401 && !isRefreshEndpoint && !alreadyRetried) {
      originalConfig._retry = true;

      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { extractUserFromToken } = await import(
          "@/features/auth/utils/jwtUtils"
        );
        const { useAuthStore } = await import(
          "@/features/auth/store/authStore"
        );

        const user = extractUserFromToken(data.accessToken);
        useAuthStore.getState().setAuth(user, data.accessToken);

        originalConfig.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalConfig);
      } catch {
        const { useAuthStore } = await import(
          "@/features/auth/store/authStore"
        );
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(normalizeError(error));
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

// ─── Error normalization ───────────────────────────────────────────────────────
function extractFirstError(errors?: Record<string, string[]>): string {
  if (!errors) return "An unexpected error occurred.";
  const firstKey = Object.keys(errors)[0];
  return errors[firstKey]?.[0] ?? "An unexpected error occurred.";
}

function normalizeError(error: AxiosError<ApiErrorResponse>): NormalizedApiError {
  const apiError = error.response?.data;
  return {
    statusCode: apiError?.statusCode ?? 500,
    errors: apiError?.errors ?? {},
    traceId: apiError?.traceId ?? "",
    message: extractFirstError(apiError?.errors),
  };
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