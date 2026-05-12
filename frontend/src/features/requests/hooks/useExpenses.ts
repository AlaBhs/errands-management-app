import { useQuery } from '@tanstack/react-query';
import { requestsApi } from '../api/requests.api';
import { requestKeys } from './requestKeys';

export function useExpenses(requestId: string) {
  return useQuery({
    queryKey: requestKeys.expenses(requestId),
    queryFn: () => requestsApi.getExpenses(requestId),
    select: (res) => res.data,
    enabled: !!requestId,
  });
}

export function useExpenseSummary(requestId: string) {
  return useQuery({
    queryKey: requestKeys.expenseSummary(requestId),
    queryFn: () => requestsApi.getExpenseSummary(requestId),
    select: (res) => res.data,
    enabled: !!requestId,
  });
}