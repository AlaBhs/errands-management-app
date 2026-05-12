import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { profileKeys } from "./profileKeys";
import { isApiError } from "@/shared/api/client";
import { toast } from "sonner";
import type {
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "../types";

export function useProfileMutations() {
  const queryClient = useQueryClient();

  const invalidateProfile = () =>
    queryClient.invalidateQueries({ queryKey: profileKeys.all });

  const updateProfile = useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      profileApi.updateProfile(payload),
    onSuccess: () => {
      invalidateProfile();
      toast.success("Profile updated successfully.");
    },
    onError: (err) =>
      toast.error(isApiError(err) ? err.message : "Failed to update profile."),
  });

  const changePassword = useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      profileApi.changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed successfully.");
    },
    onError: (err) =>
      toast.error(isApiError(err) ? err.message : "Failed to change password."),
  });

  const uploadPhoto = useMutation({
    mutationFn: (file: File) => profileApi.uploadPhoto(file),
    onSuccess: () => {
      invalidateProfile();
      toast.success("Profile photo updated.");
    },
    onError: (err) =>
      toast.error(isApiError(err) ? err.message : "Failed to upload photo."),
  });

  return { updateProfile, changePassword, uploadPhoto };
}