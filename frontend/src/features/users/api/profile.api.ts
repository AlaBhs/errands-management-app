import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type {
  ProfileDto,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "../types";

export const profileApi = {
  getProfile: (): Promise<ApiResponse<ProfileDto>> =>
    apiClient.get<ApiResponse<ProfileDto>>("/profile").then((r) => r.data),

  updateProfile: (payload: UpdateProfilePayload): Promise<void> =>
    apiClient.put("/profile", payload).then(() => undefined),

  changePassword: (payload: ChangePasswordPayload): Promise<void> =>
    apiClient.post("/profile/change-password", payload).then(() => undefined),

  uploadPhoto: (file: File): Promise<ApiResponse<{ photoUrl: string }>> => {
    const form = new FormData();
    form.append("file", file);
    return apiClient
      .post<ApiResponse<{ photoUrl: string }>>("/profile/upload-photo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};