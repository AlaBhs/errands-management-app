/**
 * Formats a date with full day/month/year and hour:minute.
 * Use when two events can happen on the same day — audit logs, assignments, etc.
 * Example output: 15/03/2026, 14:32
 */
export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a date with day/month/year only.
 * Use for deadlines, birthdays, or any date where time is irrelevant.
 * Example output: 15/03/2026
 */
export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}