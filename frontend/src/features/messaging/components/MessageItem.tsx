import { formatDistanceToNow } from "date-fns";
import { cn } from "@/shared/utils/utils";
import type { RequestMessageDto } from "../types/messaging.types";

interface MessageItemProps {
  message: RequestMessageDto;
  isOwn: boolean;
}

export function MessageItem({ message, isOwn }: MessageItemProps) {
  return (
    <div className={cn("flex flex-col gap-0.5 max-w-[75%]", isOwn ? "ml-auto items-end" : "items-start")}>
      {/* Sender name — only for other people's messages */}
      {!isOwn && (
        <span className="text-[11px] font-medium text-muted-foreground px-1">
          {message.senderName}
        </span>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        {message.content}
      </div>

      {/* Timestamp */}
      <span className="text-[10px] text-muted-foreground px-1">
        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
      </span>
    </div>
  );
}