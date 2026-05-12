import { useState } from "react";
import type { RequestDetailsDto } from "../../types";
import {
  useAssignRequest,
  useCompleteRequest,
  useStartRequest,
  useSubmitSurvey,
} from "@/features/requests";
import { useUsers } from "@/features/users";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth";
import { DischargePhotoSelector } from "./DischargePhotoSelector";
import { CancelRequestModal } from "../modals/CancelRequestModal";
import { isApiError } from "@/shared/api/client";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { Play, UserCheck, CheckCircle2, Star, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface RequestActionsProps {
  request: RequestDetailsDto;
}

export function RequestActions({ request }: RequestActionsProps) {
  const { id, status } = request;
  const role = useAuthStore((s) => s.user?.role);

  const assign = useAssignRequest(id);
  const start = useStartRequest(id);
  const complete = useCompleteRequest(id);
  const survey = useSubmitSurvey(id);

  const { data: couriersData } = useUsers({
    page: 1,
    pageSize: 100,
    role: UserRole.Courier,
    isActive: true,
  });
  const couriers = couriersData?.items ?? [];

  // State
  const [selectedCourierId, setSelectedCourierId] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [completeNote, setCompleteNote] = useState("");
  const [dischargePhoto, setDischargePhoto] = useState<File | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [surveyComment, setSurveyComment] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const anyPending = assign.isPending || start.isPending || complete.isPending || survey.isPending;

  const currentError = assign.error || start.error || complete.error || survey.error;

  const activeRating = hoveredRating || rating;

  const isCourierRequired =
    (status === "Assigned" && role === UserRole.Courier) ||
    (status === "InProgress" && role === UserRole.Courier);

  const canCancel =
    (status === "Pending" && (role === UserRole.Admin || role === UserRole.Collaborator)) ||
    (status === "Assigned" && (role === UserRole.Admin || role === UserRole.Collaborator || role === UserRole.Courier)) ||
    (status === "InProgress" && (role === UserRole.Admin || role === UserRole.Collaborator || role === UserRole.Courier));

  if (status === "Completed" && request.survey) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            Request completed and survey submitted.
          </p>
        </div>
      </div>
    );
  }

  if (status === "Cancelled") {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-muted/40 dark:bg-muted/10 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <p className="text-sm text-muted-foreground">This request has been cancelled.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Actions
          </h2>
        </div>

        <div className="p-5 space-y-4">
          {currentError && (
            <ErrorMessage
              message={isApiError(currentError) ? currentError.message : "Something went wrong."}
            />
          )}

          {/* ── PENDING — Admin: assign ──────────────────────────────── */}
          {status === "Pending" && role === UserRole.Admin && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-muted-foreground">
                  Assign to Courier
                </label>
                {couriers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No active couriers available.</p>
                ) : (
                  <Select value={selectedCourierId} onValueChange={setSelectedCourierId}>
                    <SelectTrigger className="w-full rounded-md border border-border bg-background dark:bg-card">
                      <SelectValue placeholder="Select a courier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {couriers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.fullName} — {c.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  onClick={() => assign.mutate({ courierId: selectedCourierId })}
                  disabled={anyPending || !selectedCourierId}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {assign.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Assigning…</>
                  ) : (
                    <><UserCheck className="h-4 w-4" /> Assign Courier</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── ASSIGNED — Courier: start ────────────────────────────── */}
          {status === "Assigned" && role === UserRole.Courier && (
            <Button
              onClick={() => start.mutate()}
              disabled={anyPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-md dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              {start.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</>
              ) : (
                <><Play className="h-4 w-4 fill-white" /> Start Request</>
              )}
            </Button>
          )}

          {/* ── IN PROGRESS — Courier: complete ─────────────────────── */}
          {status === "InProgress" && role === UserRole.Courier && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Actual Cost
                    <span className="ml-1 font-normal">(optional)</span>
                  </label>
                  <input
                    type="number"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-md border border-border bg-background dark:bg-card px-3 py-2.5 text-sm text-foreground focus:border-[#2E2E38] focus:bg-background dark:focus:bg-card focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Note
                    <span className="ml-1 font-normal">(optional)</span>
                  </label>
                  <input
                    value={completeNote}
                    onChange={(e) => setCompleteNote(e.target.value)}
                    placeholder="Delivery note..."
                    className="w-full rounded-md border border-border bg-background dark:bg-card px-3 py-2.5 text-sm text-foreground focus:border-[#2E2E38] focus:bg-background dark:focus:bg-card focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <DischargePhotoSelector file={dischargePhoto} onChange={setDischargePhoto} />

              <Button
                onClick={() =>
                  complete.mutate({
                    actualCost: actualCost ? parseFloat(actualCost) : undefined,
                    note: completeNote || undefined,
                    dischargePhoto: dischargePhoto ?? undefined,
                  })
                }
                disabled={anyPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                {complete.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Completing…</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Mark as Completed</>
                )}
              </Button>
            </div>
          )}

          {/* ── COMPLETED — Survey ───────────────────────────────────── */}
          {status === "Completed" && !request.survey &&
            (role === UserRole.Admin || role === UserRole.Collaborator) && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Rate this request</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoveredRating(n)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7 transition-colors",
                          n <= activeRating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 dark:fill-gray-700 text-gray-300 dark:text-gray-600"
                        )}
                      />
                    </button>
                  ))}
                  {activeRating > 0 && (
                    <span className="ml-1 text-xs font-medium text-foreground">
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][activeRating]}
                    </span>
                  )}
                </div>
              </div>

              <input
                value={surveyComment}
                onChange={(e) => setSurveyComment(e.target.value)}
                placeholder="Comment (optional)"
                className="w-full rounded-md border border-border bg-background dark:bg-card px-3 py-2.5 text-sm text-foreground focus:border-[#2E2E38] focus:bg-background dark:focus:bg-card focus:outline-none transition-colors"
              />

              <Button
                onClick={() => survey.mutate({ rating, comment: surveyComment || undefined })}
                disabled={rating === 0 || anyPending}
                className="w-full bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-md dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-amber-950"
              >
                {survey.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                ) : (
                  <><Star className="h-4 w-4 fill-amber-900" /> Submit Review</>
                )}
              </Button>
            </div>
          )}

          {/* ── Cancel button ────────────────────────────────────────── */}
          {canCancel && (
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              className="w-full border-red-200 dark:border-red-900/50 text-red-600 rounded-md dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30"
            >
              Cancel Request
            </Button>
          )}
        </div>
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <CancelRequestModal
          requestId={id}
          reasonRequired={isCourierRequired}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </>
  );
}