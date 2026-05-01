import { useCallback, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ArrowRight, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { isApiError } from "@/shared/api/client";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one digit")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

// ── Page ──────────────────────────────────────────────────────────────────────

export function SetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      authApi.setPassword({
        email,
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }),
    onSuccess: () => setDone(true),
    onError: (err) => {
      const msg = isApiError(err) ? err.message : "Something went wrong.";
      setFormError(
        msg.toLowerCase().includes("token")
          ? "This activation link is invalid or has expired. Please contact your administrator."
          : msg,
      );
    },
  });

  const onSubmit = useCallback(
    (values: FormValues) => {
      setFormError(null);
      mutation.mutate(values);
    },
    [mutation],
  );

  // ── Missing params guard ──────────────────────────────────────────────────

  if (!token || !email) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold text-foreground">
            Invalid activation link
          </h1>
          <p className="text-sm text-muted-foreground">
            This link is missing required parameters. Please use the link from
            your activation email or contact your administrator.
          </p>
          <Link
            to="/login"
            className="mt-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </PageShell>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────

  if (done) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Account activated!
          </h1>
          <p className="text-sm text-muted-foreground">
            Your password has been set and your account is now active. You can
            sign in below.
          </p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="mt-2 flex items-center gap-2 rounded-xl bg-[var(--ey-yellow)]
                       px-6 py-2.5 text-sm font-semibold text-[var(--ey-dark)]
                       hover:bg-[var(--ey-yellow)]/90 transition-colors"
          >
            Go to login
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </PageShell>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <PageShell>
      <div className="w-full">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            Set your password
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            You're activating the account for{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e);
          }}
          noValidate
          className="space-y-5"
        >
          {/* New password */}
          <div className="space-y-1.5">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-foreground"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Min 8 characters…"
                {...register("newPassword")}
                aria-invalid={!!errors.newPassword}
                className="w-full rounded-xl border border-border bg-background
                           py-3.5 pl-12 pr-4 text-sm text-foreground
                           placeholder:text-muted-foreground transition-all
                           focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none
                           aria-invalid:border-destructive aria-invalid:bg-destructive/10"
              />
            </div>
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-foreground"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                {...register("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
                className="w-full rounded-xl border border-border bg-background
                           py-3.5 pl-12 pr-4 text-sm text-foreground
                           placeholder:text-muted-foreground transition-all
                           focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none
                           aria-invalid:border-destructive aria-invalid:bg-destructive/10"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* API error */}
          {formError && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10
                            border border-destructive/20 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{formError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="group flex w-full items-center justify-center gap-2
                       rounded-xl bg-[var(--ey-yellow)] py-4 text-sm font-semibold
                       text-[var(--ey-dark)] shadow-lg transition-all
                       hover:bg-[var(--ey-yellow)]/90 hover:shadow-xl
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2
                                border-[var(--ey-dark)]/30 border-t-[var(--ey-dark)]" />
                Activating account…
              </>
            ) : (
              <>
                Activate Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Security note */}
        <div className="mt-6 flex items-center gap-2.5 rounded-lg bg-muted px-3 py-2.5">
          <Shield className="h-4 w-4 shrink-0 text-[var(--ey-yellow)]
                             [filter:drop-shadow(0_0_6px_var(--ey-yellow))]" />
          <p className="text-xs text-muted-foreground">
            This link is single-use and expires after 24 hours
          </p>
        </div>
      </div>
    </PageShell>
  );
}

// ── Shared shell ──────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-screen overflow-hidden flex items-center justify-center p-6
                 bg-gradient-to-br from-[var(--ey-dark)] via-[#252530] to-[var(--ey-text-hover)]"
    >
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full
                        bg-[var(--ey-yellow)] opacity-[0.08] blur-2xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full
                        bg-[var(--ey-yellow)] opacity-[0.08] blur-2xl" />
      </div>

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ey-yellow)]">
          <span className="text-sm font-black text-[var(--ey-dark)]">EY</span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">EY Errands</p>
          <p className="text-[10px] font-medium tracking-widest text-[var(--ey-yellow)]/70 uppercase">
            Management System
          </p>
        </div>
      </nav>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-card/95 shadow-2xl
                        backdrop-blur-sm border border-border/50 p-8">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2026 Ernst & Young. All rights reserved.
        </p>
      </div>
    </div>
  );
}