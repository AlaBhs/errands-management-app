import type { RequestStatus } from "../../features/requests/types";

const statusStyles: Record<RequestStatus, string> = {
  Pending:    "bg-yellow-100 text-yellow-800",
  Assigned:   "bg-blue-100 text-blue-800",
  InProgress: "bg-purple-100 text-purple-800",
  Completed:  "bg-green-100 text-green-800",
  Cancelled:  "bg-gray-100 text-gray-600",
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