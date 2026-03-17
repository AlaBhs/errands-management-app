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

/**
 * Calculates and formats the duration between two dates.
 * Use for showing how long a request took to complete.
 * Example output: "2h 34m" | "45m" | "1d 3h"
 */
export function formatDuration(start: string | Date, end: string | Date): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();

  if (ms < 0) return '—';

  const totalMinutes = Math.floor(ms / 60000);
  const days    = Math.floor(totalMinutes / 1440);
  const hours   = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0)  return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}