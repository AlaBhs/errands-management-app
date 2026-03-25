import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { useCancelRequest } from "../../hooks/useRequestMutations";
import { isApiError } from "@/shared/api/client";

interface CancelRequestModalProps {
  requestId: string;
  reasonRequired: boolean;
  onClose: () => void;
}

export function CancelRequestModal({
  requestId,
  reasonRequired,
  onClose,
}: CancelRequestModalProps) {
  const [reason, setReason] = useState("");
  const cancel = useCancelRequest(requestId);

  const canSubmit = reasonRequired ? !!reason.trim() : true;

  const handleConfirm = () => {
    cancel.mutate({ reason: reason }, { onSuccess: onClose });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center
                          rounded-full bg-red-100"
          >
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-[#2E2E38]">
              Cancel Request
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-gray-400
                       hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 pb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#2E2E38]">
              Reason for cancellation
              {reasonRequired ? (
                <span className="ml-1 text-red-500">*</span>
              ) : (
                <span className="ml-1 text-muted-foreground font-normal">
                  (optional)
                </span>
              )}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                reasonRequired
                  ? "Please explain why you are cancelling..."
                  : "Optionally explain why you are cancelling..."
              }
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-gray-50
                         px-4 py-2.5 text-sm resize-none
                         focus:border-[#2E2E38] focus:bg-white
                         focus:outline-none transition-colors"
            />
            {reasonRequired && !reason.trim() && (
              <p className="text-xs text-red-500">
                A reason is required to cancel this request.
              </p>
            )}
          </div>

          {cancel.isError && (
            <p className="text-xs text-red-500">
              {isApiError(cancel.error)
                ? cancel.error.message
                : "Failed to cancel request."}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5
                         text-sm text-gray-600 hover:bg-gray-50
                         transition-colors"
            >
              Keep Request
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canSubmit || cancel.isPending}
              className="flex-1 flex items-center justify-center gap-2
                         rounded-xl bg-red-600 py-2.5 text-sm font-semibold
                         text-white hover:bg-red-700 disabled:opacity-50
                         transition-colors"
            >
              {cancel.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Cancelling…
                </>
              ) : (
                "Cancel Request"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
