import type { RequestCategory } from '../types';

const categoryStyles: Record<RequestCategory, string> = {
  OfficeSupplies: 'bg-yellow-100 text-yellow-700',
  ITEquipment:    'bg-purple-100 text-purple-700',
  Travel:         'bg-sky-100 text-sky-700',
  Facilities:     'bg-green-100 text-green-700',
  Other:          'bg-gray-100 text-gray-600',
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

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryStyles[category]}`}>
      {categoryLabels[category]}
    </span>
  );
}