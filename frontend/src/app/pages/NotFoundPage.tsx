import { useNavigate }       from "react-router-dom";
import { useAuthStore }      from "@/features/auth/store/authStore";
import { FileQuestion,
         ArrowLeft, Home }   from "lucide-react";

export function NotFoundPage() {
  const navigate        = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center
                    bg-[var(--ey-dark)] px-6 text-center">

      {/* Subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,var(--ey-yellow) 0,var(--ey-yellow) 1px," +
            "transparent 1px,transparent 24px)",
        }}
      />

      {/* Content */}
      <div className="relative space-y-6">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center
                        rounded-2xl bg-[var(--ey-yellow)]/10 border border-[var(--ey-yellow)]/20">
          <FileQuestion className="h-10 w-10 text-[var(--ey-yellow)]" />
        </div>

        {/* 404 */}
        <div>
          <p className="text-8xl font-black text-[var(--ey-yellow)] leading-none
                        tabular-nums">
            404
          </p>
          <h1 className="mt-3 text-xl font-semibold text-white">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
            The page you're looking for doesn't exist or you don't have
            permission to access it.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row
                        sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl border
                       border-white/20 px-5 py-2.5 text-sm font-medium
                       text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          <button
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
            className="flex items-center gap-2 rounded-xl bg-[var(--ey-yellow)]
                       px-5 py-2.5 text-sm font-bold text-[var(--ey-dark)]
                       hover:bg-[var(--ey-yellow-hover)] transition-colors"
          >
            <Home className="h-4 w-4" />
            {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
          </button>
        </div>

        {/* EY mark */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="flex h-6 w-6 items-center justify-center
                          rounded bg-[var(--ey-yellow)]">
            <span className="text-[9px] font-black text-[var(--ey-dark)]">EY</span>
          </div>
          <span className="text-xs text-gray-500">
            EY Errands Management
          </span>
        </div>
      </div>
    </div>
  );
}