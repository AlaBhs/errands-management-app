import { X, Search, SlidersHorizontal } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/utils/utils";
import { RequestCategory, RequestStatus, type SortField } from "../../types";

export interface RequestFiltersValue {
  search: string;
  status: RequestStatus | "";
  category: RequestCategory | "";
  sortBy: SortField | "";
  descending: boolean;
}

interface RequestFiltersProps {
  value: RequestFiltersValue;
  onChange: (next: Partial<RequestFiltersValue>) => void;
  onReset: () => void;
  statusOptions?: { label: string; value: RequestStatus }[];
}

const STATUS_OPTIONS: { label: string; value: RequestStatus }[] = [
  { label: "Pending", value: "Pending" },
  { label: "Assigned", value: "Assigned" },
  { label: "In Progress", value: "InProgress" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

const CATEGORY_OPTIONS: { label: string; value: RequestCategory }[] = [
  { label: "Office Supplies", value: RequestCategory.OfficeSupplies },
  { label: "IT Equipment", value: RequestCategory.ITEquipment },
  { label: "Travel", value: RequestCategory.Travel },
  { label: "Facilities", value: RequestCategory.Facilities },
  { label: "Other", value: RequestCategory.Other },
];

const SORT_OPTIONS: { label: string; value: SortField }[] = [
  { label: "Created At", value: "createdat" },
  { label: "Deadline", value: "deadline" },
  { label: "Estimated Cost", value: "estimatedcost" },
];

// ── Active filter chips ───────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: ChipProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full
                     bg-primary/10 px-2.5 py-1 text-xs font-medium
                     text-primary"
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full hover:bg-primary/20
                   transition-colors p-0.5"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RequestFilters({
  value,
  onChange,
  onReset,
  statusOptions,
}: RequestFiltersProps) {
  const hasFilters =
    value.search || value.status || value.category || value.sortBy;

  const statusLabel = STATUS_OPTIONS.find(
    (o) => o.value === value.status,
  )?.label;
  const categoryLabel = CATEGORY_OPTIONS.find(
    (o) => o.value === value.category,
  )?.label;
  const sortLabel = SORT_OPTIONS.find((o) => o.value === value.sortBy)?.label;
  const resolvedStatusOptions = statusOptions ?? STATUS_OPTIONS;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-2
                      rounded-xl border bg-card px-4 py-3 shadow-sm"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4
                             -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search requests..."
            value={value.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full rounded-md border bg-background py-1.5
                       pl-9 pr-3 text-sm focus:outline-none
                       focus:ring-2 focus:ring-ring transition-colors
                       hover:border-ring placeholder:text-muted-foreground"
          />
          {value.search && (
            <button
              onClick={() => onChange({ search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2
                         text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Separator orientation="vertical" className="hidden h-5 sm:block" />

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Status
          </span>
          <select
            value={value.status}
            onChange={(e) =>
              onChange({ status: e.target.value as RequestStatus | "" })
            }
            className="rounded-md border bg-background px-2 py-1.5
                       text-xs font-medium text-foreground
                       focus:outline-none focus:ring-2 focus:ring-ring
                       transition-colors hover:border-ring cursor-pointer"
          >
            <option value="">All</option>
            {resolvedStatusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <Separator orientation="vertical" className="hidden h-5 sm:block" />

        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Category
          </span>
          <select
            value={value.category}
            onChange={(e) =>
              onChange({ category: e.target.value as RequestCategory | "" })
            }
            className="rounded-md border bg-background px-2 py-1.5
                       text-xs font-medium text-foreground
                       focus:outline-none focus:ring-2 focus:ring-ring
                       transition-colors hover:border-ring cursor-pointer"
          >
            <option value="">All</option>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <Separator orientation="vertical" className="hidden h-5 sm:block" />

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={value.sortBy}
            onChange={(e) =>
              onChange({ sortBy: e.target.value as SortField | "" })
            }
            className="rounded-md border bg-background px-2 py-1.5
                       text-xs font-medium text-foreground
                       focus:outline-none focus:ring-2 focus:ring-ring
                       transition-colors hover:border-ring cursor-pointer"
          >
            <option value="">Sort by...</option>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {value.sortBy && (
            <button
              onClick={() => onChange({ descending: !value.descending })}
              className={cn(
                "rounded-md border px-2 py-1.5 text-xs font-medium",
                "transition-colors hover:bg-accent hover:text-accent-foreground",
                value.descending
                  ? "bg-muted text-muted-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {value.descending ? "↓ Desc" : "↑ Asc"}
            </button>
          )}
        </div>

        {/* Clear all */}
        {hasFilters && (
          <>
            <Separator orientation="vertical" className="hidden h-5 sm:block" />
            <button
              onClick={onReset}
              className="text-xs text-muted-foreground hover:text-foreground
                         transition-colors whitespace-nowrap"
            >
              Clear all
            </button>
          </>
        )}
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {value.search && (
            <FilterChip
              label={`Search: "${value.search}"`}
              onRemove={() => onChange({ search: "" })}
            />
          )}
          {value.status && statusLabel && (
            <FilterChip
              label={`Status: ${statusLabel}`}
              onRemove={() => onChange({ status: "" })}
            />
          )}
          {value.category && categoryLabel && (
            <FilterChip
              label={`Category: ${categoryLabel}`}
              onRemove={() => onChange({ category: "" })}
            />
          )}
          {value.sortBy && sortLabel && (
            <FilterChip
              label={`Sort: ${sortLabel} ${value.descending ? "↓" : "↑"}`}
              onRemove={() => onChange({ sortBy: "", descending: true })}
            />
          )}
        </div>
      )}
    </div>
  );
}
