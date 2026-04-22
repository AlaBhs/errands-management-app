import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import {
  useRequestMessages,
  useSendMessage,
} from "../hooks/useRequestMessages";
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
  const {
    data: messages = [],
    isLoading,
    isError,
    error,
  } = useRequestMessages(requestId);
  const { mutate: sendMessage, isPending: isSending } =
    useSendMessage(requestId);

  // Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : [];

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
  const is403 = isError && (error as { status?: number })?.status === 403;

  if (isAccessDenied || is403) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="rounded-xl border bg-card shadow-sm flex flex-col"
      style={{ height: "480px" }}
    >
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border shrink-0">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Messages
        </h3>
      </div>

      <div className="flex-1 min-h-0">
        <MessageList
          messages={safeMessages}
          currentUserId={user?.id ?? ""}
          isLoading={isLoading}
        />
      </div>

      <div className="shrink-0">
        <MessageInput
          onSend={(content) => sendMessage(content)}
          isSending={isSending}
        />
      </div>
    </div>
  );
}
