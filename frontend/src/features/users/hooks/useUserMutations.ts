import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/auth.api';
import { usersApi } from '../api/users.api';
import { userKeys } from './userKeys';
import type { CreateUserPayload } from '../types';
import type { UserRole } from '@/features/auth';

export function useUserMutations() {
  const queryClient = useQueryClient();

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: userKeys.all });

  const create = useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      authApi.register({
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        role: payload.role as UserRole,
      }),
    onSuccess: invalidateUsers,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: invalidateUsers,
  });

  const activate = useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: invalidateUsers,
  });

  return { create, deactivate, activate };
}