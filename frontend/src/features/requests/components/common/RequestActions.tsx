import { useState }                from "react";
import type { RequestDetailsDto }  from "../../types";
import {
  useAssignRequest,
  useCompleteRequest,
  useStartRequest,
  useSubmitSurvey,
}                                  from "@/features/requests";
import { useUsers }                from "@/features/users";
import { useAuthStore }            from "@/features/auth/store/authStore";
import { UserRole }                from "@/features/auth";
import { DischargePhotoSelector }  from "./DischargePhotoSelector";
import { CancelRequestModal }      from "../modals/CancelRequestModal";
import { isApiError }              from "@/shared/api/client";
import { ErrorMessage }            from "@/shared/components/ErrorMessage";
import { Play, UserCheck,
         CheckCircle2, Star,
         XCircle, Loader2 }        from "lucide-react";
import { cn }                      from "@/shared/utils/utils";

interface RequestActionsProps {
  request: RequestDetailsDto;
}

export function RequestActions({ request }: RequestActionsProps) {
  const { id, status } = request;
  const role = useAuthStore((s) => s.user?.role);

  const assign   = useAssignRequest(id);
  const start    = useStartRequest(id);
  const complete = useCompleteRequest(id);
  const survey   = useSubmitSurvey(id);

  const { data: couriersData } = useUsers({
    page: 1, pageSize: 100,
    role: UserRole.Courier, isActive: true,
  });
  const couriers = couriersData?.items ?? [];

  // State
  const [selectedCourierId, setSelectedCourierId] = useState("");
  const [actualCost,         setActualCost]        = useState("");
  const [completeNote,       setCompleteNote]      = useState("");
  const [dischargePhoto,     setDischargePhoto]    = useState<File | null>(null);
  const [rating,             setRating]            = useState(0);
  const [hoveredRating,      setHoveredRating]     = useState(0);
  const [surveyComment,      setSurveyComment]     = useState("");
  const [showCancelModal,    setShowCancelModal]   = useState(false);

  const anyPending =
    assign.isPending || start.isPending ||
    complete.isPending || survey.isPending;

  const currentError =
    assign.error || start.error ||
    complete.error || survey.error;

  const activeRating = hoveredRating || rating;

  const isCourierRequired =
    (status === "Assigned" && role === UserRole.Courier) ||
    (status === "InProgress" && role === UserRole.Courier);

  const canCancel =
    (status === "Pending"    && (role === UserRole.Admin || role === UserRole.Collaborator)) ||
    (status === "Assigned"   && (role === UserRole.Admin || role === UserRole.Collaborator || role === UserRole.Courier)) ||
    (status === "InProgress" && (role === UserRole.Admin || role === UserRole.Collaborator || role === UserRole.Courier));

  if (status === "Completed" && request.survey) {
    return (
      <div className="rounded-xl border border-emerald-200
                      bg-emerald-50 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium text-emerald-800">
            Request completed and survey submitted.
          </p>
        </div>
      </div>
    );
  }

  if (status === "Cancelled") {
    return (
      <div className="rounded-xl border border-gray-200
                      bg-gray-50 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-gray-400 shrink-0" />
          <p className="text-sm text-gray-500">
            This request has been cancelled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200
                      bg-card shadow-sm overflow-hidden">

        {/* Section header */}
        <div className="border-b border-gray-100 bg-muted/30 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider
                         text-muted-foreground">
            Actions
          </h2>
        </div>

        <div className="p-5 space-y-4">

          {currentError && (
            <ErrorMessage
              message={isApiError(currentError)
                ? currentError.message
                : "Something went wrong."}
            />
          )}

          {/* ── PENDING — Admin: assign ──────────────────────────────── */}
          {status === "Pending" && role === UserRole.Admin && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block text-xs font-medium
                                  text-muted-foreground">
                  Assign to Courier
                </label>
                {couriers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No active couriers available.
                  </p>
                ) : (
                  <select
                    value={selectedCourierId}
                    onChange={e => setSelectedCourierId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200
                               bg-gray-50 px-3 py-2.5 text-sm
                               focus:border-[#2E2E38] focus:bg-white
                               focus:outline-none transition-colors"
                  >
                    <option value="">Select a courier...</option>
                    {couriers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} — {c.email}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => assign.mutate({ courierId: selectedCourierId })}
                  disabled={anyPending || !selectedCourierId}
                  className="w-full flex items-center justify-center gap-2
                             rounded-xl bg-blue-600 px-4 py-2.5 text-sm
                             font-semibold text-white hover:bg-blue-700
                             disabled:opacity-50 transition-colors"
                >
                  {assign.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Assigning…</>
                  ) : (
                    <><UserCheck className="h-4 w-4" /> Assign Courier</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── ASSIGNED — Courier: start ────────────────────────────── */}
          {status === "Assigned" && role === UserRole.Courier && (
            <button
              onClick={() => start.mutate()}
              disabled={anyPending}
              className="w-full flex items-center justify-center gap-2
                         rounded-xl bg-purple-600 px-4 py-2.5 text-sm
                         font-semibold text-white hover:bg-purple-700
                         disabled:opacity-50 transition-colors"
            >
              {start.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</>
              ) : (
                <><Play className="h-4 w-4 fill-white" /> Start Request</>
              )}
            </button>
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
                    onChange={e => setActualCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200
                               bg-gray-50 px-3 py-2.5 text-sm
                               focus:border-[#2E2E38] focus:bg-white
                               focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Note
                    <span className="ml-1 font-normal">(optional)</span>
                  </label>
                  <input
                    value={completeNote}
                    onChange={e => setCompleteNote(e.target.value)}
                    placeholder="Delivery note..."
                    className="w-full rounded-xl border border-gray-200
                               bg-gray-50 px-3 py-2.5 text-sm
                               focus:border-[#2E2E38] focus:bg-white
                               focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <DischargePhotoSelector
                file={dischargePhoto}
                onChange={setDischargePhoto}
              />

              <button
                onClick={() => complete.mutate({
                  actualCost:     actualCost ? parseFloat(actualCost) : undefined,
                  note:           completeNote || undefined,
                  dischargePhoto: dischargePhoto ?? undefined,
                })}
                disabled={anyPending}
                className="w-full flex items-center justify-center gap-2
                           rounded-xl bg-emerald-600 px-4 py-2.5 text-sm
                           font-semibold text-white hover:bg-emerald-700
                           disabled:opacity-50 transition-colors"
              >
                {complete.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Completing…</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Mark as Completed</>
                )}
              </button>
            </div>
          )}

          {/* ── COMPLETED — Survey ───────────────────────────────────── */}
          {status === "Completed" && !request.survey &&
           (role === UserRole.Admin || role === UserRole.Collaborator) && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Rate this request
                </label>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoveredRating(n)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={cn(
                        "h-7 w-7 transition-colors",
                        n <= activeRating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-100 text-gray-300"
                      )} />
                    </button>
                  ))}
                  {activeRating > 0 && (
                    <span className="ml-1 text-xs font-medium text-[#2E2E38]">
                      {["","Poor","Fair","Good","Very Good","Excellent"][activeRating]}
                    </span>
                  )}
                </div>
              </div>

              <input
                value={surveyComment}
                onChange={e => setSurveyComment(e.target.value)}
                placeholder="Comment (optional)"
                className="w-full rounded-xl border border-gray-200
                           bg-gray-50 px-3 py-2.5 text-sm
                           focus:border-[#2E2E38] focus:bg-white
                           focus:outline-none transition-colors"
              />

              <button
                onClick={() => survey.mutate({
                  rating,
                  comment: surveyComment || undefined,
                })}
                disabled={rating === 0 || anyPending}
                className="w-full flex items-center justify-center gap-2
                           rounded-xl bg-amber-400 px-4 py-2.5 text-sm
                           font-semibold text-amber-900 hover:bg-amber-500
                           disabled:opacity-50 transition-colors"
              >
                {survey.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                ) : (
                  <><Star className="h-4 w-4 fill-amber-900" /> Submit Review</>
                )}
              </button>
            </div>
          )}

          {/* ── Cancel button ────────────────────────────────────────── */}
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full rounded-xl border border-red-200 px-4 py-2.5
                         text-sm font-medium text-red-600 hover:bg-red-50
                         transition-colors"
            >
              Cancel Request
            </button>
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