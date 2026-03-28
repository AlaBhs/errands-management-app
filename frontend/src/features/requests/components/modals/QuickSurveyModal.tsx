import { useState }              from "react";
import { Star, MessageSquare,
         Loader2 }               from "lucide-react";
import { useSubmitSurvey }       from "../../hooks/useRequestMutations";
import { isApiError }            from "@/shared/api/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/shared/utils/utils";

interface QuickSurveyModalProps {
  requestId: string;
  title:     string;
  onClose:   () => void;
}

export function QuickSurveyModal({
  requestId,
  title,
  onClose,
}: QuickSurveyModalProps) {
  const [rating,  setRating]  = useState<number>(0);
  const [comment, setComment] = useState("");
  const [hovered, setHovered] = useState<number>(0);
  const survey = useSubmitSurvey(requestId);

  const handleSubmit = () => {
    if (rating === 0) return;
    survey.mutate(
      {
        rating,
        comment: comment || undefined,
      },
      { onSuccess: onClose },
    );
  };

  const LABELS: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  const activeRating = hovered || rating;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Rate Your Experience
          </DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {title}
          </p>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-5">

          {/* Star rating */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">
              Rating <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`Rate ${n} out of 5`}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      n <= activeRating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 dark:fill-gray-700 text-gray-300 dark:text-gray-600"
                    )}
                  />
                </button>
              ))}

              {/* Label */}
              <span className={cn(
                "ml-2 text-sm font-medium transition-colors",
                activeRating > 0
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}>
                {activeRating > 0 ? LABELS[activeRating] : "Select a rating"}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Comment
              <span className="ml-1 text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4
                                        text-muted-foreground" />
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                className="w-full rounded-lg border border-border
                           bg-background dark:bg-card py-2.5 pl-9 pr-4 text-sm text-foreground
                           resize-none focus:border-[#2E2E38]
                           focus:bg-background dark:focus:bg-card focus:outline-none
                           transition-colors"
              />
            </div>
          </div>

          {/* Error */}
          {survey.isError && (
            <p className="text-xs text-red-500">
              {isApiError(survey.error)
                ? survey.error.message
                : "Failed to submit survey."}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2.5
                         text-sm text-foreground hover:bg-muted dark:hover:bg-muted/40
                         transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || survey.isPending}
              className="flex-1 flex items-center justify-center gap-2
                         rounded-lg bg-amber-400 dark:bg-amber-500 py-2.5 text-sm
                         font-semibold text-amber-900 dark:text-amber-900
                         hover:bg-amber-500 dark:hover:bg-amber-600 disabled:opacity-50
                         disabled:cursor-not-allowed transition-colors"
            >
              {survey.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 fill-amber-900" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
