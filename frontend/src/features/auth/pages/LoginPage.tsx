import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight, Shield, AlertCircle } from "lucide-react";
import { useLogin } from "../hooks/useAuthMutations";
import { useAuthStore } from "../store/authStore";
import { isApiError } from "@/shared/api/client";
import type { Location } from "react-router-dom";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

// ── Page ──────────────────────────────────────────────────────────────────────

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  const showError = (message: string) => {
    setFormError(message);
    setShakeKey((k) => k + 1);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setFormError(null), 4000);
  };

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = useCallback((values: FormValues) => {
    login.mutate(values, {
      onSuccess: () => navigate(from, { replace: true }),
      onError: (err) => {
        const raw = isApiError(err) ? err.message : "";
        console.log("Login error:", { raw, details: err });
        const friendly = raw.toLowerCase().includes("invalid")
          ? "Incorrect email or password. Please try again."
          : raw.toLowerCase().includes("deactivated")
            ? "Your account has been deactivated. Contact your administrator."
            : raw.toLowerCase().includes("inactive")
              ? "Your account is inactive. Contact your administrator."
              : "Something went wrong. Please try again.";
        showError(friendly);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative h-screen overflow-hidden flex items-center
                    justify-center p-6
                    bg-gradient-to-br from-[#2E2E38] via-[#252530]
                    to-[#1a1a24]"
    >
      {/* ── Ambient glow blobs ──────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
                                   overflow-hidden"
      >
        <div
          className="absolute -top-20 -left-20 h-56 w-56 rounded-full
                bg-[#FFE600] opacity-[0.08] blur-2xl"
        />
        <div
          className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full
                bg-[#FFE600] opacity-[0.08] blur-2xl
                [animation-delay:1.2s]"
        />
      </div>

      {/* ── Diagonal grid ───────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,#FFE600 0,#FFE600 1px," +
            "transparent 1px,transparent 56px)," +
            "repeating-linear-gradient(-45deg,#FFE600 0,#FFE600 1px," +
            "transparent 1px,transparent 56px)",
        }}
      />
      <nav
        className="absolute top-0 left-0 right-0 flex items-center
                gap-3 px-6 py-5"
      >
        <div
          className="flex h-9 w-9 items-center justify-center
                  rounded-lg bg-[#FFE600]"
        >
          <span className="text-sm font-black text-[#2E2E38]">EY</span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">EY Errands</p>
          <p
            className="text-[10px] font-medium tracking-widest
                  text-[#FFE600]/70 uppercase"
          >
            Management System
          </p>
        </div>
      </nav>
      {/* ── Card ────────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-md">
        {/* Logo + headline */}
        <div className="mb-8 text-center">
          <p className="mt-1.5 text-sm text-gray-400">
            Sign in to access your workspace
          </p>
        </div>

        {/* Form card */}
        <div
          className="overflow-hidden rounded-2xl bg-white/95
                        shadow-2xl backdrop-blur-sm"
        >
          <div className="p-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(onSubmit)(e);
              }}
              noValidate
              className={`space-y-5 ${shakeKey > 0 ? "shake" : ""}`}
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#2E2E38]"
                >
                  Email Address
                </label>
                <div className="group relative">
                  <Mail
                    className="absolute left-4 top-1/2 h-5 w-5
                                   -translate-y-1/2 text-gray-400
                                   transition-colors
                                   group-focus-within:text-[#2E2E38]"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="your.name@ey.com"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    className="w-full rounded-xl border-2 border-gray-200
                               bg-gray-50 py-3.5 pl-12 pr-4 text-sm
                               text-[#2E2E38] transition-all
                               placeholder:text-gray-400
                               focus:border-[#2E2E38] focus:bg-white
                               focus:outline-none
                               aria-invalid:border-red-400
                               aria-invalid:bg-red-50"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#2E2E38]"
                >
                  Password
                </label>
                <div className="group relative">
                  <Lock
                    className="absolute left-4 top-1/2 h-5 w-5
                                   -translate-y-1/2 text-gray-400
                                   transition-colors
                                   group-focus-within:text-[#2E2E38]"
                  />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    className="w-full rounded-xl border-2 border-gray-200
                               bg-gray-50 py-3.5 pl-12 pr-4 text-sm
                               text-[#2E2E38] transition-all
                               placeholder:text-gray-400
                               focus:border-[#2E2E38] focus:bg-white
                               focus:outline-none
                               aria-invalid:border-red-400
                               aria-invalid:bg-red-50"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* API error */}
              <div className="h-8 flex items-center mb-2">
                {formError && (
                  <div
                    className="flex items-center gap-2 animate-in fade-in
                    slide-in-from-top-1 duration-200"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <p className="text-sm text-red-600">{formError}</p>
                  </div>
                )}
              </div>
              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || login.isPending}
                className="group mt-2 flex w-full items-center justify-center
                           gap-2 rounded-xl bg-[#2E2E38] py-4 text-sm
                           font-semibold text-white shadow-lg transition-all
                           hover:bg-[#1a1a24] hover:shadow-xl
                           disabled:cursor-not-allowed disabled:opacity-50"
              >
                {login.isPending ? (
                  <>
                    <div
                      className="h-4 w-4 animate-spin rounded-full
                                    border-2 border-white/30
                                    border-t-white"
                    />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight
                      className="h-4 w-4 transition-transform
                                           group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Security note */}
            <div
              className="mt-6 flex items-center gap-2.5 rounded-lg
                            bg-gray-50 px-3 py-2.5"
            >
              <Shield
                className="h-4 w-4 shrink-0 text-[#FFE600]
                                  [filter:drop-shadow(0_0_6px_#FFE600)]"
              />
              <p className="text-xs text-gray-500">
                Access is managed by your EY administrator
              </p>
            </div>
          </div>

          {/* Card footer */}
          <div
            className="border-t border-gray-100 bg-gray-50/80
                          px-8 py-4"
          >
            <Link
              to="/"
              className="mx-auto flex w-fit items-center gap-1.5
                         text-sm text-gray-500 transition-colors
                         hover:text-[#2E2E38]"
            >
              ← Back to home
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-6 text-center text-xs text-gray-500">
          © 2026 Ernst & Young. All rights reserved.
        </p>
      </div>
    </div>
  );
}
