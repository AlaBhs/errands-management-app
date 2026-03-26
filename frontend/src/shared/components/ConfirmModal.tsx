import { X, Loader2 }        from "lucide-react";
import type { ReactNode }     from "react";

interface ConfirmModalProps {
  title:       string;
  description: string;
  confirmLabel: string;
  confirmClass?: string;
  isPending:   boolean;
  icon?:       ReactNode;
  onConfirm:   () => void;
  onClose:     () => void;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  confirmClass = "bg-red-600 hover:bg-red-700 text-white",
  isPending,
  icon,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center
                            justify-center rounded-full bg-red-100">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-base font-semibold text-[#2E2E38]">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
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

        {/* Actions */}
        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5
                       text-sm text-gray-600 hover:bg-gray-50
                       transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 flex items-center justify-center gap-2
                        rounded-xl py-2.5 text-sm font-semibold
                        disabled:opacity-50 transition-colors
                        ${confirmClass}`}
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}