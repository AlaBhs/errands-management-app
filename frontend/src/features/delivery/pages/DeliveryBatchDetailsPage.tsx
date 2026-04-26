import { useState }          from 'react';
import { useParams, Link }   from 'react-router-dom';
import {
  ChevronLeft, Package, User, Phone, FileText,
  ArrowRightCircle, CheckCircle2, XCircle,
  Clock, Paperclip,
} from 'lucide-react';
import { useDeliveryBatch }         from '../hooks';
import { DeliveryStatusBadge }      from '../components/DeliveryStatusBadge';
import { HandoverModal }            from '../components/modals/HandoverModal';
import { ConfirmPickupModal }       from '../components/modals/ConfirmPickupModal';
import { CancelDeliveryModal }      from '../components/modals/CancelDeliveryModal';
import { PickupProofUploader }      from '../components/PickupProofUploader';
import { ErrorMessage }             from '@/shared/components/ErrorMessage';
import { isApiError }               from '@/shared/api/client';
import { useAuthStore }             from '@/features/auth/store/authStore';
import { UserRole }                 from '@/features/auth';
import { formatDateTime }           from '@/shared/utils/date';
import { DeliveryBatchStatus }      from '../types/delivery.enums';
import { cn }                       from '@/shared/utils/utils';
import type { AttachmentDto }       from '@/features/requests/types/request.types';

// ── Timeline event config ─────────────────────────────────────────────────────

type TimelineEvent = { label: string; at: string | null; by?: string | null };

// ── Attachment preview list ───────────────────────────────────────────────────

function AttachmentList({ attachments }: { attachments: AttachmentDto[] }) {
  if (attachments.length === 0) return null;
  return (
    <ul className="space-y-2">
      {attachments.map((a) => (
        <li
          key={a.id}
          className="flex items-center gap-3 rounded-lg border
                     border-border bg-muted/30 px-3 py-2 text-sm"
        >
          <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
          <a
            href={a.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 truncate text-blue-600 dark:text-blue-400
                       hover:underline"
          >
            {a.fileName}
          </a>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDateTime(a.uploadedAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function DeliveryBatchDetailsPage() {
  const { id }   = useParams<{ id: string }>();
  const role     = useAuthStore((s) => s.user?.role);
  const isAdmin  = role === UserRole.Admin;
  const isReception = role === UserRole.Reception;

  const { data: batch, isLoading, isError, error } = useDeliveryBatch(id!);

  const [modal, setModal] = useState<
    'handover' | 'pickup' | 'cancel' | null
  >(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <ErrorMessage
        message={
          isApiError(error) ? error.message : 'Delivery batch not found.'
        }
      />
    );
  }

  const isFinal =
    batch.status === DeliveryBatchStatus.PickedUp ||
    batch.status === DeliveryBatchStatus.Cancelled;

  // Ordered timeline
  const timeline: TimelineEvent[] = [
    { label: 'Batch Created',     at: batch.createdAt },
    { label: 'Handed to Reception', at: batch.handedToReceptionAt },
    { label: 'Picked Up',          at: batch.pickedUpAt,
      by: batch.pickedUpBy ? `by ${batch.pickedUpBy}` : undefined },
    batch.cancelledAt
      ? { label: 'Cancelled', at: batch.cancelledAt }
      : null,
  ].filter(Boolean) as TimelineEvent[];

  return (
    <div className="max-w-3xl space-y-6">
      {/* ── Back link ───────────────────────────────────────────────── */}
      <Link
        to="/delivery"
        className="inline-flex items-center gap-1.5 text-sm
                   text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        All Delivery Batches
      </Link>

      {/* ── Header card ─────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center
                            rounded-xl bg-[var(--ey-yellow)]/10">
              <Package className="h-5 w-5 text-[var(--ey-dark)]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {batch.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Created {formatDateTime(batch.createdAt)}
              </p>
            </div>
          </div>
          <DeliveryStatusBadge status={batch.status} />
        </div>

        {/* ── Client info ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2
                        border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground">{batch.clientName}</span>
          </div>
          {batch.clientPhone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              {batch.clientPhone}
            </div>
          )}
          {batch.pickupNote && (
            <div className="sm:col-span-2 flex items-start gap-2 text-sm
                            text-muted-foreground">
              <FileText className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="italic">{batch.pickupNote}</span>
            </div>
          )}
          {batch.cancelReason && (
            <div className="sm:col-span-2 rounded-lg bg-red-50 dark:bg-red-950/20
                            border border-red-200 dark:border-red-800 px-4 py-2.5
                            text-sm text-red-700 dark:text-red-400">
              <span className="font-medium">Cancel reason: </span>
              {batch.cancelReason}
            </div>
          )}
        </div>

        {/* ── Action buttons ────────────────────────────────────────── */}
        {!isFinal && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {isAdmin &&
              batch.status === DeliveryBatchStatus.Created && (
                <button
                  onClick={() => setModal('handover')}
                  className="flex items-center gap-2 rounded-lg
                             bg-blue-600 px-4 py-2 text-sm font-semibold
                             text-white hover:bg-blue-700 transition-colors"
                >
                  <ArrowRightCircle className="h-4 w-4" />
                  Hand Over to Reception
                </button>
              )}

            {isReception &&
              batch.status === DeliveryBatchStatus.HandedToReception && (
                <button
                  onClick={() => setModal('pickup')}
                  className="flex items-center gap-2 rounded-lg
                             bg-green-600 px-4 py-2 text-sm font-semibold
                             text-white hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Pickup
                </button>
              )}

            {isReception && (
              <button
                onClick={() => setModal('cancel')}
                className="flex items-center gap-2 rounded-lg border
                           border-red-300 dark:border-red-800 px-4 py-2
                           text-sm font-semibold text-red-600 dark:text-red-400
                           hover:bg-red-50 dark:hover:bg-red-950/20
                           transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Pickup proof upload (Reception, PickedUp only) ──────────── */}
      {isReception && batch.status === DeliveryBatchStatus.PickedUp && (
        <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-foreground">
            Pickup Proof
          </h2>
          {batch.attachments.length > 0 && (
            <AttachmentList attachments={batch.attachments} />
          )}
          <PickupProofUploader batchId={batch.id} />
        </section>
      )}

      {/* ── Attachment view for Admin (read-only) ───────────────────── */}
      {isAdmin && batch.attachments.length > 0 && (
        <section className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Pickup Proof
          </h2>
          <AttachmentList attachments={batch.attachments} />
        </section>
      )}

      {/* ── Timeline ────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Timeline</h2>
        <ol className="relative ml-2 space-y-0 border-l border-border">
          {timeline.map((event, i) => (
            <li key={i} className="pb-6 pl-6 last:pb-0">
              <div
                className={cn(
                  'absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2',
                  'border-white dark:border-card',
                  event.at
                    ? 'bg-[var(--ey-yellow)]'
                    : 'bg-muted',
                )}
              />
              <p className={cn(
                'text-sm font-medium',
                event.at ? 'text-foreground' : 'text-muted-foreground',
              )}>
                {event.label}
                {event.by && (
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    {event.by}
                  </span>
                )}
              </p>
              {event.at && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(event.at)}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {modal === 'handover' && (
        <HandoverModal
          batchId={batch.id}
          batchTitle={batch.title}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'pickup' && (
        <ConfirmPickupModal
          batchId={batch.id}
          batchTitle={batch.title}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'cancel' && (
        <CancelDeliveryModal
          batchId={batch.id}
          batchTitle={batch.title}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}