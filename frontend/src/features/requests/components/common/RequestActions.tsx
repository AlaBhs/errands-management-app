import { useState } from "react";
import type { CourierScoreDto, RequestDetailsDto } from "../../types";
import {
  useAssignRequest,
  useCompleteRequest,
  useStartRequest,
  useSubmitSurvey,
  useCourierCandidates,
} from "@/features/requests";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth";
import { DischargePhotoSelector } from "./DischargePhotoSelector";
import { CancelRequestModal } from "../modals/CancelRequestModal";
import { isApiError } from "@/shared/api/client";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import {
  Play,
  UserCheck,
  CheckCircle2,
  Star,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Zap,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { Button } from "@/components/ui/button";

interface RequestActionsProps {
  request: RequestDetailsDto;
}

// ── Courier candidate card ────────────────────────────────────────────────────

interface CandidateCardProps {
  candidate: CourierScoreDto;
  rank: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function CandidateCard({
  candidate,
  rank,
  isSelected,
  onSelect,
}: CandidateCardProps) {
  const [expanded, setExpanded] = useState(false);

  const { scoreBreakdown: bd } = candidate;

  const scoreColor =
    candidate.totalScore >= 75
      ? "text-emerald-600 dark:text-emerald-400"
      : candidate.totalScore >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-500 dark:text-red-400";

  const rankBadgeColor =
    rank === 1
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      : rank === 2
        ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        : rank === 3
          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
          : "bg-muted text-muted-foreground";

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-150 cursor-pointer",
        isSelected
          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20 shadow-sm"
          : "border-border bg-card hover:border-blue-300 dark:hover:border-blue-700 hover:bg-muted/30",
      )}
      onClick={() => onSelect(candidate.courierId)}
    >
      {/* ── Main row ── */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Rank badge */}
        <span
          className={cn(
            "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            rankBadgeColor,
          )}
        >
          {rank}
        </span>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-sm font-medium text-foreground truncate">
              {candidate.fullName}
            </p>
            {/* Total score */}
            <div className="shrink-0 text-right">
              <span
                className={cn("text-base font-bold tabular-nums", scoreColor)}
              >
                {candidate.totalScore.toFixed(0)}
              </span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            {candidate.city && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {candidate.city}
              </span>
            )}
            {candidate.distanceKm !== undefined &&
              candidate.distanceKm !== null && (
                <span className="text-xs text-muted-foreground">
                  {candidate.distanceKm.toFixed(1)} km away
                </span>
              )}
            <span className="text-xs text-muted-foreground">
              {candidate.activeAssignmentsCount} active
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* ── Expanded breakdown ── */}
      {expanded && (
        <div
          className="px-3 pb-3 pt-1 border-t border-border space-y-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Availability */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                Availability
              </span>
              <span className="text-xs font-medium tabular-nums text-foreground">
                {bd.availabilityScore.toFixed(0)}
              </span>
            </div>
            <ScoreBar value={bd.availabilityScore} color="bg-blue-500" />
          </div>

          {/* Proximity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                Proximity
              </span>
              <span className="text-xs font-medium tabular-nums text-foreground">
                {bd.proximityScore.toFixed(0)}
              </span>
            </div>
            <ScoreBar value={bd.proximityScore} color="bg-emerald-500" />
          </div>

          {/* Performance */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Performance
              </span>
              <span className="text-xs font-medium tabular-nums text-foreground">
                {bd.performanceScore.toFixed(0)}
              </span>
            </div>
            <ScoreBar value={bd.performanceScore} color="bg-purple-500" />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 pt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {candidate.averageRating > 0
                ? candidate.averageRating.toFixed(1)
                : "—"}
            </span>
            <span className="text-xs text-muted-foreground">
              {(candidate.completionRate * 100).toFixed(0)}% completion
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RequestActions({ request }: RequestActionsProps) {
  const { id, status } = request;
  const role = useAuthStore((s) => s.user?.role);

  const assign = useAssignRequest(id);
  const start = useStartRequest(id);
  const complete = useCompleteRequest(id);
  const survey = useSubmitSurvey(id);

  const { data: candidates, isLoading: candidatesLoading } =
    useCourierCandidates(
      status === "Pending" && role === UserRole.Admin ? id : "",
    );

  // State
  const [selectedCourierId, setSelectedCourierId] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [completeNote, setCompleteNote] = useState("");
  const [dischargePhoto, setDischargePhoto] = useState<File | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [surveyComment, setSurveyComment] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const anyPending =
    assign.isPending ||
    start.isPending ||
    complete.isPending ||
    survey.isPending;

  const currentError =
    assign.error || start.error || complete.error || survey.error;

  const activeRating = hoveredRating || rating;

  const isCourierRequired =
    (status === "Assigned" && role === UserRole.Courier) ||
    (status === "InProgress" && role === UserRole.Courier);

  const canCancel =
    (status === "Pending" &&
      (role === UserRole.Admin || role === UserRole.Collaborator)) ||
    (status === "Assigned" &&
      (role === UserRole.Admin ||
        role === UserRole.Collaborator ||
        role === UserRole.Courier)) ||
    (status === "InProgress" &&
      (role === UserRole.Admin ||
        role === UserRole.Collaborator ||
        role === UserRole.Courier));

  const selectedCandidate = candidates?.find(
    (c) => c.courierId === selectedCourierId,
  );

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
          <p className="text-sm text-muted-foreground">
            This request has been cancelled.
          </p>
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
              message={
                isApiError(currentError)
                  ? currentError.message
                  : "Something went wrong."
              }
            />
          )}

          {/* ── PENDING — Admin: ranked candidates ──────────────────── */}
          {status === "Pending" && role === UserRole.Admin && (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Recommended Couriers
                </label>
                {candidates && candidates.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3 text-amber-500" />
                    AI ranked
                  </span>
                )}
              </div>

              {/* Loading state */}
              {candidatesLoading && (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!candidatesLoading &&
                (!candidates || candidates.length === 0) && (
                  <p className="text-xs text-muted-foreground py-2">
                    No active couriers available.
                  </p>
                )}

              {/* Candidate list */}
              {!candidatesLoading && candidates && candidates.length > 0 && (
                <div className="space-y-2">
                  {candidates.map((candidate, index) => (
                    <CandidateCard
                      key={candidate.courierId}
                      candidate={candidate}
                      rank={index + 1}
                      isSelected={selectedCourierId === candidate.courierId}
                      onSelect={setSelectedCourierId}
                    />
                  ))}
                </div>
              )}

              {/* Selected summary + assign button */}
              {selectedCandidate && (
                <div className="space-y-2 pt-1">
                  <div className="rounded-lg bg-muted/50 dark:bg-muted/20 px-3 py-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Selected</p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedCandidate.fullName}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {selectedCandidate.totalScore.toFixed(0)}
                      <span className="text-xs font-normal text-muted-foreground">
                        /100
                      </span>
                    </span>
                  </div>

                  <Button
                    onClick={() =>
                      assign.mutate({ courierId: selectedCourierId })
                    }
                    disabled={anyPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {assign.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Assigning…
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" /> Assign{" "}
                        {selectedCandidate.fullName.split(" ")[0]}
                      </>
                    )}
                  </Button>
                </div>
              )}
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
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Starting…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" /> Start Request
                </>
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

              <DischargePhotoSelector
                file={dischargePhoto}
                onChange={setDischargePhoto}
              />

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
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Completing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Mark as Completed
                  </>
                )}
              </Button>
            </div>
          )}

          {/* ── COMPLETED — Survey ───────────────────────────────────── */}
          {status === "Completed" &&
            !request.survey &&
            (role === UserRole.Admin || role === UserRole.Collaborator) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Rate this request
                  </label>
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
                              : "fill-gray-200 dark:fill-gray-700 text-gray-300 dark:text-gray-600",
                          )}
                        />
                      </button>
                    ))}
                    {activeRating > 0 && (
                      <span className="ml-1 text-xs font-medium text-foreground">
                        {
                          [
                            "",
                            "Poor",
                            "Fair",
                            "Good",
                            "Very Good",
                            "Excellent",
                          ][activeRating]
                        }
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
                  onClick={() =>
                    survey.mutate({
                      rating,
                      comment: surveyComment || undefined,
                    })
                  }
                  disabled={rating === 0 || anyPending}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-md dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-amber-950"
                >
                  {survey.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 fill-amber-900" /> Submit Review
                    </>
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
