import { useState } from "react";
import {
  Trash2,
  Search,
  Calendar,
  DollarSign,
  BookTemplate,
} from "lucide-react";
import { useMyTemplates } from "../hooks/useTemplates";
import { useDeleteTemplate } from "../hooks/useTemplateMutations";
import { isApiError } from "@/shared/api/client";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { CategoryBadge } from "@/shared/components/CategoryBadge";
import { formatDate } from "@/shared/utils/date";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { cn } from "@/shared/utils/utils";
import type { RequestTemplateListItemDto } from "../types";

const PAGE_SIZE = 12;

export function MyTemplatesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [toDelete, setToDelete] = useState<RequestTemplateListItemDto | null>(
    null,
  );

  const { data, isLoading, isError, error } = useMyTemplates({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const deleteTemplate = useDeleteTemplate();

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;
    deleteTemplate.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            My Templates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data
              ? `${data.totalCount} template${data.totalCount !== 1 ? "s" : ""} saved`
              : "Your reusable request templates"}
          </p>
        </div>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search templates…"
            className="w-full rounded-lg border border-border bg-background
                       pl-9 pr-4 py-2 text-sm text-foreground
                       focus:border-[var(--ey-dark)] focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={handleSearch}
          className="rounded-lg border border-border bg-background px-4 py-2
                     text-sm text-foreground hover:bg-muted transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Error ───────────────────────────────────────────────────── */}
      {isError && (
        <ErrorMessage
          message={isApiError(error) ? error.message : "Something went wrong."}
        />
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-xl border bg-card animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {data && !isLoading && data.items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BookTemplate className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {search ? "No templates match your search" : "No templates yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            {search
              ? "Try a different search term."
              : 'Open any of your requests and click "Save as Template" to get started.'}
          </p>
        </div>
      )}

      {/* ── Template grid ────────────────────────────────────────────── */}
      {data && !isLoading && data.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onDelete={() => setToDelete(t)}
              />
            ))}
          </div>

          {/* ── Pagination ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
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

      {/* ── Delete confirm modal ─────────────────────────────────────── */}
      {toDelete && (
        <ConfirmModal
          title="Delete Template"
          description={`"${toDelete.name}" will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete"
          isPending={deleteTemplate.isPending}
          onConfirm={handleDeleteConfirm}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

// ── Template card ─────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onDelete,
}: {
  template: RequestTemplateListItemDto;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border bg-card p-5 shadow-sm",
        "transition-all hover:shadow-md hover:-translate-y-0.5",
      )}
    >
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground
                   opacity-0 group-hover:opacity-100 transition-all
                   hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400"
        aria-label="Delete template"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Icon */}
      <div
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg
                      bg-indigo-100 dark:bg-indigo-950/30"
      >
        <BookTemplate className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      </div>

      {/* Name */}
      <p className="font-semibold text-foreground leading-snug line-clamp-1">
        {template.name}
      </p>

      {/* Title preview */}
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
        {template.title}
      </p>

      {/* Meta row */}
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <CategoryBadge category={template.category} />

        {template.estimatedCost != null && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3" />
            {template.estimatedCost.toFixed(2)} TND
          </span>
        )}

        <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
          <Calendar className="h-3 w-3" />
          {formatDate(template.createdAt)}
        </span>
      </div>
    </div>
  );
}
