import { useState }              from "react";
import { X, Star, MessageSquare,
         Loader2 }               from "lucide-react";
import { useSubmitSurvey }       from "../hooks/useRequestMutations";
import { isApiError }            from "@/shared/api/client";
import { cn } from "@/lib/utils";

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-6 pb-4">
          <div>
            <h2 className="text-base font-semibold text-[#2E2E38]">
              Rate Your Experience
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
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
        <div className="space-y-5 px-6 pb-6">

          {/* Star rating */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#2E2E38]">
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
                        : "fill-gray-100 text-gray-300"
                    )}
                  />
                </button>
              ))}

              {/* Label */}
              <span className={cn(
                "ml-2 text-sm font-medium transition-colors",
                activeRating > 0
                  ? "text-[#2E2E38]"
                  : "text-muted-foreground"
              )}>
                {activeRating > 0 ? LABELS[activeRating] : "Select a rating"}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#2E2E38]">
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
                className="w-full rounded-xl border border-gray-200
                           bg-gray-50 py-2.5 pl-9 pr-4 text-sm
                           resize-none focus:border-[#2E2E38]
                           focus:bg-white focus:outline-none
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
              className="flex-1 rounded-xl border border-gray-200 py-2.5
                         text-sm text-gray-600 hover:bg-gray-50
                         transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || survey.isPending}
              className="flex-1 flex items-center justify-center gap-2
                         rounded-xl bg-amber-400 py-2.5 text-sm
                         font-semibold text-amber-900
                         hover:bg-amber-500 disabled:opacity-50
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
      </div>
    </div>
  );
}
