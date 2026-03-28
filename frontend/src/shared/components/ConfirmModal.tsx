import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/shared/utils/utils";

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass?: string;
  isPending: boolean;
  icon?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  confirmClass,
  isPending,
  icon,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const defaultConfirmClass =
    "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-start gap-4 space-y-0">
          {icon && (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center
                         rounded-full bg-red-100 dark:bg-red-900/30"
            >
              {icon}
            </div>
          )}
          <div className="flex-1">
            <DialogTitle className="text-base font-semibold text-foreground">
              {title}
            </DialogTitle>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </DialogHeader>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2.5
                       text-sm text-foreground hover:bg-muted
                       transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 rounded-lg",
              "py-2.5 text-sm font-semibold disabled:opacity-50",
              confirmClass || defaultConfirmClass,
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}