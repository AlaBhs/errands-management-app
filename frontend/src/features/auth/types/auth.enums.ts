// --- Enums ---
export const UserRole = {
  Admin: 'Admin',
  Collaborator: 'Collaborator',
  Courier: 'Courier',
  Reception:   'Reception',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];