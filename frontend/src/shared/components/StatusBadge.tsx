import type { RequestStatus } from "../../features/requests/types";

const statusStyles: Record<RequestStatus, string> = {
  Pending:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Assigned:   "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  InProgress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Completed:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Cancelled:  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

interface StatusBadgeProps {
  status: RequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
}