import { useParams, Link, useNavigate } from "react-router-dom";
import { useRequest } from "../hooks/useRequests";
import { RequestActions } from "../components/common/RequestActions";
import { AttachmentList } from "../components/common/AttachmentList";
import { AttachmentUploader } from "../components/common/AttachmentUploader";
import { RequestDetailsSkeleton } from "../components/skeletons/RequestDetailsSkeleton";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { PriorityBadge } from "@/shared/components/PriorityBadge";
import { CategoryBadge } from "@/shared/components/CategoryBadge";
import { isApiError } from "@/shared/api/client";
import { UserRole } from "@/features/auth/types/auth.enums";
import { useAuthStore } from "@/features/auth/store/authStore";
import {
  formatDateTime,
  formatDate,
  formatDuration,
} from "@/shared/utils/date";
import {
  MapPin,
  User,
  Clock,
  Calendar,
  CheckCircle2,
  UserCheck,
  Play,
  XCircle,
  Star,
  FileText,
  ChevronLeft,
  Paperclip,
  RotateCcw,
  Wallet,
  Trash2,
  Plus,
  BookmarkPlus,
} from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { LocationMap } from "@/shared/components/LocationMap";
import { RequestMessagesPanel } from "@/features/messaging";
import { ExpensePanel } from "../components/common/ExpensePanel";
import { CreateTemplateModal } from "@/features/request-templates/components/CreateTemplateModal";
import { useState } from "react";

// ── Audit log config ──────────────────────────────────────────────────────────

const AUDIT_EVENT_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    label: string;
  }
> = {
  Created: {
    icon: FileText,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-900/30",
    label: "Request Created",
  },
  Assigned: {
    icon: UserCheck,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-950/30",
    label: "Courier Assigned",
  },
  Started: {
    icon: Play,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-950/30",
    label: "Work Started",
  },
  Completed: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-950/30",
    label: "Request Completed",
  },
  Cancelled: {
    icon: XCircle,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100 dark:bg-rose-950/30",
    label: "Request Cancelled",
  },
  SurveySubmitted: {
    icon: Star,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-950/30",
    label: "Survey Submitted",
  },
  ExpenseAdded: {
    icon: Plus,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-950/30",
    label: "Expense Added",
  },
  ExpenseRemoved: {
    icon: Trash2,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-950/30",
    label: "Expense Removed",
  },
  AdvancedAmountSet: {
    icon: Wallet,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-100 dark:bg-cyan-950/30",
    label: "Cash Advance Set",
  },
  Reconciled: {
    icon: CheckCircle2,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-100 dark:bg-teal-950/30",
    label: "Expenses Reconciled",
  },
};

const DEFAULT_EVENT = {
  icon: Clock,
  color: "text-gray-600 dark:text-gray-400",
  bg: "bg-gray-100 dark:bg-gray-900/30",
  label: "Event",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: request, isLoading, isError, error } = useRequest(id!);
  const role = useAuthStore((s) => s.user?.role);
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.id);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const backLink =
    role === UserRole.Courier
      ? "/assignments"
      : role === UserRole.Collaborator
        ? "/requests/mine"
        : "/requests";

  const backLabel =
    role === UserRole.Courier
      ? "My Schedule"
      : role === UserRole.Collaborator
        ? "My Requests"
        : "All Requests";

  if (isLoading) return <RequestDetailsSkeleton />;
  if (isError)
    return (
      <ErrorMessage
        message={isApiError(error) ? error.message : "Something went wrong."}
      />
    );
  if (!request) return null;

  const isParticipant =
    role === UserRole.Admin ||
    request.requesterId === userId ||
    request.currentAssignment?.courierId === userId;

  const canAddAttachments =
    (request.status === "Pending" || request.status === "Assigned") &&
    (role === UserRole.Admin || role === UserRole.Collaborator) &&
    request.attachments.length < 5;

  const isOverdue =
    request.deadline &&
    request.status !== "Completed" &&
    request.status !== "Cancelled" &&
    new Date(request.deadline) < new Date();

  return (
    <div className="space-y-6">
      {/* ── Back ────────────────────────────────────────────────────── */}
      <Link
        to={backLink}
        className="inline-flex items-center gap-1.5 text-sm
                   text-muted-foreground hover:text-foreground
                   transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      {/* ── Header card ─────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {request.title}
            </h1>
            <div
              className="flex items-center gap-2 text-sm
                            text-muted-foreground"
            >
              <User className="h-3.5 w-3.5 shrink-0" />
              <span>
                Requested by{" "}
                <span className="font-medium text-foreground">
                  {request.requesterName}
                </span>
              </span>
              <span className="text-border">·</span>
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{formatDateTime(request.createdAt)}</span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
              <CategoryBadge category={request.category} />
              {request.deadline && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
                    "text-xs font-medium",
                    isOverdue
                      ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                      : "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  {isOverdue ? "Overdue — " : "Due "}
                  {formatDate(request.deadline)}
                </span>
              )}
              {request.estimatedCost != null && (
                <span
                  className="inline-flex items-center gap-1 rounded-full
                                 px-2.5 py-0.5 text-xs font-medium
                                 bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400"
                >
                  Est. tnd {" " + request.estimatedCost}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            {/* Save as Template — Collaborator only, owns this request */}
            {role === UserRole.Collaborator &&
              request.requesterId === userId && (
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200
                 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/20
                 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300
                 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 transition-colors"
                >
                  <BookmarkPlus className="h-3.5 w-3.5" />
                  Save as Template
                </button>
              )}
          </div>
        </div>
      </div>

      {/* ── Two-column body ─────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left column ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Section title="Description">
            <p className="text-sm leading-relaxed text-foreground">
              {request.description}
            </p>
          </Section>

          {/* Comment */}
          {request.comment && (
            <div
              className="rounded-xl border border-amber-200 dark:border-amber-900/50
                            bg-amber-50 dark:bg-amber-950/20 p-5 shadow-sm"
            >
              <h3
                className="mb-2 text-xs font-semibold uppercase
                             tracking-wider text-amber-700 dark:text-amber-300"
              >
                Additional Comments
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                {request.comment}
              </p>
            </div>
          )}

          {/* Attachments */}
          <Section
            title="Attachments"
            badge={`${request.attachments.length} / 5`}
            icon={<Paperclip className="h-4 w-4" />}
          >
            {request.attachments.length > 0 ? (
              <AttachmentList
                requestId={request.id}
                attachments={request.attachments}
                canDelete={
                  role === UserRole.Admin || role === UserRole.Collaborator
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No attachments.
              </p>
            )}
            {canAddAttachments && (
              <div className="mt-4 border-t border-border pt-4">
                <AttachmentUploader requestId={request.id} />
              </div>
            )}
          </Section>

          {/* Activity timeline */}
          {request.auditLogs.length > 0 && (
            <Section title="Activity">
              <ol className="space-y-0">
                {[...request.auditLogs]
                  .sort(
                    (a, b) =>
                      new Date(a.occurredAt).getTime() -
                      new Date(b.occurredAt).getTime(),
                  )
                  .map((log, i, arr) => {
                    const cfg =
                      AUDIT_EVENT_CONFIG[log.eventType] ?? DEFAULT_EVENT;
                    const Icon = cfg.icon;
                    const isLast = i === arr.length - 1;

                    return (
                      <li key={i} className="flex gap-4">
                        {/* Icon + line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center",
                              "rounded-full",
                              cfg.bg,
                            )}
                          >
                            <Icon className={cn("h-4 w-4", cfg.color)} />
                          </div>
                          {!isLast && (
                            <div
                              className="mt-1 w-px flex-1 bg-border mb-1"
                              style={{ minHeight: "20px" }}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div
                          className={cn(
                            "flex-1 flex items-start justify-between gap-4",
                            !isLast && "pb-5",
                          )}
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {cfg.label}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {log.detail}
                            </p>
                          </div>
                          <span
                            className="shrink-0 text-xs text-muted-foreground
                                           whitespace-nowrap"
                          >
                            {formatDateTime(log.occurredAt)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
              </ol>
            </Section>
          )}

          {/* Survey result */}
          {request.survey && (
            <Section title="Satisfaction Survey">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={cn(
                        "h-6 w-6",
                        n <= request.survey!.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 dark:fill-gray-700 text-gray-300 dark:text-gray-600",
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {request.survey.rating}/5
                </span>
                <span className="text-sm text-muted-foreground">
                  {
                    ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                      request.survey.rating
                    ]
                  }
                </span>
              </div>
              {request.survey.comment && (
                <blockquote
                  className="mt-3 border-l-2 border-amber-300
                                       pl-4 text-sm italic text-muted-foreground"
                >
                  "{request.survey.comment}"
                </blockquote>
              )}
            </Section>
          )}
          {isParticipant && <RequestMessagesPanel requestId={request.id} />}
        </div>

        {/* ── Right column ────────────────────────────────────────── */}
        <div className="space-y-6 flex flex-col">
          {/* Resubmit panel — Cancelled requests, Collaborator only */}
          {request.status === "Cancelled" && role === UserRole.Collaborator && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <RotateCcw className="h-4 w-4 text-amber-700 dark:text-amber-300 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    This request was cancelled
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    You can resubmit it with the same details — review and
                    adjust before sending.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  navigate("/requests/new", {
                    state: { resubmitFrom: request },
                  })
                }
                className="w-full inline-flex items-center justify-center gap-2
                             rounded-lg border border-amber-300 dark:border-amber-900/50 bg-white dark:bg-card px-4 py-2
                             text-sm font-medium text-amber-800 dark:text-amber-300 shadow-sm
                             hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Resubmit this Request
              </button>
            </div>
          )}

          {/* Actions */}
          <RequestActions request={request} />

          {/* ── Finances (Admin only) ──────────────────────────────── */}
          {role === UserRole.Admin && (
            <ExpensePanel
              requestId={request.id}
              status={request.status}
              expenseSummary={request.expenseSummary}
            />
          )}

          {/* Assignment */}
          {request.currentAssignment && (
            <Section title="Assignment">
              <div className="space-y-4">
                {/* Courier info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Courier
                    </p>
                    <p className="font-semibold text-foreground">
                      {request.currentAssignment.courierName}
                    </p>
                  </div>
                  {request.currentAssignment.completedAt &&
                    request.currentAssignment.startedAt && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Duration
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {formatDuration(
                            request.currentAssignment.startedAt,
                            request.currentAssignment.completedAt,
                          )}
                        </p>
                      </div>
                    )}
                </div>

                {/* Horizontal timeline */}
                <div className="relative flex items-center justify-between gap-2 py-2">
                  {/* Assigned */}
                  <div className="flex flex-1 flex-col items-center text-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/30">
                      <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="mt-2 text-xs font-medium text-foreground">
                      Assigned
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(request.currentAssignment.assignedAt)}
                    </p>
                  </div>

                  {/* Connecting line (only if Started exists) */}
                  {request.currentAssignment.startedAt && (
                    <div className="h-px flex-1 bg-border" />
                  )}

                  {/* Started (if exists) */}
                  {request.currentAssignment.startedAt && (
                    <div className="flex flex-1 flex-col items-center text-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30">
                        <Play className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="mt-2 text-xs font-medium text-foreground">
                        Started
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(request.currentAssignment.startedAt)}
                      </p>
                    </div>
                  )}

                  {/* Connecting line (only if Completed exists) */}
                  {request.currentAssignment.completedAt && (
                    <div className="h-px flex-1 bg-border" />
                  )}

                  {/* Completed (if exists) */}
                  {request.currentAssignment.completedAt && (
                    <div className="flex flex-1 flex-col items-center text-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="mt-2 text-xs font-medium text-foreground">
                        Completed
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(request.currentAssignment.completedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Financial summary card */}
                {(request.currentAssignment.actualCost != null ||
                  request.currentAssignment.advancedAmount != null ||
                  request.currentAssignment.isReconciled) && (
                  <div className="rounded-lg bg-muted/30 p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Financial
                    </p>
                    <div className="flex flex-wrap justify-between items-center gap-2 text-sm">
                      {request.currentAssignment.actualCost != null && (
                        <div>
                          <span className="text-muted-foreground">
                            Actual cost:
                          </span>{" "}
                          <span className="font-medium">
                            {request.currentAssignment.actualCost.toFixed(2)}{" "}
                            TND
                          </span>
                        </div>
                      )}
                      {request.currentAssignment.advancedAmount != null && (
                        <div>
                          <span className="text-muted-foreground">
                            Advanced:
                          </span>{" "}
                          <span className="font-medium">
                            {request.currentAssignment.advancedAmount.toFixed(
                              2,
                            )}{" "}
                            TND
                          </span>
                        </div>
                      )}
                      {request.currentAssignment.isReconciled && (
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">
                            Reconciled
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Note */}
                {request.currentAssignment.note && (
                  <div className="border-l-2 border-amber-300 pl-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Note</p>
                    <p className="text-sm text-foreground italic">
                      {request.currentAssignment.note}
                    </p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Delivery address */}
          <Section
            title="Delivery Address"
            icon={<MapPin className="h-4 w-4" />}
            className="flex-1 flex flex-col"
          >
            <div className="space-y-1">
              <p className="text-sm text-foreground">
                {request.deliveryAddress.street}
              </p>
              <p className="text-sm text-muted-foreground">
                {request.deliveryAddress.city},{" "}
                {request.deliveryAddress.postalCode}
              </p>
              <p className="text-sm text-muted-foreground">
                {request.deliveryAddress.country}
              </p>
              {request.deliveryAddress.note && (
                <p className="mt-1 text-xs text-muted-foreground italic">
                  {request.deliveryAddress.note}
                </p>
              )}
            </div>

            {request.deliveryAddress.latitude &&
              request.deliveryAddress.longitude && (
                <div className="mt-4 flex-1">
                  <LocationMap
                    latitude={request.deliveryAddress.latitude}
                    longitude={request.deliveryAddress.longitude}
                    height="stretch"
                  />
                </div>
              )}

            {(request.contactPerson || request.contactPhone) && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Contact (Vis-à-vis)
                </p>
                <p className="text-sm font-medium text-foreground">
                  {request.contactPerson}
                </p>
                {request.contactPhone && (
                  <p className="text-sm text-muted-foreground">
                    {request.contactPhone}
                  </p>
                )}
              </div>
            )}
          </Section>
        </div>
      </div>
      {showTemplateModal && (
        <CreateTemplateModal
          requestId={request.id}
          requestTitle={request.title}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

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
    <div
      className={`rounded-xl border bg-card p-5 shadow-sm ${className || ""}`}
    >
      <div className="mb-4 flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <h3
          className="text-xs font-semibold uppercase tracking-wider
                       text-muted-foreground"
        >
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
