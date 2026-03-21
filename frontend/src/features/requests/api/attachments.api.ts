import { apiClient } from "@/shared/api/client";
import type { AttachmentDto } from "../types/request.types";

export const attachmentsApi = {
  upload: async (
    requestId: string,
    file:      File,
  ): Promise<AttachmentDto> => {
    const form = new FormData();
    form.append("file", file);

    const { data } = await apiClient.post<{ data: AttachmentDto }>(
      `/requests/${requestId}/attachments`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },

  uploadDischargePhoto: async (
    requestId: string,
    file:      File,
  ): Promise<AttachmentDto> => {
    const form = new FormData();
    form.append("file", file);

    const { data } = await apiClient.post<{ data: AttachmentDto }>(
      `/requests/${requestId}/attachments/discharge`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },

  remove: async (
    requestId:    string,
    attachmentId: string,
  ): Promise<void> => {
    await apiClient.delete(
      `/requests/${requestId}/attachments/${attachmentId}`,
    );
  },
};