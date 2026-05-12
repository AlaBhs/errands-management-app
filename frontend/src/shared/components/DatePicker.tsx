import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/shared/utils/utils";

interface DatePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  minDate?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  placeholder = "Pick a date",
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = value ? new Date(value) : undefined;
  const minDateObj = minDate ? new Date(minDate) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date.toISOString().split("T")[0]);
    } else {
      onChange(undefined);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "w-full px-4 py-2 border border-border rounded-lg text-sm",
            "bg-background dark:bg-card text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-[#2E2E38]",
            "flex items-center justify-between",
            "hover:bg-muted/50 dark:hover:bg-muted/50 transition-colors",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className={cn(selectedDate ? "text-foreground" : "text-muted-foreground")}>
            {selectedDate ? format(selectedDate, "MMM dd, yyyy") : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) =>
            minDateObj ? date < minDateObj : false
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
