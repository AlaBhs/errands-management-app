import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import { userKeys } from './userKeys';
import type { UserQueryParameters } from '../types';

export function useUsers(params?: UserQueryParameters) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getAll(params),
    select: (res) => res.data,
  });
}