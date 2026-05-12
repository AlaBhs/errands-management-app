import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, Camera, Loader2 } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { useProfileMutations } from "../hooks/useProfileMutations";
import { isApiError } from "@/shared/api/client";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { Skeleton } from "@/components/ui/skeleton";
import type { UpdateProfilePayload, ChangePasswordPayload } from "../types";

// ── Schemas ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(50),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
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

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { data: profile, isLoading, isError, error } = useProfile();
  const { updateProfile, changePassword, uploadPhoto } = useProfileMutations();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // ── Profile form ──────────────────────────────────────────────────────────

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: { fullName: profile?.fullName ?? "" },
  });

  const onUpdateProfile = profileForm.handleSubmit((values: UpdateProfilePayload) => {
    updateProfile.mutate(values);
  });

  // ── Password form ─────────────────────────────────────────────────────────

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onChangePassword = passwordForm.handleSubmit((values: ChangePasswordPayload) => {
    changePassword.mutate(values, {
      onSuccess: () => passwordForm.reset(),
    });
  });

  // ── Photo upload ──────────────────────────────────────────────────────────

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    uploadPhoto.mutate(file, {
      onError: () => setPhotoPreview(null),
    });
  };

  // ── Loading skeleton (updated to match new layout) ────────────────────────
  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            {/* Right column skeleton */}
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <ErrorMessage
            message={isApiError(error) ? error.message : "Failed to load profile."}
          />
        </div>
      </div>
    );
  }

  const photoUrl = photoPreview ?? profile?.profilePhotoUrl ?? null;
  const initials = profile?.fullName
    ? profile.fullName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal information and account security.
          </p>
        </div>

        {/* Two‑column layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column: Photo + Personal Info */}
          <div className="space-y-6">
            {/* Photo card */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold text-foreground mb-4">
                Profile Photo
              </h2>
              <div className="flex items-center gap-5">
                <div className="relative">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={profile?.fullName}
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--ey-dark)] text-xl font-bold text-[var(--ey-yellow)]">
                      {initials}
                    </div>
                  )}
                  {uploadPhoto.isPending && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadPhoto.isPending}
                    className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4" />
                    {uploadPhoto.isPending ? "Uploading…" : "Change photo"}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or WebP · Max 5 MB
                  </p>
                </div>
              </div>
            </div>

            {/* Personal info card */}
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Personal Information
              </h2>

              {/* Read-only fields - now full width */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Email", value: profile?.email },
                  { label: "Role", value: profile?.role },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {label}
                    </label>
                    <p className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Editable full name */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  {...profileForm.register("fullName")}
                  type="text"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
                {profileForm.formState.errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">
                    {profileForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              {updateProfile.isError && (
                <ErrorMessage
                  message={
                    isApiError(updateProfile.error)
                      ? updateProfile.error.message
                      : "Failed to update profile."
                  }
                />
              )}

              <button
                onClick={onUpdateProfile}
                disabled={updateProfile.isPending}
                className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>

          {/* Right column: Change password */}
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4 h-fit">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Change Password
            </h2>

            {[
              {
                name: "currentPassword" as const,
                label: "Current Password",
                placeholder: "Enter current password",
              },
              {
                name: "newPassword" as const,
                label: "New Password",
                placeholder: "Min 8 characters…",
              },
              {
                name: "confirmPassword" as const,
                label: "Confirm New Password",
                placeholder: "Repeat new password",
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {field.label}
                </label>
                <input
                  {...passwordForm.register(field.name)}
                  type="password"
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
                {passwordForm.formState.errors[field.name] && (
                  <p className="mt-1 text-xs text-red-500">
                    {passwordForm.formState.errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}

            {changePassword.isError && (
              <ErrorMessage
                message={
                  isApiError(changePassword.error)
                    ? changePassword.error.message
                    : "Failed to change password."
                }
              />
            )}

            <button
              onClick={onChangePassword}
              disabled={changePassword.isPending}
              className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {changePassword.isPending ? "Updating…" : "Update password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}