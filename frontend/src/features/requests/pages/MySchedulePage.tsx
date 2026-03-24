import { useState } from "react";
import { LayoutGrid, List, CalendarClock, Zap } from "lucide-react";
import { useMyAssignments } from "../hooks";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { isApiError } from "@/shared/api/client";
import { RequestStatus, type SortField } from "../types";
import { useViewMode } from "../hooks/useViewMode";
import {
  RequestFilters,
  type RequestFiltersValue,
} from "../components/RequestFilters";
import { ScheduleCard } from "../components/ScheduleCard";
import { RequestListSkeleton } from "../components/RequestListSkeleton";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { PriorityBadge } from "@/shared/components/PriorityBadge";
import { formatDate } from "@/shared/utils/date";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { PriorityLevel } from "../types";

const PAGE_SIZE = 12;

const DEFAULT_FILTERS: RequestFiltersValue = {
  search: "",
  status: "",
  category: "",
  sortBy: "createdat",
  descending: true,
};

// Courier-relevant statuses only
const COURIER_STATUS_OPTIONS = [
  { label: "Assigned", value: RequestStatus.Assigned },
  { label: "In Progress", value: RequestStatus.InProgress },
  { label: "Completed", value: RequestStatus.Completed },
  { label: "Cancelled", value: RequestStatus.Cancelled },
];

export function MySchedulePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RequestFiltersValue>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useViewMode("courier-schedule-view");

  // Active work — unfiltered, for the summary strip
  const { data: activeData } = useMyAssignments({
    page: 1,
    pageSize: 100,
    status: RequestStatus.Assigned,
  });
  const { data: inProgressData } = useMyAssignments({
    page: 1,
    pageSize: 100,
    status: RequestStatus.InProgress,
  });

  const activeCount = activeData?.totalCount ?? 0;
  const inProgressCount = inProgressData?.totalCount ?? 0;
  const urgentCount = [
    ...(activeData?.items ?? []),
    ...(inProgressData?.items ?? []),
  ].filter((r) => r.priority === "Urgent").length;

  const handleFilterChange = (next: Partial<RequestFiltersValue>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const { data, isLoading, isError, error } = useMyAssignments({
    page,
    pageSize: PAGE_SIZE,
    search: filters.search || undefined,
    sortBy: (filters.sortBy as SortField) || undefined,
    descending: filters.descending,
    status: filters.status || undefined,
    category: filters.category || undefined,
  });

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            My Schedule
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data
              ? `${data.totalCount} assignment${data.totalCount !== 1 ? "s" : ""} total`
              : "Your assigned requests"}
          </p>
        </div>

        {/* View toggle */}
        <div
          className="flex items-center gap-1 rounded-lg border
                        bg-card p-1 shadow-sm"
        >
          <button
            onClick={() => setViewMode("table")}
            aria-label="Table view"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              viewMode === "table"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("card")}
            aria-label="Card view"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              viewMode === "card"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Summary strip ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Awaiting start */}
        <button
          onClick={() =>
            handleFilterChange({
              status: RequestStatus.Assigned,
              search: "",
              category: "",
            })
          }
          className={cn(
            "rounded-xl border bg-card p-4 text-left shadow-sm",
            "transition-all hover:shadow-md hover:-translate-y-0.5",
            filters.status === RequestStatus.Assigned && "ring-2 ring-primary",
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Awaiting Start
            </span>
          </div>
          <p className="text-2xl font-black text-foreground">{activeCount}</p>
        </button>

        {/* In progress */}
        <button
          onClick={() =>
            handleFilterChange({
              status: RequestStatus.InProgress,
              search: "",
              category: "",
            })
          }
          className={cn(
            "rounded-xl border bg-card p-4 text-left shadow-sm",
            "transition-all hover:shadow-md hover:-translate-y-0.5",
            filters.status === RequestStatus.InProgress &&
              "ring-2 ring-primary",
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">
              In Progress
            </span>
          </div>
          <p className="text-2xl font-black text-foreground">
            {inProgressCount}
          </p>
        </button>

        {/* Urgent */}
        <button
          onClick={() =>
            handleFilterChange({
              status: "",
              search: "Urgent",
              category: "",
            })
          }
          className={cn(
            "rounded-xl border bg-card p-4 text-left shadow-sm",
            "transition-all hover:shadow-md hover:-translate-y-0.5",
            urgentCount > 0 && "border-red-200 bg-red-50/50",
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Urgent
            </span>
          </div>
          <p
            className={cn(
              "text-2xl font-black",
              urgentCount > 0 ? "text-red-600" : "text-foreground",
            )}
          >
            {urgentCount}
          </p>
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <RequestFilters
        value={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        statusOptions={COURIER_STATUS_OPTIONS}
      />

      {/* ── Error ───────────────────────────────────────────────────── */}
      {isError && (
        <ErrorMessage
          message={isApiError(error) ? error.message : "Something went wrong."}
        />
      )}

      {/* ── Loading ─────────────────────────────────────────────────── */}
      {isLoading && <RequestListSkeleton mode={viewMode} />}

      {/* ── Content ─────────────────────────────────────────────────── */}
      {data && !isLoading && (
        <>
          {data.items.length === 0 ? (
            <ScheduleEmptyState
              hasFilters={
                !!(filters.search || filters.status || filters.category)
              }
              activeCount={activeCount}
              inProgressCount={inProgressCount}
            />
          ) : viewMode === "card" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((req) => (
                <ScheduleCard key={req.id} request={req} />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {[
                      "Title",
                      "Category",
                      "Priority",
                      "Status",
                      "Deadline",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium
                                     text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((req) => {
                    const isOverdue =
                      req.deadline &&
                      req.status !== "Completed" &&
                      req.status !== "Cancelled" &&
                      new Date(req.deadline) < new Date();

                    return (
                      <tr
                        key={req.id}
                        onClick={() => navigate(`/requests/${req.id}`)}
                        className="group cursor-pointer transition-colors
                                   hover:bg-muted/40"
                      >
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
                            <div>
                              <p
                                className="font-medium text-foreground
                                            truncate max-w-[200px]"
                              >
                                {req.title}
                              </p>
                              {req.priority === "Urgent" && (
                                <span
                                  className="inline-flex items-center gap-1
                                                 text-[10px] font-bold text-red-500"
                                >
                                  <Zap className="h-2.5 w-2.5" /> Urgent
                                </span>
                              )}
                            </div>
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
                          className={cn(
                            "px-4 py-3.5 whitespace-nowrap text-sm",
                            isOverdue
                              ? "text-red-500 font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {req.deadline
                            ? `${isOverdue ? "⚠ " : ""}${formatDate(req.deadline)}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {req.status === "Assigned" && (
                            <span className="text-xs font-medium text-blue-600">
                              Ready to start →
                            </span>
                          )}
                          {req.status === "InProgress" && (
                            <span className="text-xs font-medium text-emerald-600">
                              In progress →
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
                className="rounded-lg border px-3 py-1.5 text-xs font-medium
                           transition-colors hover:bg-accent
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * PAGE_SIZE >= data.totalCount}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium
                           transition-colors hover:bg-accent
                           disabled:opacity-40 disabled:cursor-not-allowed"
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

function ScheduleEmptyState({
  hasFilters,
  activeCount,
  inProgressCount,
}: {
  hasFilters: boolean;
  activeCount: number;
  inProgressCount: number;
}) {
  const allClear = activeCount === 0 && inProgressCount === 0;

  return (
    <div
      className="flex flex-col items-center justify-center
                    rounded-xl border bg-card py-16 text-center"
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center
                      rounded-full bg-muted"
      >
        <CalendarClock className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {hasFilters
          ? "No assignments match your filters"
          : allClear
            ? "All clear — nothing scheduled"
            : "No assignments here"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs">
        {hasFilters
          ? "Try adjusting or clearing your filters"
          : allClear
            ? "You have no pending or active assignments right now"
            : "New assignments will appear here when the admin assigns them to you"}
      </p>
    </div>
  );
}
