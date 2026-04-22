import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageItem } from "./MessageItem";
import { cn } from "@/shared/utils/utils";
import type { RequestMessageDto } from "../types/messaging.types";

interface MessageListProps {
  messages: RequestMessageDto[];
  currentUserId: string;
  isLoading: boolean;
}

export function MessageList({ messages, currentUserId, isLoading }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Scroll the container itself — never the page
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4 h-full overflow-y-auto">
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-10 rounded-2xl", i % 2 === 0 ? "w-2/3" : "w-1/2 ml-auto")}
          />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No messages yet. Start the conversation.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-3 p-4 h-full overflow-y-auto">
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          isOwn={msg.senderId === currentUserId}
        />
      ))}
    </div>
  );
}