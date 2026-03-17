import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUsers, useUserMutations } from '@/features/users';
import { useAuthStore } from '@/features/auth';
import { isApiError } from '@/shared/api/client';
import { PageSpinner } from '@/shared/components/PageSpinner';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { UserRole } from '@/features/auth';

// ── Zod schema ───────────────────────────────────────────────────────────────

const createUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum([UserRole.Collaborator, UserRole.Courier]),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

// ── Status filter options ─────────────────────────────────────────────────────

const statusOptions = [
  { label: 'All users',    value: '' },
  { label: 'Active only',  value: 'true' },
  { label: 'Inactive only', value: 'false' },
];

const PAGE_SIZE = 10;

// ── Page ─────────────────────────────────────────────────────────────────────

export function UserManagementPage() {
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const currentUserId = useAuthStore((s) => s.user?.id);
  const { create, deactivate, activate } = useUserMutations();

  const { data, isLoading, isError, error } = useUsers({
    page,
    pageSize: PAGE_SIZE,
    search:   search || undefined,
    role:     roleFilter || undefined,
    isActive: statusFilter === '' ? undefined : statusFilter === 'true',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: UserRole.Collaborator },
  });

  const resetPage = () => setPage(1);

const onCreateUser = handleSubmit((values) => {
  create.mutate(values, {
    onSuccess: () => reset(),
  });
});

  const isMutating = deactivate.isPending || activate.isPending;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage system users and their access.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ── User list ───────────────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="flex-1 min-w-[200px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); resetPage(); }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All roles</option>
              <option value={UserRole.Admin}>Admin</option>
              <option value={UserRole.Collaborator}>Collaborator</option>
              <option value={UserRole.Courier}>Courier</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* States */}
          {isLoading && <PageSpinner />}
          {isError && (
            <ErrorMessage message={isApiError(error) ? error.message : 'Something went wrong.'} />
          )}

          {/* Table */}
          {data && (
            <>
              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Full Name', 'Email', 'Role', 'Status', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {data.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      data.items.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {user.fullName}
                            {user.id === currentUserId && (
                              <span className="ml-2 text-xs text-gray-400">(you)</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{user.email}</td>
                          <td className="px-4 py-3">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {user.isActive ? (
                              <button
                                onClick={() => deactivate.mutate({ id: user.id, email: user.email })}
                                disabled={user.id === currentUserId || isMutating}
                                className="text-xs text-red-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => activate.mutate({ id: user.id, email: user.email })}
                                disabled={isMutating}
                                className="text-xs text-green-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Activate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  Showing {data.totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, data.totalCount)} of {data.totalCount}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded border px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * PAGE_SIZE >= data.totalCount}
                    className="rounded border px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Create user form ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Create User</h2>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                {...register('fullName')}
                placeholder="Jane Doe"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="jane@example.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 digit, 1 special"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                {...register('role')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={UserRole.Collaborator}>Collaborator</option>
                <option value={UserRole.Courier}>Courier</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
              )}
            </div>

            <button
              onClick={onCreateUser}
              disabled={isSubmitting || create.isPending}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {create.isPending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    Admin:        'bg-purple-100 text-purple-700',
    Collaborator: 'bg-blue-100 text-blue-700',
    Courier:      'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
      colors[role] ?? 'bg-gray-100 text-gray-600'
    }`}>
      {role}
    </span>
  );
}