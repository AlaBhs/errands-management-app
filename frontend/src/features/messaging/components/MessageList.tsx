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
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message whenever the list updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
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
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground py-8">
        No messages yet. Start the conversation.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1">
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          isOwn={msg.senderId === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

