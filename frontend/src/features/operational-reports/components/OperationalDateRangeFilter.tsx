import { CalendarIcon, BrainCircuit } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/utils/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const toIsoDate = (d: Date | null): string | null =>
  d ? d.toISOString().split("T")[0] : null;

const buildPresets = () => {
  const today = new Date();
  return [
    {
      label: "Last 30 days",
      from: toIsoDate(new Date(Date.now() - 30 * 86_400_000)),
      to: toIsoDate(today),
    },
    {
      label: "Last 3 months",
      from: toIsoDate(
        new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()),
      ),
      to: toIsoDate(today),
    },
    {
      label: "Last 6 months",
      from: toIsoDate(
        new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()),
      ),
      to: toIsoDate(today),
    },
  ];
};

const parseDate = (iso: string | null): Date | undefined =>
  iso ? new Date(iso) : undefined;

const formatDate = (iso: string | null): string =>
  iso ? format(new Date(iso), "dd/MM/yyyy") : "";

interface OperationalDateRangeFilterProps {
  from: string | null;
  to: string | null;
  onFromChange: (value: string | null) => void;
  onToChange: (value: string | null) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function OperationalDateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
  onGenerate,
  isGenerating,
}: OperationalDateRangeFilterProps) {
  const presets = buildPresets();

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg
                    border bg-background px-4 py-3 shadow-sm h-16"
    >
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5 h-[stretch]">
        {presets.map((p) => {
          const isActive = p.from === from && p.to === to;
          return (
            <Button
              key={p.label}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onFromChange(p.from);
                onToChange(p.to);
              }}
              className="h-7 text-xs rounded-md h-[stretch]"
            >
              {p.label}
            </Button>
          );
        })}
      </div>

      <Separator orientation="vertical" className="hidden h-9 sm:block" />

      {/* From date picker */}
      <div className="flex items-center gap-2 h-[stretch]">
        <span className="text-xs text-muted-foreground">From</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-[stretch] w-28 justify-start text-left text-xs font-normal rounded-md",
                !from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {formatDate(from) || "Pick date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parseDate(from)}
              onSelect={(date) => onFromChange(toIsoDate(date ?? null))}
              disabled={(date) => (to ? date > parseDate(to)! : false)}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-xs text-muted-foreground">To</span>

        {/* To date picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-[stretch] w-28 justify-start text-left text-xs font-normal rounded-md",
                !to && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {formatDate(to) || "Pick date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parseDate(to)}
              onSelect={(date) => onToChange(toIsoDate(date ?? null))}
              disabled={(date) => (from ? date < parseDate(from)! : false)}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Generate button */}
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        size="sm"
        className="gap-2 border-[var(--ey-yellow)] text-[var(--ey-text)] bg-[var(--ey-yellow)]/10 hover:bg-[var(--ey-yellow)] hover:text-[var(--ey-dark)] transition-colors h-[stretch] rounded-md ml-auto "
      >
        <BrainCircuit className="h-4 w-4" />
        {isGenerating ? "Generating…" : "Generate Report"}
      </Button>
    </div>
  );
}