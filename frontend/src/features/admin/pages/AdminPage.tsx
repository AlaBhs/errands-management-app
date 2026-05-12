import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users, LayoutGrid, ExternalLink } from 'lucide-react';
import { useUsers } from '@/features/users';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PageSpinner } from '@/shared/components/PageSpinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { isApiError } from '@/shared/api/client';
import { cn } from '@/shared/utils/utils';

// ── Role badge ────────────────────────────────────────────────────────────────

const roleBadgeStyles: Record<string, string> = {
  Admin:        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Collaborator: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Courier:      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
};

function RoleBadge({ role }: { role: string }) {
  const style = roleBadgeStyles[role] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
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
          <h1 className="text-2xl text-foreground mb-1">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users and system settings</p>
        </div>
        <Link
          to="/admin/users"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Manage Users
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-sm text-muted-foreground mb-1">Total Users</p>
          <p className="text-2xl font-semibold text-foreground">
            {isLoading ? '—' : data?.totalCount ?? 0}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Registered accounts</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-sm text-muted-foreground mb-1">Active Users</p>
          <p className="text-2xl font-semibold text-foreground">
            {isLoading ? '—' : activeCount}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">Currently active</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-sm text-muted-foreground mb-1">Inactive Users</p>
          <p className="text-2xl font-semibold text-foreground">
            {isLoading ? '—' : inactiveCount}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Deactivated accounts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-[#FFE600] text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-[#FFE600] text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Categories
            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
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
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{users.length}</span> users
                </p>
                <Link
                  to="/admin/users"
                  className="flex items-center gap-1.5 text-sm text-foreground hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Full user management
                </Link>
              </div>

              {/* Table */}
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        {['Name', 'Email', 'Role', 'Status'].map((h) => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                       </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr
                            key={user.id}
                            className={cn(
                              "hover:bg-muted/40 transition-colors",
                              user.id === currentUserId && "bg-yellow-50/40 dark:bg-yellow-900/20"
                            )}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs shrink-0">
                                  {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {user.fullName}
                                    {user.id === currentUserId && (
                                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <RoleBadge role={user.role} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                user.isActive
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              )}>
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
          <LayoutGrid className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-base font-medium text-foreground mb-1">Categories coming soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This section will allow you to manage request categories and filter collaborators by department.
          </p>
        </div>
      )}
    </div>
  );
}