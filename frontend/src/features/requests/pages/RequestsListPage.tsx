import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LayoutGrid, List } from "lucide-react";
import { useRequests } from "../hooks";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { isApiError } from "@/shared/api/client";
import { formatDate } from "@/shared/utils/date";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { PriorityBadge } from "@/shared/components/PriorityBadge";
import { cn } from "@/shared/utils/utils";
import { useViewMode } from "../hooks/useViewMode";
import {
  RequestFilters,
  type RequestFiltersValue,
} from "../components/common/RequestFilters";
import { RequestCard } from "../components/common/RequestCard";
import { RequestListSkeleton } from "../components/skeletons/RequestListSkeleton";
import type { PriorityLevel } from "../types";

const PAGE_SIZE = 12;

const DEFAULT_FILTERS: RequestFiltersValue = {
  search: "",
  status: "",
  category: "",
  sortBy: "createdat",
  descending: true,
  isOverdue: undefined,
};

export function RequestsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialIsOverdue = (() => {
    const param = searchParams.get("isOverdue");
    if (param === null) return undefined;
    return param === "true";
  })();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RequestFiltersValue>({
    search: "",
    status: "",
    category: "",
    sortBy: "createdat",
    descending: true,
    isOverdue: initialIsOverdue,
  });
  const [viewMode, setViewMode] = useViewMode("admin-requests-view");

  const handleFilterChange = (next: Partial<RequestFiltersValue>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const { data, isLoading, isError, error } = useRequests({
    page,
    pageSize: PAGE_SIZE,
    search: filters.search || undefined,
    sortBy: filters.sortBy || undefined,
    descending: filters.descending,
    status: filters.status || undefined,
    category: filters.category || undefined,
    isOverdue: filters.isOverdue,
  });

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            All Requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data
              ? `${data.totalCount} request${data.totalCount !== 1 ? "s" : ""} total`
              : "System-wide view of all requests"}
          </p>
        </div>

        {/* View toggle */}
        <div
          className="flex items-center gap-1 rounded-lg border border-border
                          bg-white dark:bg-card p-1 shadow-sm"
        >
          <button
            onClick={() => setViewMode("table")}
            aria-label="Table view"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md",
              "transition-colors",
              viewMode === "table"
                ? "bg-[#2E2E38] text-white dark:bg-[#FFE600] dark:text-[#2E2E38] shadow-sm"
                : "text-muted-foreground hover:bg-muted dark:hover:bg-white/10",
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("card")}
            aria-label="Card view"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md",
              "transition-colors",
              viewMode === "card"
                ? "bg-[#2E2E38] text-white dark:bg-[#FFE600] dark:text-[#2E2E38] shadow-sm"
                : "text-muted-foreground hover:bg-muted dark:hover:bg-white/10",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <RequestFilters
        value={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        role={"admin"}
      />

      {/* ── Error ───────────────────────────────────────────────────── */}
      {isError && (
        <ErrorMessage
          message={isApiError(error) ? error.message : "Something went wrong."}
        />
      )}

      {/* ── Loading skeleton ────────────────────────────────────────── */}
      {isLoading && <RequestListSkeleton mode={viewMode} />}

      {/* ── Content ─────────────────────────────────────────────────── */}
      {data && !isLoading && (
        <>
          {data.items.length === 0 ? (
            <EmptyState
              hasFilters={
                !!(filters.search || filters.status || filters.category)
              }
            />
          ) : viewMode === "card" ? (
            // ── Card grid ─────────────────────────────────────────────
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          ) : (
            // ── Table ─────────────────────────────────────────────────
            <div
              className="overflow-hidden rounded-xl border
                            bg-card shadow-sm"
            >
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {[
                      "Title",
                      "Category",
                      "Priority",
                      "Status",
                      "Deadline",
                      "Est. Cost",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs
                                   font-medium text-muted-foreground
                                   uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => navigate(`/requests/${req.id}`)}
                      className={cn(
                        "group cursor-pointer transition-colors hover:bg-muted/40",
                        req.priority === "Urgent" &&
                          req.status !== "Completed" &&
                          req.status !== "Cancelled" &&
                          "bg-red-50/50 dark:bg-red-950/20 ring-1 ring-red-200 dark:ring-red-800",
                      )}
                    >
                      {/* Left border accent via box-shadow trick */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-full w-0.5 rounded-full shrink-0 self-stretch",
                              {
                                "bg-gray-300": req.priority === "Low",
                                "bg-blue-400": req.priority === "Normal",
                                "bg-orange-400": req.priority === "High",
                                "bg-red-500": req.priority === "Urgent",
                              },
                            )}
                          />
                          <span
                            className="font-medium text-foreground
                                           truncate max-w-[200px]"
                          >
                            {req.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {req.category}
                      </td>
                      <td className="px-4 py-3.5">
                        <PriorityBadge
                          priority={req.priority as PriorityLevel}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={req.status} />
                      </td>
                      <td
                        className="px-4 py-3.5 text-muted-foreground
                                     whitespace-nowrap"
                      >
                        {req.deadline ? formatDate(req.deadline) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {req.estimatedCost != null
                          ? `$${req.estimatedCost}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ──────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between
                          text-sm text-muted-foreground"
          >
            <span>
              {data.totalCount === 0
                ? "No results"
                : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                    page * PAGE_SIZE,
                    data.totalCount,
                  )} of ${data.totalCount}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border px-3 py-1.5 text-xs
                           font-medium transition-colors
                           hover:bg-accent disabled:opacity-40
                           disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from(
                {
                  length: Math.ceil(data.totalCount / PAGE_SIZE),
                },
                (_, i) => i + 1,
              )
                .filter(
                  (p) =>
                    p === 1 ||
                    p === Math.ceil(data.totalCount / PAGE_SIZE) ||
                    Math.abs(p - page) <= 1,
                )
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-1 text-muted-foreground"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium",
                        "transition-colors",
                        page === p
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-accent",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * PAGE_SIZE >= data.totalCount}
                className="rounded-lg border px-3 py-1.5 text-xs
                           font-medium transition-colors
                           hover:bg-accent disabled:opacity-40
                           disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center
                    rounded-xl border bg-card py-16 text-center"
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center
                      rounded-full bg-muted"
      >
        <List className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {hasFilters ? "No requests match your filters" : "No requests yet"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {hasFilters
          ? "Try adjusting or clearing your filters"
          : "Requests will appear here once created"}
      </p>
    </div>
  );
}
