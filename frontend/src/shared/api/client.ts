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
  if (config.params) {
    config.params = cleanParams(config.params);
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
    const isLoginEndpoint = originalConfig?.url?.includes("/auth/login");
    const alreadyRetried = originalConfig?._retry;

    if (is401 && !isRefreshEndpoint && !alreadyRetried && !isLoginEndpoint) {
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
function normalizeError(error: AxiosError<ApiErrorResponse>): NormalizedApiError {
  // Cast to any to access both camelCase and PascalCase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiError = error.response?.data as any;

  const statusCode = apiError?.statusCode ?? apiError?.StatusCode ?? 500;
  const rawErrors = apiError?.errors ?? apiError?.Errors ?? {};
  const traceId = apiError?.traceId ?? apiError?.TraceId ?? "";

  // Convert rawErrors to the expected Record<string, string[]> format
  const errors: Record<string, string[]> = {};
  for (const key in rawErrors) {
    const value = rawErrors[key];
    if (Array.isArray(value)) {
      errors[key] = value;
    } else if (typeof value === "string") {
      errors[key] = [value];
    }
  }

  // Extract the first error message
  let message = "An unexpected error occurred.";
  const firstKey = Object.keys(errors)[0];
  if (firstKey && errors[firstKey]?.length) {
    message = errors[firstKey][0];
  }

  return { statusCode, errors, traceId, message };
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

function cleanParams(params?: Record<string, unknown>) {
  if (!params) return params;

  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );
}