import { useRef, useState }              from "react";
import { X, DollarSign, FileText,
         Camera, Loader2 }               from "lucide-react";
import { useCompleteRequest }            from "../../hooks/useRequestMutations";
import { isApiError }                    from "@/shared/api/client";

interface QuickCompleteModalProps {
  requestId: string;
  title:     string;
  onClose:   () => void;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp"
];
const MAX_SIZE = 10 * 1024 * 1024;

export function QuickCompleteModal({
  requestId,
  title,
  onClose,
}: QuickCompleteModalProps) {
  const [actualCost,     setActualCost]     = useState("");
  const [note,           setNote]           = useState("");
  const [photo,          setPhoto]          = useState<File | null>(null);
  const [photoPreview,   setPhotoPreview]   = useState<string | null>(null);
  const [photoError,     setPhotoError]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const complete = useCompleteRequest(requestId);

  const handlePhotoSelect = (file: File) => {
    setPhotoError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError("Only images (JPEG, PNG, GIF, WEBP) are allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setPhotoError("Image must not exceed 10 MB.");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    complete.mutate(
      {
        actualCost:     actualCost ? parseFloat(actualCost) : undefined,
        note:           note       || undefined,
        dischargePhoto: photo      ?? undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-6 pb-4">
          <div>
            <h2 className="text-base font-semibold text-[#2E2E38]">
              Complete Request
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground
                          line-clamp-1">
              {title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-gray-400
                       hover:bg-gray-100 hover:text-gray-600
                       transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 pb-6">

          {/* Actual cost */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#2E2E38]">
              Actual Cost
              <span className="ml-1 text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4
                                     -translate-y-1/2 text-muted-foreground" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={actualCost}
                onChange={e => setActualCost(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-200
                           bg-gray-50 py-2.5 pl-9 pr-4 text-sm
                           focus:border-[#2E2E38] focus:bg-white
                           focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#2E2E38]">
              Note
              <span className="ml-1 text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4
                                   text-muted-foreground" />
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Any delivery notes..."
                rows={2}
                className="w-full rounded-xl border border-gray-200
                           bg-gray-50 py-2.5 pl-9 pr-4 text-sm
                           resize-none focus:border-[#2E2E38]
                           focus:bg-white focus:outline-none
                           transition-colors"
              />
            </div>
          </div>

          {/* Discharge photo */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#2E2E38]">
              Discharge Photo
              <span className="ml-1 text-muted-foreground font-normal">
                (optional)
              </span>
            </label>

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden
                              border border-gray-200">
                <img
                  src={photoPreview}
                  alt="Discharge preview"
                  className="w-full max-h-32 object-cover"
                />
                <button
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-2 right-2 rounded-full
                             bg-white/80 p-1 shadow text-gray-600
                             hover:text-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-xl
                           border-2 border-dashed border-gray-200
                           py-3 px-4 text-xs text-muted-foreground
                           hover:border-[#2E2E38] hover:text-[#2E2E38]
                           transition-colors"
              >
                <Camera className="h-4 w-4" />
                Add proof of delivery photo
              </button>
            )}

            {photoError && (
              <p className="text-xs text-red-500">{photoError}</p>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handlePhotoSelect(f);
              }}
            />
          </div>

          {/* Error */}
          {complete.isError && (
            <p className="text-xs text-red-500">
              {isApiError(complete.error)
                ? complete.error.message
                : "Failed to complete request."}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5
                         text-sm text-gray-600 hover:bg-gray-50
                         transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={complete.isPending}
              className="flex-1 flex items-center justify-center gap-2
                         rounded-xl bg-emerald-600 py-2.5 text-sm
                         font-semibold text-white hover:bg-emerald-700
                         disabled:opacity-50 transition-colors"
            >
              {complete.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Completing…
                </>
              ) : (
                "Mark as Completed"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}