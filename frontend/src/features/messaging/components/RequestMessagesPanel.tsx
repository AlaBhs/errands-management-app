import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useRequestMessages, useSendMessage } from "../hooks/useRequestMessages";
import { useMessagingStore } from "../store/messagingStore";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

interface RequestMessagesPanelProps {
  requestId: string;
}

export function RequestMessagesPanel({ requestId }: RequestMessagesPanelProps) {
  const queryClient = useQueryClient();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  // ── SignalR ───────────────────────────────────────────────────────────────
  const { startConnection, joinRequest, leaveRequest } = useMessagingStore();
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  // ── Server state ──────────────────────────────────────────────────────────
  const { data: messages = [], isLoading, isError, error } = useRequestMessages(requestId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(requestId);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken || !user) return;

    const tokenFactory = () => accessToken;

    async function initMessaging() {
      try {
        // Start connection lazily — safe to call if already connected
        await startConnection(tokenFactory, queryClient);
        // Join the specific request's SignalR group
        await joinRequest(requestId);
      } catch {
        // HubException or network error → hide the panel
        setIsAccessDenied(true);
      }
    }

    initMessaging();

    return () => {
      // Leave group on unmount (navigate away / tab switch)
      leaveRequest(requestId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  // ── Handle 403 from REST layer ────────────────────────────────────────────
  const is403 =
    isError &&
    (error as { status?: number })?.status === 403;

  if (isAccessDenied || is403) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border bg-card shadow-sm flex flex-col h-[480px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Messages
        </h3>
      </div>

      {/* Message list */}
      <MessageList
        messages={messages}
        currentUserId={user?.id ?? ""}
        isLoading={isLoading}
      />

      {/* Input */}
      <MessageInput
        onSend={(content) => sendMessage(content)}
        isSending={isSending}
      />
    </div>
  );
}