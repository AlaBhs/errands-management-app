import type { RequestCategory } from '../../features/requests/types';

const categoryStyles: Record<RequestCategory, string> = {
  OfficeSupplies: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  ITEquipment:    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Travel:         "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  Facilities:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Other:          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const categoryLabels: Record<RequestCategory, string> = {
  OfficeSupplies: 'Office Supplies',
  ITEquipment:    'IT Equipment',
  Travel:         'Travel',
  Facilities:     'Facilities',
  Other:          'Other',
};

interface CategoryBadgeProps {
  category: RequestCategory;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryStyles[category]}`}>
      {categoryLabels[category]}
    </span>
  );
}