import { apiClient } from "@/shared/api/client";
import type { ApiResponse } from "@/shared/api/types";
import type { RequestMessageDto, SendMessagePayload } from "../types/messaging.types";

export const messagesApi = {
  getAll: async (requestId: string): Promise<RequestMessageDto[]> => {
    const { data } = await apiClient.get<ApiResponse<RequestMessageDto[]>>(
      `/requests/${requestId}/messages`,
    );
    return data.data;
  },

  send: async (
    requestId: string,
    payload: SendMessagePayload,
  ): Promise<void> => {
    await apiClient.post(`/requests/${requestId}/messages`, payload);
  },
};