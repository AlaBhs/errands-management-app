import { useState } from "react";
import { Loader2, BookmarkPlus } from "lucide-react";
import { useCreateTemplate } from "../hooks/useTemplateMutations";
import { isApiError } from "@/shared/api/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/shared/utils/utils";

interface CreateTemplateModalProps {
  requestId: string;
  requestTitle: string;
  onClose: () => void;
}

export function CreateTemplateModal({
  requestId,
  requestTitle,
  onClose,
}: CreateTemplateModalProps) {
  const [name, setName] = useState("");
  const create = useCreateTemplate();

  const canSubmit = name.trim().length > 0 && name.trim().length <= 100;

  const handleConfirm = () => {
    create.mutate(
      { requestId, templateName: name.trim() },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <BookmarkPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-base font-semibold text-foreground">
              Save as Template
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
              Reuse this request's details to create new requests faster.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Source request preview */}
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">Based on request</p>
            <p className="text-sm font-medium text-foreground truncate">
              {requestTitle}
            </p>
          </div>

          {/* Template name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit && !create.isPending) {
                  handleConfirm();
                }
              }}
              placeholder="e.g. Office Supplies — Floor 3"
              maxLength={100}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5
                         text-sm text-foreground focus:border-[var(--ey-dark)]
                         focus:bg-background focus:outline-none transition-colors"
            />
            <div className="flex items-center justify-between">
              {!canSubmit && name.length > 0 && (
                <p className="text-xs text-red-500">Name is required (max 100 chars).</p>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {name.length}/100
              </span>
            </div>
          </div>

          {create.isError && (
            <p className="text-xs text-red-500">
              {isApiError(create.error)
                ? create.error.message
                : "Failed to create template."}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2.5
                         text-sm text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canSubmit || create.isPending}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-lg",
                "bg-indigo-600 dark:bg-indigo-500 py-2.5 text-sm font-semibold",
                "text-white hover:bg-indigo-700 dark:hover:bg-indigo-600",
                "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
              )}
            >
              {create.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4" />
                  Save Template
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}