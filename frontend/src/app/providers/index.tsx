import { AuthInitializer } from "@/features/auth/components/AuthInitializer";
import type { ApiErrorResponse } from "@/shared/api/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode } from "react";
import { Toaster } from "sonner";

function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  if (typeof error !== "object" || error === null) return false;

  const maybeError = error as Partial<ApiErrorResponse>;
  return (
    maybeError.success === false &&
    typeof maybeError.statusCode === "number" &&
    typeof maybeError.traceId === "string" &&
    maybeError.errors !== undefined &&
    maybeError.errors !== null
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: (failureCount, error: unknown) => {
        // If it's a known API error with a client error status code (4xx), don't retry
        if (
          isApiErrorResponse(error) &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        ) {
          return false;
        }
        // Otherwise retry up to 2 times
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
      <Toaster richColors position="top-right" />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
