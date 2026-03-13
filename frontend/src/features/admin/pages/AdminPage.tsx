import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users, LayoutGrid, ExternalLink } from 'lucide-react';
import { useUsers } from '@/features/users';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PageSpinner } from '@/shared/components/PageSpinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { isApiError } from '@/shared/api/client';

// ── Role badge ────────────────────────────────────────────────────────────────

const roleBadgeStyles: Record<string, string> = {
  Admin:        'bg-purple-100 text-purple-800',
  Collaborator: 'bg-blue-100 text-blue-800',
  Courier:      'bg-yellow-100 text-yellow-800',
};

function RoleBadge({ role }: { role: string }) {
  const style = roleBadgeStyles[role] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {role || '—'}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'categories'>('users');
  const currentUserId = useAuthStore((s) => s.user?.id);

  const { data, isLoading, isError, error } = useUsers({ page: 1, pageSize: 100 });

  const users = data?.items ?? [];
  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-[#2E2E38] mb-1">Admin Panel</h1>
          <p className="text-gray-600">Manage users and system settings</p>
        </div>
        <Link
          to="/admin/users"
          className="flex items-center gap-2 px-4 py-2 bg-[#2E2E38] text-white rounded-lg hover:bg-[#1a1a24] transition-colors text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Manage Users
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-2xl font-semibold text-[#2E2E38]">
            {isLoading ? '—' : data?.totalCount ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">Registered accounts</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-sm text-gray-600 mb-1">Active Users</p>
          <p className="text-2xl font-semibold text-[#2E2E38]">
            {isLoading ? '—' : activeCount}
          </p>
          <p className="text-xs text-green-600 mt-2">Currently active</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-5">
          <p className="text-sm text-gray-600 mb-1">Inactive Users</p>
          <p className="text-2xl font-semibold text-[#2E2E38]">
            {isLoading ? '—' : inactiveCount}
          </p>
          <p className="text-xs text-gray-500 mt-2">Deactivated accounts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-[#FFE600] text-[#2E2E38] font-medium'
                : 'border-transparent text-gray-600 hover:text-[#2E2E38]'
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-[#FFE600] text-[#2E2E38] font-medium'
                : 'border-transparent text-gray-600 hover:text-[#2E2E38]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Categories
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              soon
            </span>
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">

          {isLoading && <PageSpinner />}
          {isError && (
            <ErrorMessage message={isApiError(error) ? error.message : 'Failed to load users.'} />
          )}

          {data && (
            <>
              {/* Action bar */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium text-[#2E2E38]">{users.length}</span> users
                </p>
                <Link
                  to="/admin/users"
                  className="flex items-center gap-1.5 text-sm text-[#2E2E38] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Full user management
                </Link>
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-border">
                        {['Name', 'Email', 'Role', 'Status'].map((h) => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr
                            key={user.id}
                            className={`hover:bg-gray-50 transition-colors ${user.id === currentUserId ? 'bg-yellow-50/40' : ''}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#2E2E38] flex items-center justify-center text-white text-xs shrink-0">
                                  {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#2E2E38]">
                                    {user.fullName}
                                    {user.id === currentUserId && (
                                      <span className="ml-2 text-xs text-gray-400">(you)</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <RoleBadge role={user.role} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Categories Tab — coming soon */}
      {activeTab === 'categories' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LayoutGrid className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-base font-medium text-gray-700 mb-1">Categories coming soon</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            This section will allow you to manage request categories and filter collaborators by department.
          </p>
        </div>
      )}
    </div>
  );
}