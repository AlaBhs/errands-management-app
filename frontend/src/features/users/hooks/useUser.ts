import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import { userKeys } from './userKeys';

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}