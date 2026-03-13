import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useUsers, useUserMutations } from '../hooks';
import { useAuthStore } from '@/features/auth/store/authStore';
import { UserRole } from '@/features/auth/types/auth.enums';
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

// ── Create user form schema ───────────────────────────────────────────────────

const createUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(50),
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum([UserRole.Collaborator, UserRole.Courier], {
    message: 'Please select a role',
  }),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

// ── Role filter options ───────────────────────────────────────────────────────

const roleOptions = [
  { label: 'All roles', value: '' },
  { label: 'Admin', value: UserRole.Admin },
  { label: 'Collaborator', value: UserRole.Collaborator },
  { label: 'Courier', value: UserRole.Courier },
];

// ── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const currentUserId = useAuthStore((s) => s.user?.id);
  const { create, deactivate } = useUserMutations();

  const { data, isLoading, isError, error } = useUsers({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    role: roleFilter || undefined,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
  });

  const resetPage = () => setPage(1);

  const onCreateSubmit = (values: CreateUserFormValues) => {
    create.mutate(values, {
      onSuccess: () => {
        toast.success(`User ${values.email} created successfully.`);
        reset();
      },
      onError: (err) => {
        toast.error(isApiError(err) ? err.message : 'Failed to create user.');
      },
    });
  };

  const handleDeactivate = (id: string, email: string) => {
    deactivate.mutate(id, {
      onSuccess: () => toast.success(`${email} has been deactivated.`),
      onError: (err) => {
        toast.error(isApiError(err) ? err.message : 'Failed to deactivate user.');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#2E2E38]">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users and their access roles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── Left: user table ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="flex-1 min-w-[200px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
            />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); resetPage(); }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
            >
              {roleOptions.map((opt) => (
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
                          <td className="px-4 py-3 font-medium text-gray-900">{user.fullName}</td>
                          <td className="px-4 py-3 text-gray-500">{user.email}</td>
                          <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeactivate(user.id, user.email)}
                              disabled={
                                !user.isActive ||
                                user.id === currentUserId ||
                                deactivate.isPending
                              }
                              className="text-xs text-red-600 hover:text-red-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Deactivate
                            </button>
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

        {/* ── Right: create user form ───────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-[#2E2E38]">Create User</h2>
            <p className="text-xs text-gray-500 mt-0.5">Admins cannot be created from here.</p>
          </div>

          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#2E2E38] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...register('fullName')}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#2E2E38] mb-1">
                Email *
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="jane@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#2E2E38] mb-1">
                Password *
              </label>
              <input
                type="password"
                {...register('password')}
                placeholder="Min. 8 chars, uppercase, digit, special"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-[#2E2E38] mb-1">
                Role *
              </label>
              <select
                {...register('role')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2E2E38]"
              >
                <option value="">Select a role...</option>
                <option value={UserRole.Collaborator}>Collaborator</option>
                <option value={UserRole.Courier}>Courier</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={create.isPending}
              className="w-full px-4 py-2 bg-[#2E2E38] text-white rounded-md text-sm font-medium hover:bg-[#1a1a24] transition-colors disabled:opacity-50"
            >
              {create.isPending ? 'Creating...' : 'Create User'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}