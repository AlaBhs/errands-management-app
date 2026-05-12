// ── Response DTOs ─────────────────────────────────────────────────────────────

export interface UserListItemDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProfileDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  profilePhotoUrl: string | null;
  createdAt: string;
}