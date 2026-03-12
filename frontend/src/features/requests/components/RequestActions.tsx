import { useState } from "react";
import type { RequestDetailsDto } from "../types";
import {
  useAssignRequest,
  useCancelRequest,
  useCompleteRequest,
  useStartRequest,
  useSubmitSurvey,
} from "@/features/requests";
import { isApiError } from "@/shared/api/client";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { useAuthStore } from "@/features/auth/store/authStore";
import { UserRole } from "@/features/auth";
 

interface RequestActionsProps {
  request: RequestDetailsDto;
}

export function RequestActions({ request }: RequestActionsProps) {
  const { id, status } = request;

  const role = useAuthStore((s) => s.user?.role);

  const assign = useAssignRequest(id);
  const start = useStartRequest(id);
  const cancel = useCancelRequest(id);
  const complete = useCompleteRequest(id);
  const survey = useSubmitSurvey(id);

  const [courierIdInput, setCourierIdInput] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [completeNote, setCompleteNote] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [surveyComment, setSurveyComment] = useState("");

  const anyPending =
    assign.isPending ||
    start.isPending ||
    cancel.isPending ||
    complete.isPending ||
    survey.isPending;

  const currentError =
    assign.error || start.error || cancel.error || complete.error || survey.error;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-medium text-gray-700">Actions</h2>

      {currentError && (
        <ErrorMessage
          message={isApiError(currentError) ? currentError.message : "Something went wrong."}
        />
      )}

      {/* PENDING — Admin: assign + cancel */}
      {status === "Pending" && role === UserRole.Admin && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">
              Courier ID
            </label>
            <input
              value={courierIdInput}
              onChange={(e) => setCourierIdInput(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => assign.mutate({ courierId: courierIdInput })}
              disabled={anyPending || !courierIdInput}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {assign.isPending ? "Assigning..." : "Assign Courier"}
            </button>
          </div>

          <CancelSection
            value={cancelReason}
            onChange={setCancelReason}
            onConfirm={() => cancel.mutate({ reason: cancelReason })}
            isPending={cancel.isPending}
            disabled={anyPending}
          />
        </div>
      )}

      {/* PENDING — Collaborator: cancel only */}
      {status === "Pending" && role === UserRole.Collaborator && (
        <CancelSection
          value={cancelReason}
          onChange={setCancelReason}
          onConfirm={() => cancel.mutate({ reason: cancelReason })}
          isPending={cancel.isPending}
          disabled={anyPending}
        />
      )}

      {/* ASSIGNED — Courier: start */}
      {status === "Assigned" && role === UserRole.Courier && (
        <div className="space-y-3">
          <button
            onClick={() => start.mutate()}
            disabled={anyPending}
            className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {start.isPending ? "Starting..." : "Start Request"}
          </button>
        </div>
      )}

      {/* ASSIGNED — Admin + Collaborator: cancel only */}
      {status === "Assigned" &&
        (role === UserRole.Admin || role === UserRole.Collaborator) && (
          <CancelSection
            value={cancelReason}
            onChange={setCancelReason}
            onConfirm={() => cancel.mutate({ reason: cancelReason })}
            isPending={cancel.isPending}
            disabled={anyPending}
          />
        )}

      {/* IN PROGRESS — Courier: complete */}
      {status === "InProgress" && role === UserRole.Courier && (
        <div className="space-y-2">
          <input
            type="number"
            value={actualCost}
            onChange={(e) => setActualCost(e.target.value)}
            placeholder="Actual cost (optional)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            value={completeNote}
            onChange={(e) => setCompleteNote(e.target.value)}
            placeholder="Note (optional)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() =>
              complete.mutate({
                actualCost: actualCost ? parseFloat(actualCost) : undefined,
                note: completeNote || undefined,
              })
            }
            disabled={anyPending}
            className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {complete.isPending ? "Completing..." : "Mark as Completed"}
          </button>
        </div>
      )}

      {/* COMPLETED — Admin + Collaborator: survey */}
      {status === "Completed" &&
        !request.survey &&
        (role === UserRole.Admin || role === UserRole.Collaborator) && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Rating (1–5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`h-8 w-8 rounded-full text-sm font-medium border transition-colors ${
                      rating === n
                        ? "bg-primary text-white border-primary"
                        : "border-gray-300 text-gray-600 hover:border-primary"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <input
              value={surveyComment}
              onChange={(e) => setSurveyComment(e.target.value)}
              placeholder="Comment (optional)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() =>
                survey.mutate({
                  rating,
                  comment: surveyComment || undefined,
                })
              }
              disabled={anyPending}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {survey.isPending ? "Submitting..." : "Submit Survey"}
            </button>
          </div>
        )}

      {/* COMPLETED + survey done */}
      {status === "Completed" && request.survey && (
        <p className="text-sm text-gray-500">Survey already submitted.</p>
      )}

      {/* CANCELLED */}
      {status === "Cancelled" && (
        <p className="text-sm text-gray-500">This request has been cancelled.</p>
      )}
    </div>
  );
}

interface CancelSectionProps {
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  isPending: boolean;
  disabled: boolean;
}

function CancelSection({
  value,
  onChange,
  onConfirm,
  isPending,
  disabled,
}: CancelSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Cancel Request
        </button>
      ) : (
        <>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Reason for cancellation"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={onConfirm}
              disabled={disabled || !value}
              className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}