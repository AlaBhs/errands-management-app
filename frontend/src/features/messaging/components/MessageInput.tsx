import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSend: (content: string) => void;
  isSending: boolean;
  disabled?: boolean;
}

export function MessageInput({ onSend, isSending, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
  }

  // Send on Ctrl+Enter / Cmd+Enter
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex gap-2 items-end border-t border-border p-3">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message… (Ctrl+Enter to send)"
        rows={1}
        disabled={disabled || isSending}
        className="resize-none min-h-[38px] max-h-[120px] flex-1 text-sm"
      />
      <Button
        size="sm"
        onClick={handleSend}
        disabled={!value.trim() || isSending || disabled}
        className="shrink-0 h-[stretch] max-h-[46px] rounded-xl"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
}