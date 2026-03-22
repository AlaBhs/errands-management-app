import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyRequests } from "../hooks";
import { StatusBadge } from "@/features/requests";
import { PageSpinner } from "@/shared/components/PageSpinner";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { isApiError } from "@/shared/api/client";
import { RequestCategory, type RequestStatus, type SortField } from "../types";
import { formatDate } from "@/shared/utils/date";

const PAGE_SIZE = 10;

const sortOptions: { label: string; value: SortField }[] = [
  { label: "Created At", value: "createdat" },
  { label: "Deadline", value: "deadline" },
  { label: "Estimated Cost", value: "estimatedcost" },
];

const statusOptions: { label: string; value: RequestStatus }[] = [
  { label: "Pending", value: "Pending" },
  { label: "Assigned", value: "Assigned" },
  { label: "In Progress", value: "InProgress" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

export function MyRequestsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField | undefined>('createdat');
  const [descending, setDescending] = useState(true);
  const [status, setStatus] = useState<RequestStatus | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<RequestCategory | "">(
    "",
  );

  const { data, isLoading, isError, error } = useMyRequests({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    sortBy,
    descending,
    status,
    category: categoryFilter || undefined,
  });

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all your submitted requests.
          </p>
        </div>
        <Link
          to="/requests/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          New Request
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search requests..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
          className="flex-1 min-w-[200px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <select
          value={status ?? ""}
          onChange={(e) => {
            setStatus((e.target.value as RequestStatus) || undefined);
            resetPage();
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All statuses</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value as RequestCategory | "");
            resetPage();
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All categories</option>
          <option value={RequestCategory.OfficeSupplies}>
            Office Supplies
          </option>
          <option value={RequestCategory.ITEquipment}>IT Equipment</option>
          <option value={RequestCategory.Travel}>Travel</option>
          <option value={RequestCategory.Facilities}>Facilities</option>
          <option value={RequestCategory.Other}>Other</option>
        </select>
        <select
          value={sortBy ?? ""}
          onChange={(e) => {
            setSortBy((e.target.value as SortField) || undefined);
            resetPage();
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Sort by...</option>
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {sortBy && (
          <button
            onClick={() => {
              setDescending((d) => !d);
              resetPage();
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
          >
            {descending ? "↓ Desc" : "↑ Asc"}
          </button>
        )}
      </div>

      {/* States */}
      {isLoading && <PageSpinner />}
      {isError && (
        <ErrorMessage
          message={isApiError(error) ? error.message : "Something went wrong."}
        />
      )}

      {/* Table */}
      {data && (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Title",
                    "Category",
                    "Priority",
                    "Status",
                    "Deadline",
                    "Est. Cost",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-medium text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No requests found.{" "}
                      <Link
                        to="/requests/new"
                        className="text-primary hover:underline"
                      >
                        Create your first request.
                      </Link>
                    </td>
                  </tr>
                ) : (
                  data.items.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {req.title}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {req.category}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {req.priority}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {req.deadline ? formatDate(req.deadline) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {req.estimatedCost != null
                          ? `$${req.estimatedCost}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/requests/${req.id}`}
                          className="text-primary hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {data.totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, data.totalCount)} of {data.totalCount}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded border px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * PAGE_SIZE >= data.totalCount}
                className="rounded border px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
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
