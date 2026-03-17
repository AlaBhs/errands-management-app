import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { usersApi } from "../api/users.api";
import { userKeys } from "./userKeys";
import type { CreateUserPayload } from "../types";
import type { UserRole } from "@/features/auth";
import { isApiError } from "@/shared/api/client";
import { toast } from "sonner";

export function useUserMutations() {
  const queryClient = useQueryClient();

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: userKeys.all });

  const create = useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      authApi.register({
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        role: payload.role as UserRole,
      }),
    onSuccess: (_, { email }) => {
      invalidateUsers();
      toast.success(`User ${email} created successfully.`);
    },
    onError: (err) =>
      toast.error(isApiError(err) ? err.message : "Failed to create user."),
  });

  const deactivate = useMutation({
    mutationFn: ({ id }: { id: string; email: string }) =>
      usersApi.deactivate(id),
    onSuccess: (_, { email }) => {
      invalidateUsers();
      toast.success(`${email} has been deactivated.`);
    },
    onError: (err) =>
      toast.error(isApiError(err) ? err.message : "Failed to deactivate user."),
  });

  const activate = useMutation({
    mutationFn: ({ id }: { id: string; email: string }) =>
      usersApi.activate(id),
    onSuccess: (_, { email }) => {
      invalidateUsers();
      toast.success(`${email} has been activated.`);
    },
    onError: (err) =>
      toast.error(isApiError(err) ? err.message : "Failed to activate user."),
  });

  return { create, deactivate, activate };
}
