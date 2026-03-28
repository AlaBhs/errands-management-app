import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/utils/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnalyticsFilter } from "../types/analytics.types";

interface DateRangeFilterProps {
  filter: AnalyticsFilter;
  onPreset: (filter: AnalyticsFilter) => void;
  onApply: (filter: AnalyticsFilter) => void;
}

type Preset = { label: string; from: string | null; to: string | null };

const toIsoDate = (d: Date): string => d.toISOString().split("T")[0];

const buildPresets = (): Preset[] => {
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
    { label: "All time", from: null, to: null },
  ];
};

const buildYearOptions = (): number[] => {
  const curr = new Date().getFullYear();
  const years: number[] = [];
  for (let y = curr; y >= 2024; y--) years.push(y);
  return years;
};

const yearToFilter = (y: number): AnalyticsFilter => ({
  from: `${y}-01-01`,
  to: `${y}-12-31`,
});

const filterMatchesYear = (f: AnalyticsFilter, y: number): boolean =>
  f.from === `${y}-01-01` && f.to === `${y}-12-31`;

const isActivePreset = (p: Preset, f: AnalyticsFilter): boolean =>
  p.from === f.from && p.to === f.to;

export const DateRangeFilter = ({
  filter,
  onPreset,
  onApply,
}: DateRangeFilterProps) => {
  const presets = buildPresets();
  const yearOptions = buildYearOptions();
  const [draft, setDraft] = useState<AnalyticsFilter>(filter);
  useEffect(() => {
    setDraft(filter);
  }, [filter]);

  const selectedYear =
    yearOptions.find((y) => filterMatchesYear(filter, y))?.toString() ?? "";

  const parseDate = (iso: string | null): Date | undefined =>
    iso ? new Date(iso) : undefined;

  const formatDate = (iso: string | null): string =>
    iso ? format(new Date(iso), "dd/MM/yyyy") : "";

  const updateDraftFrom = (date: Date | undefined) =>
    setDraft({ ...draft, from: date ? toIsoDate(date) : null });
  const updateDraftTo = (date: Date | undefined) =>
    setDraft({ ...draft, to: date ? toIsoDate(date) : null });

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg
                    border bg-card px-4 py-3 shadow-sm"
    >
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5 h-[stretch]">
        {presets.map((p) => (
          <Button
            key={p.label}
            variant={isActivePreset(p, filter) ? "default" : "outline"}
            size="sm"
            onClick={() => onPreset({ from: p.from, to: p.to })}
            className="h-[stretch] text-xs rounded-md"
          >
            {p.label}
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="hidden h-5 sm:block" />

      {/* Year dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Year</span>
        <Select
          value={selectedYear}
          onValueChange={(val) =>
            val === ""
              ? onPreset({ from: null, to: null })
              : onPreset(yearToFilter(Number(val)))
          }
        >
          <SelectTrigger className="h-7 w-28 text-xs rounded-md">
            <SelectValue placeholder="Select year…" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator orientation="vertical" className="hidden h-5 sm:block" />

      {/* Custom range */}
      <div className="flex flex-wrap items-center gap-2 h-[stretch]">
        <span className="text-xs text-muted-foreground">From</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-[stretch] w-28 justify-start text-left text-xs font-normal rounded-md",
                !draft.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {formatDate(draft.from) || "Pick date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parseDate(draft.from)}
              onSelect={updateDraftFrom}
              disabled={(date) =>
                draft.to ? date > parseDate(draft.to)! : false
              }
              autoFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-xs text-muted-foreground">To</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-[stretch] w-28 justify-start text-left text-xs font-normal rounded-md",
                !draft.to && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {formatDate(draft.to) || "Pick date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parseDate(draft.to)}
              onSelect={updateDraftTo}
              disabled={(date) =>
                draft.from ? date < parseDate(draft.from)! : false
              }
              autoFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          onClick={() => onApply(draft)}
          size="sm"
          className="h-[stretch] px-3 text-xs rounded-md"
        >
          Apply
        </Button>
      </div>
    </div>
  );
};
