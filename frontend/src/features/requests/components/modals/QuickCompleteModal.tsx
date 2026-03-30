import { useRef, useState } from "react";
import { DollarSign, FileText, Camera, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompleteRequest } from "../../hooks/useRequestMutations";
import { isApiError } from "@/shared/api/client";

interface QuickCompleteModalProps {
  requestId: string;
  title: string;
  onClose: () => void;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_SIZE = 10 * 1024 * 1024;

export function QuickCompleteModal({
  requestId,
  title,
  onClose,
}: QuickCompleteModalProps) {
  const [actualCost, setActualCost] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
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
        actualCost: actualCost ? parseFloat(actualCost) : undefined,
        note: note || undefined,
        dischargePhoto: photo ?? undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md bg-background dark:bg-card rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Complete Request
          </DialogTitle>
          <DialogDescription className="mt-2 text-xs text-muted-foreground line-clamp-1">
            {title}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-4">
          {/* Actual cost */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Actual Cost
              <span className="ml-1 text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <DollarSign
                className="absolute left-3 top-1/2 h-4 w-4
                                     -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-border
                           bg-background dark:bg-muted/50 py-2.5 pl-9 pr-4 text-sm
                           text-foreground focus:border-foreground focus:bg-background
                           dark:focus:bg-muted/70 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Note
              <span className="ml-1 text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <FileText
                className="absolute left-3 top-3 h-4 w-4
                                   text-muted-foreground"
              />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any delivery notes..."
                rows={2}
                className="w-full rounded-lg border border-border
                           bg-background dark:bg-muted/50 py-2.5 pl-9 pr-4 text-sm
                           text-foreground resize-none focus:border-foreground
                           focus:bg-background dark:focus:bg-muted/70
                           focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Discharge photo */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Discharge Photo
              <span className="ml-1 text-muted-foreground font-normal">
                (optional)
              </span>
            </label>

            {photoPreview ? (
              <div
                className="relative rounded-lg overflow-hidden
                              border border-border dark:border-muted/40"
              >
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
                             bg-card/80 dark:bg-card/80 p-1 shadow text-gray-600
                             dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400
                             transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-lg
                           border-2 border-dashed border-border dark:border-muted/40
                           py-3 px-4 text-xs text-muted-foreground
                           hover:border-foreground hover:text-foreground
                           dark:hover:border-muted-foreground
                           transition-colors"
              >
                <Camera className="h-4 w-4" />
                Add proof of delivery photo
              </button>
            )}

            {photoError && (
              <p className="text-xs text-red-500 dark:text-red-400">
                {photoError}
              </p>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePhotoSelect(f);
              }}
            />
          </div>

          {/* Error */}
          {complete.isError && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {isApiError(complete.error)
                ? complete.error.message
                : "Failed to complete request."}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2.5
                         text-sm text-foreground hover:bg-muted
                         dark:hover:bg-muted/40 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={complete.isPending}
              className="flex-1 flex items-center justify-center gap-2
                         rounded-lg bg-emerald-600 dark:bg-emerald-700 py-2.5 text-sm
                         font-semibold text-white hover:bg-emerald-700
                         dark:hover:bg-emerald-800 disabled:opacity-50 transition-colors"
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
      </DialogContent>
    </Dialog>
  );
}
