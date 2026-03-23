import type { PriorityLevel } from '../../features/requests/types';

const priorityStyles: Record<PriorityLevel, string> = {
  Low:    'bg-gray-100 text-gray-600',
  Normal: 'bg-blue-100 text-blue-700',
  High:   'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

interface PriorityBadgeProps {
  priority: PriorityLevel;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityStyles[priority]}`}>
      {priority} Priority
    </span>
  );
}