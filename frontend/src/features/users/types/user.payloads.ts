import type { PaginationParams } from '@/shared/api/types';

// --- Command Payloads ---

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

// --- Query Params ---

export interface UserQueryParameters extends PaginationParams {
  role?: string;
}