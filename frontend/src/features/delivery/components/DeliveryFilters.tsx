import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DeliveryBatchStatus } from '../types/delivery.enums';
import { DeliveryBatchStatus as S } from '../types/delivery.enums';
import { FilterChip } from '@/shared/components/FilterChip';

const ALL_STATUS_VALUE = 'all';

const STATUS_OPTIONS: { label: string; value: DeliveryBatchStatus | typeof ALL_STATUS_VALUE }[] = [
  { label: 'All Statuses', value: ALL_STATUS_VALUE },
  { label: 'Created', value: S.Created },
  { label: 'At Reception', value: S.HandedToReception },
  { label: 'Picked Up', value: S.PickedUp },
  { label: 'Cancelled', value: S.Cancelled },
];

export interface DeliveryFiltersValue {
  search: string;
  status: DeliveryBatchStatus | '';
}

interface DeliveryFiltersProps {
  value: DeliveryFiltersValue;
  onChange: (next: Partial<DeliveryFiltersValue>) => void;
  onReset: () => void;
}

export function DeliveryFilters({ value, onChange, onReset }: DeliveryFiltersProps) {
  const hasFilters = !!(value.search || value.status);

  const statusLabel = STATUS_OPTIONS.find((o) => o.value === value.status)?.label;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or client..."
            value={value.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full rounded-md border bg-background py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors hover:border-ring"
          />
          {value.search && (
            <button
              onClick={() => onChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Status</span>
          <Select
            value={value.status === '' ? ALL_STATUS_VALUE : value.status}
            onValueChange={(v) =>
              onChange({ status: v === ALL_STATUS_VALUE ? '' : (v as DeliveryBatchStatus) })
            }
          >
            <SelectTrigger className="w-40 rounded-lg">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear all */}
        {hasFilters && (
          <>
            <div className="h-5 w-px bg-border hidden sm:block" />
            <button
              onClick={onReset}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
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
            <FilterChip label={`Search: "${value.search}"`} onRemove={() => onChange({ search: '' })} />
          )}
          {value.status && statusLabel && (
            <FilterChip label={`Status: ${statusLabel}`} onRemove={() => onChange({ status: '' })} />
          )}
        </div>
      )}
    </div>
  );
}