import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestsApi } from '../api/requests.api';
import { requestKeys } from './requestKeys';
import { isApiError } from '@/shared/api/client';
import type {
  SetAdvancedAmountPayload,
  AddExpenseRecordPayload,
} from '../types';

function useInvalidateExpenses(requestId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: requestKeys.expenses(requestId) });
    queryClient.invalidateQueries({ queryKey: requestKeys.expenseSummary(requestId) });
    queryClient.invalidateQueries({ queryKey: requestKeys.detail(requestId) });
  };
}

export function useSetAdvancedAmount(requestId: string) {
  const invalidate = useInvalidateExpenses(requestId);
  return useMutation({
    mutationFn: (payload: SetAdvancedAmountPayload) =>
      requestsApi.setAdvancedAmount(requestId, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Advanced amount saved.');
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : 'Failed to set advanced amount.');
    },
  });
}

export function useAddExpense(requestId: string) {
  const invalidate = useInvalidateExpenses(requestId);
  return useMutation({
    mutationFn: (payload: AddExpenseRecordPayload) =>
      requestsApi.addExpense(requestId, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Expense added.');
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : 'Failed to add expense.');
    },
  });
}

export function useRemoveExpense(requestId: string) {
  const invalidate = useInvalidateExpenses(requestId);
  return useMutation({
    mutationFn: (expenseId: string) =>
      requestsApi.removeExpense(requestId, expenseId),
    onSuccess: () => {
      invalidate();
      toast.success('Expense removed.');
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : 'Failed to remove expense.');
    },
  });
}

export function useReconcileExpenses(requestId: string) {
  const invalidate = useInvalidateExpenses(requestId);
  return useMutation({
    mutationFn: () => requestsApi.reconcileExpenses(requestId),
    onSuccess: () => {
      invalidate();
      toast.success('Expenses marked as reconciled.');
    },
    onError: (err) => {
      toast.error(isApiError(err) ? err.message : 'Failed to reconcile.');
    },
  });
}