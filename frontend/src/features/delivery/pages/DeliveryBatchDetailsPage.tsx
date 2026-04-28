import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Package,
  User,
  Phone,
  FileText,
  ArrowRightCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Paperclip,
} from "lucide-react";
import { useDeliveryBatch } from "../hooks";
import { DeliveryStatusBadge } from "../components/DeliveryStatusBadge";
import { HandoverModal } from "../components/modals/HandoverModal";
import { ConfirmPickupModal } from "../components/modals/ConfirmPickupModal";
import { CancelDeliveryModal } from "../components/modals/CancelDeliveryModal";
import { PickupProofUploader } from "../components/PickupProofUploader";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { isApiError } from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth";
import { formatDateTime } from "@/shared/utils/date";
import { DeliveryBatchStatus } from "../types/delivery.enums";
import { cn } from "@/shared/utils/utils";
import { DeliveryAttachmentList } from "../components/DeliveryAttachmentList";

// ── Section component (reusable) ──────────────────────────────────────────────
function Section({
  title,
  badge,
  icon,
  children,
  className,
}: {
  title: string;
  badge?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 shadow-sm", className)}>
      <div className="mb-4 flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {badge && (
          <span className="ml-auto text-xs text-muted-foreground">{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}


// ── Timeline event component (matches request activity style) ────────────────
const EVENT_CONFIG: Record<
  string,
  { icon: React.ElementType; bg: string; color: string }
> = {
  "Batch Created": {
    icon: Package,
    bg: "bg-slate-100 dark:bg-slate-900/30",
    color: "text-slate-600 dark:text-slate-400",
  },
  "Handed to Reception": {
    icon: ArrowRightCircle,
    bg: "bg-indigo-100 dark:bg-indigo-950/30",
    color: "text-indigo-600 dark:text-indigo-400",
  },
  "Picked Up": {
    icon: CheckCircle2,
    bg: "bg-green-100 dark:bg-green-950/30",
    color: "text-green-600 dark:text-green-400",
  },
  Cancelled: {
    icon: XCircle,
    bg: "bg-rose-100 dark:bg-rose-950/30",
    color: "text-rose-600 dark:text-rose-400",
  },
};

function TimelineEvent({
  event,
  isLast,
}: {
  event: { label: string; at: string; by?: string | null };
  isLast: boolean;
}) {
  const cfg = EVENT_CONFIG[event.label] || EVENT_CONFIG["Batch Created"];
  const Icon = cfg.icon;

  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            cfg.bg
          )}
        >
          <Icon className={cn("h-4 w-4", cfg.color)} />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" style={{ minHeight: "20px" }} />}
      </div>
      <div className={cn("flex-1", !isLast && "pb-5")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {event.label}
              {event.by && (
                <span className="ml-1.5 font-normal text-muted-foreground">{event.by}</span>
              )}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDateTime(event.at)}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export function DeliveryBatchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === UserRole.Admin;
  const isReception = role === UserRole.Reception;

  const { data: batch, isLoading, isError, error } = useDeliveryBatch(id!);
  const [modal, setModal] = useState<"handover" | "pickup" | "cancel" | null>(
    null,
  );

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
          isApiError(error) ? error.message : "Delivery batch not found."
        }
      />
    );
  }

  const isFinal =
    batch.status === DeliveryBatchStatus.PickedUp ||
    batch.status === DeliveryBatchStatus.Cancelled;

  const timelineEvents = [
    { label: "Batch Created", at: batch.createdAt },
    batch.handedToReceptionAt
      ? { label: "Handed to Reception", at: batch.handedToReceptionAt }
      : null,
    batch.pickedUpAt
      ? {
          label: "Picked Up",
          at: batch.pickedUpAt,
          by: batch.pickedUpBy ? `by ${batch.pickedUpBy}` : undefined,
        }
      : null,
    batch.cancelledAt ? { label: "Cancelled", at: batch.cancelledAt } : null,
  ].filter(Boolean) as { label: string; at: string; by?: string | null }[];

  const hasAttachments = batch.attachments && batch.attachments.length > 0;
  const showUploader =
    isReception && batch.status === DeliveryBatchStatus.PickedUp;

  // Determine which actions to show
  const showHandover = isAdmin && batch.status === DeliveryBatchStatus.Created;
  const showPickup =
    isReception && batch.status === DeliveryBatchStatus.HandedToReception;
  const showCancel = isReception && !isFinal;

  return (
    <div className="w-full px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Back link */}
        <Link
          to="/delivery"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          All Delivery Batches
        </Link>

        {/* Header card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {batch.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Created {formatDateTime(batch.createdAt)}</span>
                </div>
              </div>
            </div>
            <DeliveryStatusBadge status={batch.status} />
          </div>
        </div>

        {/* Two‑column layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column (main content) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            {/* Activity Timeline */}
            <Section title="Activity" icon={<Clock className="h-4 w-4" />}>
              {timelineEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No activity yet.
                </p>
              ) : (
                <ol className="space-y-0">
                  {timelineEvents.map((event, idx) => (
                    <TimelineEvent
                      key={idx}
                      event={event}
                      isLast={idx === timelineEvents.length - 1}
                    />
                  ))}
                </ol>
              )}
            </Section>

            {/* Pickup Proof (attachments + uploader) */}
            <Section
              title="Pickup Proof"
              icon={<Paperclip className="h-4 w-4" />}
              className="h-[stretch]"
            >
              {hasAttachments ? (
                <DeliveryAttachmentList attachments={batch.attachments} />
              ) : (
                <p className="text-sm text-muted-foreground italic mb-4">
                  No proof uploaded yet.
                </p>
              )}
              {showUploader && (
                <div
                  className={cn(
                    hasAttachments && "mt-4 border-t border-border pt-4",
                  )}
                >
                  <PickupProofUploader batchId={batch.id} />
                </div>
              )}
            </Section>
          </div>

          {/* Right column (sidebar) */}
          <div className="space-y-6 flex flex-col">
            {/* Actions card */}
            {!isFinal && (
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden min-h-[max-content] ">
                <div className="border-b border-border bg-muted/30 px-5 py-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </h2>
                </div>
                <div className="p-5 space-y-3">
                  {showHandover && (
                    <button
                      onClick={() => setModal("handover")}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      <ArrowRightCircle className="h-4 w-4" />
                      Hand Over to Reception
                    </button>
                  )}
                  {showPickup && (
                    <button
                      onClick={() => setModal("pickup")}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm Pickup
                    </button>
                  )}
                  {showCancel && (
                    <button
                      onClick={() => setModal("cancel")}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 dark:border-red-800 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Delivery
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Cancel reason (only when cancelled) */}
            {batch.cancelReason && (
              <Section
                title="Cancellation reason"
                icon={<XCircle className="h-4 w-4" />}
              >
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                  {batch.cancelReason}
                </div>
              </Section>
            )}
            {/* Client Information card */}
            <Section title="Client" className="h-[stretch]">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {batch.clientName}
                  </span>
                </div>
                {batch.clientPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{batch.clientPhone}</span>
                  </div>
                )}
                {batch.pickupNote && (
                  <div className="flex items-start gap-2 text-sm pt-2 border-t border-border">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <p className="text-muted-foreground italic">
                      {batch.pickupNote}
                    </p>
                  </div>
                )}
              </div>
            </Section>
          </div>
        </div>

        {/* Modals */}
        {modal === "handover" && (
          <HandoverModal
            batchId={batch.id}
            batchTitle={batch.title}
            onClose={() => setModal(null)}
          />
        )}
        {modal === "pickup" && (
          <ConfirmPickupModal
            batchId={batch.id}
            batchTitle={batch.title}
            onClose={() => setModal(null)}
          />
        )}
        {modal === "cancel" && (
          <CancelDeliveryModal
            batchId={batch.id}
            batchTitle={batch.title}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </div>
  );
}
