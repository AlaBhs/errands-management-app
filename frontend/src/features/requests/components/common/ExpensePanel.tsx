import { useState } from 'react';
import { Trash2, Plus, Loader2, CheckCircle2, Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/utils/utils';
import { formatDateTime } from '@/shared/utils/date';
import { ExpenseCategory } from '../../types/request.enums';
import type { ExpenseSummaryDto } from '../../types';
import {
  useExpenses,
  useSetAdvancedAmount,
  useAddExpense,
  useRemoveExpense,
  useReconcileExpenses,
} from '../../hooks';

interface ExpensePanelProps {
  requestId: string;
  status: string;
  expenseSummary?: ExpenseSummaryDto;
}

const CATEGORY_LABELS: Record<string, string> = {
  Transport: 'Transport',
  Purchase:  'Purchase',
  Other:     'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  Transport: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
  Purchase:  'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300',
  Other:     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function ExpensePanel({ requestId, status, expenseSummary }: ExpensePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: expenses, isLoading: expensesLoading } = useExpenses(requestId);

  const setAdvanced   = useSetAdvancedAmount(requestId);
  const addExpense    = useAddExpense(requestId);
  const removeExpense = useRemoveExpense(requestId);
  const reconcile     = useReconcileExpenses(requestId);

  // Advanced amount form state
  const [advancedInput, setAdvancedInput] = useState('');

  // Add expense form state
  const [category, setCategory]     = useState<string>(ExpenseCategory.Transport);
  const [amount, setAmount]         = useState('');
  const [description, setDescription] = useState('');

  const isCancelled     = status === 'Cancelled';
  const advancedIsSet   = expenseSummary?.advancedAmount != null;
  const isReconciled    = expenseSummary?.isReconciled ?? false;
  const canAddExpenses  = !isCancelled;
  const canReconcile    = advancedIsSet && !isReconciled && !isCancelled;

  const difference = expenseSummary?.difference;

  function handleSetAdvanced() {
    const parsed = parseFloat(advancedInput);
    if (isNaN(parsed) || parsed < 0) return;
    setAdvanced.mutate({ amount: parsed }, {
      onSuccess: () => setAdvancedInput(''),
    });
  }

  function handleAddExpense() {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 0) return;
    addExpense.mutate(
      {
        category: category as ExpenseCategory,
        amount: parsed,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setAmount('');
          setDescription('');
        },
      },
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* ── Header ───────────────────── */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between border-b border-border bg-muted/30 px-5 py-3 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Finances
          </h3>
          {isReconciled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3" />
              Reconciled
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* ── Collapsible content ─────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="p-5 space-y-5">
          {/* ── 1. Advanced Amount ────────────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Cash Advanced to Courier
            </p>

            {advancedIsSet ? (
              <div className="rounded-lg bg-muted/40 dark:bg-muted/20 px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Advanced</span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {expenseSummary!.advancedAmount!.toFixed(2)} TND
                </span>
              </div>
            ) : status === 'Assigned' ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={advancedInput}
                  onChange={(e) => setAdvancedInput(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 rounded-md border border-border bg-background dark:bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors "
                />
                <Button
                  size="sm"
                  onClick={handleSetAdvanced}
                  disabled={!advancedInput || setAdvanced.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {setAdvanced.isPending
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : 'Set'
                  }
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Advanced amount can only be set while the request is Assigned.
              </p>
            )}
          </div>

          {/* ── Divider ───────────────────────────────────────────────── */}
          <div className="border-t border-border" />

          {/* ── 2. Expense Entries ────────────────────────────────────── */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              Expense Records
            </p>

            {/* List */}
            {expensesLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : expenses && expenses.length > 0 ? (
              <ul className="space-y-2">
                {expenses.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2"
                  >
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                        CATEGORY_COLORS[e.category] ?? CATEGORY_COLORS.Other,
                      )}
                    >
                      {CATEGORY_LABELS[e.category] ?? e.category}
                    </span>

                    <span className="flex-1 min-w-0 text-xs text-muted-foreground truncate">
                      {e.description ?? formatDateTime(e.createdAt)}
                    </span>

                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {e.amount.toFixed(2)} TND
                    </span>

                    {!isReconciled && !isCancelled && (
                      <button
                        onClick={() => removeExpense.mutate(e.id)}
                        disabled={removeExpense.isPending}
                        className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No expenses recorded yet.
              </p>
            )}

            {/* Add form */}
            {canAddExpenses && !isReconciled && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  {/* Category */}
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="col-span-1 rounded-md border border-border bg-background dark:bg-card px-2 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                  >
                    {Object.values(ExpenseCategory).map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>

                  {/* Amount */}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="col-span-2 rounded-md border border-border bg-background dark:bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full rounded-md border border-border bg-background dark:bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                />

                <Button
                  size="sm"
                  onClick={handleAddExpense}
                  disabled={!amount || addExpense.isPending}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white dark:bg-slate-600 dark:hover:bg-slate-500"
                >
                  {addExpense.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Add Expense
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* ── Divider ───────────────────────────────────────────────── */}
          <div className="border-t border-border" />

          {/* ── 3. Summary ────────────────────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Summary</p>

            <div className="space-y-1.5">
              {advancedIsSet && (
                <SummaryRow
                  label="Advanced"
                  value={`${expenseSummary!.advancedAmount!.toFixed(2)} TND`}
                />
              )}
              <SummaryRow
                label="Total Expenses"
                value={`${(expenseSummary?.totalExpenses ?? 0).toFixed(2)} TND`}
              />

              {difference != null && (
                <div className="flex items-center justify-between rounded-lg px-3 py-2 mt-1
                  bg-muted/40 dark:bg-muted/20 border border-border">
                  <span className="text-xs font-medium text-muted-foreground">
                    Difference
                  </span>
                  <span
                    className={cn(
                      'text-sm font-bold tabular-nums',
                      difference > 0
                        ? 'text-amber-600 dark:text-amber-400'  // org owes courier
                        : difference < 0
                          ? 'text-emerald-600 dark:text-emerald-400' // courier returns
                          : 'text-foreground',
                    )}
                  >
                    {difference > 0 ? '+' : ''}{difference.toFixed(2)} TND
                  </span>
                </div>
              )}

              {difference != null && difference !== 0 && (
                <p className="text-xs text-muted-foreground text-right">
                  {difference > 0
                    ? 'Organisation owes the courier'
                    : 'Courier returns money'}
                </p>
              )}
            </div>
          </div>

          {/* ── 4. Reconcile ──────────────────────────────────────────── */}
          {canReconcile && (
            <Button
              onClick={() => reconcile.mutate()}
              disabled={reconcile.isPending}
              variant="outline"
              className="w-full border-emerald-300 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              {reconcile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Reconciled
                </>
              )}
            </Button>
          )}

          {isReconciled && expenseSummary?.reconciledAt && (
            <p className="text-center text-xs text-muted-foreground">
              Reconciled on {formatDateTime(expenseSummary.reconciledAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}