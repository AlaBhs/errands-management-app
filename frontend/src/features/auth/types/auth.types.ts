import type { UserRole } from "./auth.enums";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}