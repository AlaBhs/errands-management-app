import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutGrid,
  List,
  Plus,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  RotateCcw,
} from "lucide-react";
import { useMyRequests } from "../hooks";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { isApiError } from "@/shared/api/client";
import { RequestStatus, type SortField } from "../types";
import { formatDate } from "@/shared/utils/date";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { PriorityBadge } from "@/shared/components/PriorityBadge";
import { cn } from "@/shared/utils/utils";
import { useViewMode } from "../hooks/useViewMode";
import {
  RequestFilters,
  type RequestFiltersValue,
} from "../components/common/RequestFilters";
import { RequestListSkeleton } from "../components/skeletons/RequestListSkeleton";
import type { PriorityLevel, RequestListItemDto } from "../types";
import { QuickSurveyModal } from "../components/modals/QuickSurveyModal";

const PAGE_SIZE = 12;

const DEFAULT_FILTERS: RequestFiltersValue = {
  search: "",
  status: "",
  category: "",
  sortBy: "createdat",
  descending: true,
  hasSurvey: undefined,
};

export function MyRequestsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialHasSurvey = (() => {
    const param = searchParams.get("hasSurvey");
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
    hasSurvey: initialHasSurvey,
  });
  const [viewMode, setViewMode] = useViewMode("collaborator-requests-view");

  // Summary counts — unfiltered
  const { data: pendingData } = useMyRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.Pending,
  });
  const { data: activeData } = useMyRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.Assigned,
  });
  const { data: inProgressData } = useMyRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.InProgress,
  });
  const { data: completedData } = useMyRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.Completed,
  });
  const { data: cancelledData } = useMyRequests({
    page: 1,
    pageSize: 1,
    status: RequestStatus.Cancelled,
  });

  const pendingCount = pendingData?.totalCount ?? 0;
  const activeCount =
    (activeData?.totalCount ?? 0) + (inProgressData?.totalCount ?? 0);
  const completedCount = completedData?.totalCount ?? 0;
  const cancelledCount = cancelledData?.totalCount ?? 0;

  const handleFilterChange = (next: Partial<RequestFiltersValue>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const { data, isLoading, isError, error } = useMyRequests({
    page,
    pageSize: PAGE_SIZE,
    search: filters.search || undefined,
    sortBy: (filters.sortBy as SortField) || undefined,
    descending: filters.descending,
    hasSurvey: filters.hasSurvey !== undefined ? filters.hasSurvey : undefined,
    status: filters.status || undefined,
    category: filters.category || undefined,
  });

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            My Requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data
              ? `${data.totalCount} request${data.totalCount !== 1 ? "s" : ""} total`
              : "Track all your submitted requests"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div
            className="flex items-center gap-1 rounded-lg border
                          bg-card p-1 shadow-sm"
          >
            <button
              onClick={() => setViewMode("table")}
              aria-label="Table view"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md",
                "transition-colors",
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
                "flex h-8 w-8 items-center justify-center rounded-md",
                "transition-colors",
                viewMode === "card"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          {/* New request */}
          <Link
            to="/requests/new"
            className="flex items-center gap-1.5 rounded-lg bg-[#2E2E38]
                       px-4 py-2 text-sm font-semibold text-white
                       hover:bg-[#1a1a24] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Request
          </Link>
        </div>
      </div>

      {/* ── Summary strip ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          icon={<Hourglass className="h-4 w-4 text-amber-500" />}
          label="Pending"
          count={pendingCount}
          active={filters.status === RequestStatus.Pending}
          onClick={() =>
            handleFilterChange({
              status: RequestStatus.Pending,
              search: "",
              category: "",
            })
          }
        />
        <SummaryCard
          icon={
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          }
          label="Active"
          count={activeCount}
          active={
            filters.status === RequestStatus.Assigned ||
            filters.status === RequestStatus.InProgress
          }
          onClick={() =>
            handleFilterChange({
              status: RequestStatus.InProgress,
              search: "",
              category: "",
            })
          }
        />
        <SummaryCard
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          label="Completed"
          count={completedCount}
          active={filters.status === RequestStatus.Completed}
          onClick={() =>
            handleFilterChange({
              status: RequestStatus.Completed,
              search: "",
              category: "",
            })
          }
        />
        <SummaryCard
          icon={<XCircle className="h-4 w-4 text-gray-400" />}
          label="Cancelled"
          count={cancelledCount}
          active={filters.status === RequestStatus.Cancelled}
          onClick={() =>
            handleFilterChange({
              status: RequestStatus.Cancelled,
              search: "",
              category: "",
            })
          }
        />
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <RequestFilters
        value={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        role={"collaborator"}
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
            <MyRequestsEmptyState
              hasFilters={
                !!(filters.search || filters.status || filters.category)
              }
            />
          ) : viewMode === "card" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((req) => (
                <CollaboratorRequestCard key={req.id} request={req} />
              ))}
            </div>
          ) : (
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
                  {data.items.map((req) => (
                    <CollaboratorTableRow
                      key={req.id}
                      request={req}
                      onClick={() => navigate(`/requests/${req.id}`)}
                    />
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

// ── Summary card ──────────────────────────────────────────────────────────────

function SummaryCard({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-card p-4 text-left shadow-sm",
        "transition-all hover:shadow-md hover:-translate-y-0.5",
        active && "ring-2 ring-primary",
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-2xl font-black text-foreground">{count}</p>
    </button>
  );
}

// ── Collaborator request card ─────────────────────────────────────────────────

const PRIORITY_BORDER: Record<string, string> = {
  Low: "border-l-gray-300",
  Normal: "border-l-blue-400",
  High: "border-l-orange-400",
  Urgent: "border-l-red-500",
};

function CollaboratorRequestCard({ request }: { request: RequestListItemDto }) {
  const navigate = useNavigate();
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  const isCompleted = request.status === "Completed";
  const isCancelled = request.status === "Cancelled";
  const needsSurvey = isCompleted && !request.hasSurvey;
  const isOverdue =
    request.deadline &&
    !isCompleted &&
    !isCancelled &&
    new Date(request.deadline) < new Date();

  return (
    <>
      <div
        onClick={() => navigate(`/requests/${request.id}`)}
        className={cn(
          "group relative flex flex-col rounded-xl border-l-4 border",
          "bg-card p-5 shadow-sm transition-all duration-150 cursor-pointer",
          "hover:-translate-y-0.5 hover:shadow-md",
          PRIORITY_BORDER[request.priority] ?? "border-l-gray-300",
        )}
      >
        {/* Survey prompt banner */}
        {needsSurvey && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSurveyModal(true);
            }}
            className="absolute -top-px left-0 right-0 flex items-center
                       justify-center gap-1 rounded-t-xl bg-amber-400
                       py-1.5 text-[10px] font-bold text-amber-900
                       hover:bg-amber-500 transition-colors"
          >
            <Star className="h-3 w-3 fill-amber-900" />
            Rate your experience — tap to review
          </button>
        )}

        {/* Top row */}
        <div
          className={cn(
            "flex items-start justify-between gap-2 mb-3",
            needsSurvey && "mt-4",
          )}
        >
          <StatusBadge status={request.status} />
          <span className="text-[10px] text-muted-foreground shrink-0">
            {request.category}
          </span>
        </div>

        {/* Title */}
        <p
          className="text-sm font-semibold text-foreground leading-snug
                    line-clamp-2 mb-2 flex-1"
        >
          {request.title}
        </p>

        {/* Priority */}
        <div className="mb-3">
          <PriorityBadge priority={request.priority as PriorityLevel} />
        </div>

        {/* Footer */}
        {isCancelled ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/requests/${request.id}`);
            }}
            className="mt-auto flex w-full items-center justify-center gap-1.5
                       rounded-lg border border-amber-200 bg-amber-50 py-2
                       text-xs font-medium text-amber-800
                       hover:bg-amber-100 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            View &amp; Resubmit
          </button>
        ) : (
          <div
            className={cn(
              "flex items-center justify-between border-t border-border pt-3 mt-auto",
              "text-xs",
            )}
          >
            <span
              className={cn(
                "flex items-center gap-1",
                isOverdue
                  ? "text-red-500 font-medium"
                  : "text-muted-foreground",
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {isOverdue
                ? `Overdue — ${formatDate(request.deadline!)}`
                : request.deadline
                  ? formatDate(request.deadline)
                  : "No deadline"}
            </span>
            {request.estimatedCost != null && (
              <span className="text-muted-foreground">
                ${request.estimatedCost}
              </span>
            )}
          </div>
        )}
      </div>
      {/* Survey modal */}
      {showSurveyModal && (
        <QuickSurveyModal
          requestId={request.id}
          title={request.title}
          onClose={() => setShowSurveyModal(false)}
        />
      )}
    </>
  );
}

// ── Collaborator table row ────────────────────────────────────────────────────

function CollaboratorTableRow({
  request,
  onClick,
}: {
  request: RequestListItemDto;
  onClick: () => void;
}) {
  const navigate = useNavigate();
  const isCompleted = request.status === "Completed";
  const isCancelled = request.status === "Cancelled";
  const needsSurvey = isCompleted && !request.hasSurvey;
  const isOverdue =
    request.deadline &&
    !isCompleted &&
    !isCancelled &&
    new Date(request.deadline) < new Date();

  return (
    <tr
      onClick={onClick}
      className="group cursor-pointer transition-colors hover:bg-muted/40"
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div
            className={cn("h-full w-0.5 rounded-full shrink-0 self-stretch", {
              "bg-gray-300": request.priority === "Low",
              "bg-blue-400": request.priority === "Normal",
              "bg-orange-400": request.priority === "High",
              "bg-red-500": request.priority === "Urgent",
            })}
          />
          <div>
            <p className="font-medium text-foreground truncate max-w-[200px]">
              {request.title}
            </p>
            {needsSurvey && (
              <span
                className="inline-flex items-center gap-1 text-[10px]
                               font-semibold text-amber-600"
              >
                <Star className="h-2.5 w-2.5 fill-amber-600" />
                Awaiting your review
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-muted-foreground">{request.category}</td>
      <td className="px-4 py-3.5">
        <PriorityBadge priority={request.priority as PriorityLevel} />
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={request.status} />
      </td>
      <td
        className={cn(
          "px-4 py-3.5 whitespace-nowrap text-sm",
          isOverdue ? "text-red-500 font-medium" : "text-muted-foreground",
        )}
      >
        {request.deadline
          ? `${isOverdue ? "⚠ " : ""}${formatDate(request.deadline)}`
          : "—"}
      </td>
      <td className="px-4 py-3.5 text-right">
        {needsSurvey && (
          <span
            className="inline-flex items-center gap-1 rounded-full
                           bg-amber-50 px-2 py-0.5 text-[10px] font-semibold
                           text-amber-700"
          >
            <Star className="h-2.5 w-2.5" />
            Rate
          </span>
        )}
        {isCancelled && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/requests/${request.id}`);
            }}
            className="inline-flex items-center gap-1 rounded-full
                       bg-amber-50 border border-amber-200 px-2 py-0.5
                       text-[10px] font-semibold text-amber-700
                       hover:bg-amber-100 transition-colors"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Resubmit
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function MyRequestsEmptyState({ hasFilters }: { hasFilters: boolean }) {
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
          : "Submit your first request to get started"}
      </p>
      {!hasFilters && (
        <Link
          to="/requests/new"
          className="mt-4 flex items-center gap-1.5 rounded-lg
                     bg-[#2E2E38] px-4 py-2 text-sm font-semibold
                     text-white hover:bg-[#1a1a24] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Request
        </Link>
      )}
    </div>
  );
}
