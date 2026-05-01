import type { PaginationParams } from "@/shared/api/types";

// ── Commands ──────────────────────────────────────────────────────────────────

export interface CreateUserPayload {
  fullName: string;
  email: string;
  role: string;
}

export interface SetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfilePayload {
  fullName: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface UserQueryParameters extends PaginationParams {
  role?: string;
  isActive?: boolean;
}