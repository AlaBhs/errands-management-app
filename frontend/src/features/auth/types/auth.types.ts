import type { UserRole } from "./auth.enums";

// --- Types ---
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}