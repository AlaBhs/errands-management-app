import type { UserRole } from "./auth.enums";

// --- Types ---
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}