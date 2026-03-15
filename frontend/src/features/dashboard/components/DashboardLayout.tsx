import { Link } from 'react-router';
import { StatCard } from './StatCard';
import { StatusBadge } from '@/features/requests';
import { PageSpinner } from '@/shared/components/PageSpinner';
import type { RequestListItemDto } from '@/features/requests/types';

interface StatCardData {
  title: string;
  value: number | string;
  icon: React.ElementType;
  bg: string;
  color: string;
}

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  stats: StatCardData[];
  isLoading: boolean;
  items: RequestListItemDto[];
  viewAllLink: string;
  viewAllLabel: string;
  emptyMessage: string;
  emptyAction?: { label: string; to: string };
}

export function DashboardLayout({
  title,
  subtitle,
  stats,
  isLoading,
  items,
  viewAllLink,
  viewAllLabel,
  emptyMessage,
  emptyAction,
}: DashboardLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-[#2E2E38] mb-1">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg text-[#2E2E38]">Recent</h2>
          <Link
            to={viewAllLink}
            className="text-sm text-[#2E2E38] hover:text-[#FFE600] transition-colors"
          >
            {viewAllLabel} →
          </Link>
        </div>

        {isLoading ? (
          <div className="p-6"><PageSpinner /></div>
        ) : items.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 space-y-3">
            <p>{emptyMessage}</p>
            {emptyAction && (
              <Link
                to={emptyAction.to}
                className="inline-block text-sm text-primary hover:underline"
              >
                {emptyAction.label}
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  {['Title', 'Status', 'Priority', 'Deadline', ''].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {items.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-[200px] truncate">
                      {req.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {req.priority}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {req.deadline ? new Date(req.deadline).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        to={`/requests/${req.id}`}
                        className="text-[#2E2E38] hover:text-[#FFE600] font-medium transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}