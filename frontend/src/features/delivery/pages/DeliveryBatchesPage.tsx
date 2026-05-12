import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, LayoutGrid, List, Package } from 'lucide-react';
import { useDeliveryBatches } from '../hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { isApiError } from '@/shared/api/client';
import { UserRole } from '@/features/auth';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useViewMode } from '@/shared/hooks/useViewMode';
import { DeliveryFilters, type DeliveryFiltersValue } from '../components/DeliveryFilters';
import { DeliveryBatchCard } from '../components/DeliveryBatchCard';
import { DeliveryBatchesSkeleton } from '../components/skeletons/DeliveryBatchesSkeleton';
import { DeliveryStatusBadge } from '../components/DeliveryStatusBadge';
import { formatDate } from '@/shared/utils/date';
import { cn } from '@/shared/utils/utils';
import type { DeliveryBatchListItemDto } from '../types/delivery.types';
import { DeliveryBatchStatus } from '../types';

const PAGE_SIZE = 12;

const DEFAULT_FILTERS: DeliveryFiltersValue = {
  search: '',
  status: '',
};

export function DeliveryBatchesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
    const getInitialStatus = (): DeliveryBatchStatus | '' => {
  const param = searchParams.get('status');
  if (!param) return '';
  // Check if the param matches any enum value
  const validStatuses = Object.values(DeliveryBatchStatus);
  return validStatuses.includes(param as DeliveryBatchStatus) ? (param as DeliveryBatchStatus) : '';
};
  
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === UserRole.Admin;

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<DeliveryFiltersValue>({
  search: '',
  status: getInitialStatus(),
});
  const [viewMode, setViewMode] = useViewMode('delivery-batches-view');

  const { data, isLoading, isError, error } = useDeliveryBatches({
    page,
    pageSize: PAGE_SIZE,
    search: filters.search || undefined,
    status: filters.status || undefined,
  });

  const hasFilters = !!(filters.search || filters.status);

  const handleFilterChange = (next: Partial<DeliveryFiltersValue>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Delivery Batches"
          subtitle={
            data
              ? `${data.totalCount} batch${data.totalCount !== 1 ? 'es' : ''} total`
              : 'Track physical delivery workflows'
          }
          actions={
            isAdmin ? (
              <button
                onClick={() => navigate('/delivery/new')}
                className="flex items-center gap-2 rounded-lg bg-[var(--ey-dark)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                New Batch
              </button>
            ) : undefined
          }
        />
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-white dark:bg-card p-1 shadow-sm">
          <button
            onClick={() => setViewMode('table')}
            aria-label="Table view"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              viewMode === 'table'
                ? 'bg-[var(--ey-dark)] text-white dark:bg-[var(--ey-yellow)] dark:text-[var(--ey-dark)] shadow-sm'
                : 'text-muted-foreground hover:bg-muted dark:hover:bg-white/10'
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            aria-label="Card view"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              viewMode === 'card'
                ? 'bg-[var(--ey-dark)] text-white dark:bg-[var(--ey-yellow)] dark:text-[var(--ey-dark)] shadow-sm'
                : 'text-muted-foreground hover:bg-muted dark:hover:bg-white/10'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <DeliveryFilters value={filters} onChange={handleFilterChange} onReset={handleReset} />

      {/* Error */}
      {isError && (
        <ErrorMessage message={isApiError(error) ? error.message : 'Something went wrong.'} />
      )}

      {/* Loading */}
      {isLoading && <DeliveryBatchesSkeleton mode={viewMode} />}

      {/* Content */}
      {data && !isLoading && (
        <>
          {data.items.length === 0 ? (
            <EmptyState hasFilters={hasFilters} isAdmin={isAdmin} />
          ) : viewMode === 'card' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((batch: DeliveryBatchListItemDto) => (
                <DeliveryBatchCard key={batch.id} batch={batch} />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {['Title', 'Client', 'Status', 'Created'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((batch: DeliveryBatchListItemDto) => (
                    <tr
                      key={batch.id}
                      onClick={() => navigate(`/delivery/${batch.id}`)}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                    >
                      <td className="px-4 py-3.5 font-medium text-foreground truncate max-w-[220px]">
                        {batch.title}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{batch.clientName}</td>
                      <td className="px-4 py-3.5">
                        <DeliveryStatusBadge status={batch.status} />
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(batch.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination with page numbers */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {data.totalCount === 0
                ? 'No results'
                : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                    page * PAGE_SIZE,
                    data.totalCount
                  )} of ${data.totalCount}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.ceil(data.totalCount / PAGE_SIZE) }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === Math.ceil(data.totalCount / PAGE_SIZE) ||
                    Math.abs(p - page) <= 1
                )
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                        page === p
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-accent'
                      )}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * PAGE_SIZE >= data.totalCount}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
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

// ── Empty state ──
function EmptyState({ hasFilters, isAdmin }: { hasFilters: boolean; isAdmin: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {hasFilters ? 'No batches match your filters' : 'No delivery batches yet'}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {hasFilters
          ? 'Try adjusting or clearing your filters'
          : 'Batches will appear here once created'}
      </p>
      {!hasFilters && isAdmin && (
        <button
          onClick={() => navigate('/delivery/new')}
          className="mt-5 flex items-center gap-2 rounded-lg bg-[var(--ey-dark)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> New Batch
        </button>
      )}
    </div>
  );
}