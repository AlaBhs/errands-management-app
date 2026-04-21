import { apiClient } from "@/shared/api/client";
import type { RequestMessageDto, SendMessagePayload } from "../types/messaging.types";

export const messagesApi = {
  getAll: (requestId: string) =>
    apiClient.get<RequestMessageDto[]>(`/requests/${requestId}/messages`),

  send: (requestId: string, payload: SendMessagePayload) =>
    apiClient.post<void>(`/requests/${requestId}/messages`, payload),
};