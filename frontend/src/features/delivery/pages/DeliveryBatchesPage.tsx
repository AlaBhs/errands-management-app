import { useState }           from 'react';
import { useNavigate }        from 'react-router-dom';
import { Plus, Search, X, Package } from 'lucide-react';
import { useDeliveryBatches } from '../hooks';
import { DeliveryStatusBadge } from '../components/DeliveryStatusBadge';
import { PageHeader }          from '@/shared/components/PageHeader';
import { ErrorMessage }        from '@/shared/components/ErrorMessage';
import { isApiError }          from '@/shared/api/client';
import { formatDate }          from '@/shared/utils/date';
import { UserRole }            from '@/features/auth';
import { useAuthStore }        from '@/features/auth/store/authStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DeliveryBatchStatus } from '../types/delivery.enums';
import { DeliveryBatchStatus as S } from '../types/delivery.enums';

const PAGE_SIZE = 12;

const STATUS_OPTIONS: { label: string; value: DeliveryBatchStatus | '' }[] = [
  { label: 'All Statuses',    value: '' },
  { label: 'Created',         value: S.Created },
  { label: 'At Reception',    value: S.HandedToReception },
  { label: 'Picked Up',       value: S.PickedUp },
  { label: 'Cancelled',       value: S.Cancelled },
];

export function DeliveryBatchesPage() {
  const navigate = useNavigate();
  const role     = useAuthStore((s) => s.user?.role);
  const isAdmin  = role === UserRole.Admin;

  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DeliveryBatchStatus | ''>('');

  const { data, isLoading, isError, error } = useDeliveryBatches({
    page,
    pageSize: PAGE_SIZE,
    search:   search || undefined,
    status:   status || undefined,
  });

  const hasFilters = !!(search || status);

  return (
    <div className="space-y-6">
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
              className="flex items-center gap-2 rounded-lg
                         bg-[var(--ey-dark)] px-4 py-2
                         text-sm font-semibold text-white
                         hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              New Batch
            </button>
          ) : undefined
        }
      />

      {/* ── Filters ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4
                             -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title or client…"
            className="w-full rounded-lg border border-border bg-background
                       pl-9 pr-4 py-2.5 text-sm text-foreground
                       focus:border-[var(--ey-dark)] focus:outline-none
                       transition-colors"
          />
        </div>

        {/* Status filter */}
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as DeliveryBatchStatus | '');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44 text-sm">
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

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setStatus(''); setPage(1); }}
            className="flex items-center gap-1.5 rounded-lg border
                       border-border px-3 py-2 text-xs text-muted-foreground
                       hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {isError && (
        <ErrorMessage
          message={isApiError(error) ? error.message : 'Something went wrong.'}
        />
      )}

      {/* ── Loading skeleton ──────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────── */}
      {data && !isLoading && (
        <>
          {data.items.length === 0 ? (
            <DeliveryEmptyState hasFilters={hasFilters} isAdmin={isAdmin} />
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {['Title', 'Client', 'Status', 'Created'].map((h) => (
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
                  {data.items.map((batch) => (
                    <tr
                      key={batch.id}
                      onClick={() => navigate(`/delivery/${batch.id}`)}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                    >
                      <td className="px-4 py-3.5 font-medium text-foreground
                                     truncate max-w-[220px]">
                        {batch.title}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {batch.clientName}
                      </td>
                      <td className="px-4 py-3.5">
                        <DeliveryStatusBadge status={batch.status} />
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground
                                     whitespace-nowrap">
                        {formatDate(batch.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between
                          text-sm text-muted-foreground">
            <span>
              {data.totalCount === 0
                ? 'No results'
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

function DeliveryEmptyState({
  hasFilters,
  isAdmin,
}: {
  hasFilters: boolean;
  isAdmin: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center
                    rounded-xl border bg-card py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center
                      rounded-full bg-muted">
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
          className="mt-5 flex items-center gap-2 rounded-lg
                     bg-[var(--ey-dark)] px-4 py-2
                     text-sm font-semibold text-white hover:opacity-90
                     transition-opacity"
        >
          <Plus className="h-4 w-4" /> New Batch
        </button>
      )}
    </div>
  );
}