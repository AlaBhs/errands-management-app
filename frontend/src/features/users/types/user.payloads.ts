import type { PaginationParams } from "@/shared/api/types";

// --- Command Payloads ---

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
}

// --- Query Params ---

export interface UserQueryParameters extends PaginationParams {
  role?: string;
  isActive?: boolean;
}
