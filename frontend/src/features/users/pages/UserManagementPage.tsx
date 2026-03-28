import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserMinus, UserCheck, Search } from "lucide-react";
import { useUsers, useUserMutations } from "@/features/users";
import { useAuthStore } from "@/features/auth";
import { isApiError } from "@/shared/api/client";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/features/auth";
import { cn } from "@/shared/utils/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Schema ────────────────────────────────────────────────────────────────────

const createUserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one digit")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  role: z.enum([UserRole.Collaborator, UserRole.Courier]),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const PAGE_SIZE = 10;

// ── Page ──────────────────────────────────────────────────────────────────────

export function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Confirm modal state
  const [deactivateTarget, setDeactivateTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [activateTarget, setActivateTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const currentUserId = useAuthStore((s) => s.user?.id);
  const { create, deactivate, activate } = useUserMutations();

  const { data, isLoading, isError, error } = useUsers({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
    isActive: statusFilter === "all" ? undefined : statusFilter === "true",
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: UserRole.Collaborator },
  });

  const onCreateUser = handleSubmit((values) => {
    create.mutate(values, { onSuccess: () => reset() });
  });

  const handleDeactivateConfirm = () => {
    if (!deactivateTarget) return;
    deactivate.mutate(
      { id: deactivateTarget.id, email: "" },
      { onSuccess: () => setDeactivateTarget(null) },
    );
  };

  const handleActivateConfirm = () => {
    if (!activateTarget) return;
    activate.mutate(
      { id: activateTarget.id, email: "" },
      { onSuccess: () => setActivateTarget(null) },
    );
  };

  return (
    <div className="space-y-8">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          User Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage system users and their access.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ── User list ─────────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filters toolbar */}
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-2
                          rounded-xl border bg-card px-4 py-3 shadow-sm"
          >
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4
                                 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border bg-background py-1.5
                           pl-9 pr-3 text-sm focus:outline-none
                           focus:ring-2 focus:ring-ring transition-colors
                           hover:border-ring placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Role</span>
              <Select
                value={roleFilter}
                onValueChange={(val) => {
                  setRoleFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[130px] h-8 text-xs !rounded-lg">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value={UserRole.Admin}>Admin</SelectItem>
                  <SelectItem value={UserRole.Collaborator}>
                    Collaborator
                  </SelectItem>
                  <SelectItem value={UserRole.Courier}>Courier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status</span>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[110px] h-8 text-xs !rounded-lg">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error */}
          {isError && (
            <ErrorMessage
              message={
                isApiError(error) ? error.message : "Something went wrong."
              }
            />
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  {["Full Name", "Email", "Role", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium
                                   text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data?.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm
                                   text-muted-foreground"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  data?.items.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        {user.fullName}
                        {user.id === currentUserId && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-4 py-3.5">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5",
                            "text-xs font-medium",
                            user.isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                          )}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {user.isActive ? (
                          <button
                            onClick={() =>
                              setDeactivateTarget({
                                id: user.id,
                                name: user.fullName,
                              })
                            }
                            disabled={user.id === currentUserId}
                            className="inline-flex items-center gap-1
                                       text-xs text-red-500 hover:text-red-700
                                       dark:text-red-400 dark:hover:text-red-300
                                       disabled:opacity-40
                                       disabled:cursor-not-allowed
                                       transition-colors"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setActivateTarget({
                                id: user.id,
                                name: user.fullName,
                              })
                            }
                            className="inline-flex items-center gap-1
                                       text-xs text-emerald-600
                                       hover:text-emerald-800
                                       dark:text-emerald-400 dark:hover:text-emerald-300
                                       transition-colors"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
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
          {data && (
            <div
              className="flex items-center justify-between
                            text-sm text-muted-foreground"
            >
              <span>
                {data.totalCount === 0
                  ? "No results"
                  : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                      page * PAGE_SIZE,
                      data.totalCount,
                    )} of ${data.totalCount}`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border px-3 py-1.5 text-xs
                             font-medium transition-colors hover:bg-accent
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * PAGE_SIZE >= data.totalCount}
                  className="rounded-lg border px-3 py-1.5 text-xs
                             font-medium transition-colors hover:bg-accent
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Create user form ──────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            Create User
          </h2>
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            {[
              {
                label: "Full Name",
                name: "fullName" as const,
                type: "text",
                placeholder: "Jane Doe",
              },
              {
                label: "Email",
                name: "email" as const,
                type: "email",
                placeholder: "jane@ey.com",
              },
              {
                label: "Password",
                name: "password" as const,
                type: "password",
                placeholder: "Min 8 chars…",
              },
            ].map((field) => (
              <div key={field.name}>
                <label
                  className="block text-xs font-medium
                                  text-muted-foreground mb-1.5"
                >
                  {field.label}
                </label>
                <input
                  {...register(field.name)}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-border
                             bg-background px-3 py-2.5 text-sm text-foreground
                             focus:border-ring focus:outline-none
                             focus:ring-2 focus:ring-ring transition-colors"
                />
                {errors[field.name] && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Role
              </label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full !rounded-lg">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.Collaborator}>
                        Collaborator
                      </SelectItem>
                      <SelectItem value={UserRole.Courier}>Courier</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {create.isError && (
              <ErrorMessage
                message={
                  isApiError(create.error)
                    ? create.error.message
                    : "Failed to create user."
                }
              />
            )}

            <button
              onClick={onCreateUser}
              disabled={create.isPending}
              className="w-full rounded-xl bg-primary px-4 py-2.5
                         text-sm font-semibold text-primary-foreground
                         hover:bg-primary/90 disabled:opacity-50
                         transition-colors"
            >
              {create.isPending ? "Creating…" : "Create User"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Deactivate confirm modal ───────────────────────────────── */}
      {deactivateTarget && (
        <ConfirmModal
          title="Deactivate User"
          description={`${deactivateTarget.name} will lose access to the system immediately. You can reactivate them at any time.`}
          confirmLabel="Deactivate"
          isPending={deactivate.isPending}
          icon={<UserMinus className="h-5 w-5 text-red-600" />}
          onConfirm={handleDeactivateConfirm}
          onClose={() => setDeactivateTarget(null)}
        />
      )}

      {/* ── Activate confirm modal ────────────────────────────────── */}
      {activateTarget && (
        <ConfirmModal
          title="Activate User"
          description={`${activateTarget.name} will regain full access to the system based on their role.`}
          confirmLabel="Activate"
          confirmClass="bg-emerald-600 hover:bg-emerald-700 text-white"
          isPending={activate.isPending}
          icon={<UserCheck className="h-5 w-5 text-emerald-600" />}
          onConfirm={handleActivateConfirm}
          onClose={() => setActivateTarget(null)}
        />
      )}
    </div>
  );
}

// ── RoleBadge ─────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    Admin:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    Collaborator:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Courier:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        colors[role] ??
          "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      )}
    >
      {role}
    </span>
  );
}
