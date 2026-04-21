import { useQuery, useMutation } from "@tanstack/react-query";
import { messagesApi } from "../api/messages.api";
import type { RequestMessageDto } from "../types/messaging.types";

export const messageKeys = {
  thread: (requestId: string) => ["requestMessages", requestId] as const,
};

// ── Fetch thread ──────────────────────────────────────────────────────────────

export function useRequestMessages(requestId: string) {
  return useQuery<RequestMessageDto[]>({
    queryKey: messageKeys.thread(requestId),
    queryFn: () => messagesApi.getAll(requestId).then((r) => r.data),
    staleTime: 30_000,
  });
}

// ── Send message ──────────────────────────────────────────────────────────────

export function useSendMessage(requestId: string) {
  return useMutation({
    mutationFn: (content: string) =>
      messagesApi.send(requestId, { content }),
  });
}