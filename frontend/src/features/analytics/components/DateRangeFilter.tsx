import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/utils/utils";
import type { AnalyticsFilter } from "../types/analytics.types";

interface DateRangeFilterProps {
  filter:   AnalyticsFilter;
  onPreset: (filter: AnalyticsFilter) => void;
  onApply:  (filter: AnalyticsFilter) => void;
}

type Preset = { label: string; from: string | null; to: string | null };

const toIsoDate = (d: Date): string => d.toISOString().split("T")[0];

const buildPresets = (): Preset[] => {
  const today = new Date();
  return [
    {
      label: "Last 30 days",
      from:  toIsoDate(new Date(Date.now() - 30 * 86_400_000)),
      to:    toIsoDate(today),
    },
    {
      label: "Last 3 months",
      from:  toIsoDate(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())),
      to:    toIsoDate(today),
    },
    {
      label: "Last 6 months",
      from:  toIsoDate(new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())),
      to:    toIsoDate(today),
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
  to:   `${y}-12-31`,
});

const filterMatchesYear = (f: AnalyticsFilter, y: number): boolean =>
  f.from === `${y}-01-01` && f.to === `${y}-12-31`;

const isActivePreset = (p: Preset, f: AnalyticsFilter): boolean =>
  p.from === f.from && p.to === f.to;

export const DateRangeFilter = ({ filter, onPreset, onApply }: DateRangeFilterProps) => {
  const presets     = buildPresets();
  const yearOptions = buildYearOptions();
  const [draft, setDraft] = useState<AnalyticsFilter>(filter);
  useEffect(() => { setDraft(filter); }, [filter]);

  const selectedYear =
    yearOptions.find((y) => filterMatchesYear(filter, y))?.toString() ?? "";

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl
                    border bg-card px-4 py-3 shadow-sm">

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onPreset({ from: p.from, to: p.to })}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
              isActivePreset(p, filter)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <Separator orientation="vertical" className="hidden h-5 sm:block" />

      {/* Year dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Year</span>
        <select
          value={selectedYear}
          onChange={(e) =>
            e.target.value === ""
              ? onPreset({ from: null, to: null })
              : onPreset(yearToFilter(Number(e.target.value)))
          }
          className="rounded-md border bg-background px-2 py-1.5 text-xs
                     font-medium text-foreground focus:outline-none
                     focus:ring-2 focus:ring-ring transition-colors
                     hover:border-ring cursor-pointer"
        >
          <option value="">Select year...</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <Separator orientation="vertical" className="hidden h-5 sm:block" />

      {/* Custom range */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">From</span>
        <input
          type="date"
          value={draft.from ?? ""}
          max={draft.to ?? undefined}
          onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value || null }))}
          className="rounded-md border bg-background px-2 py-1.5 text-xs
                     font-medium focus:outline-none focus:ring-2 focus:ring-ring
                     hover:border-ring transition-colors cursor-pointer"
        />
        <span className="text-xs text-muted-foreground">To</span>
        <input
          type="date"
          value={draft.to ?? ""}
          min={draft.from ?? undefined}
          onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value || null }))}
          className="rounded-md border bg-background px-2 py-1.5 text-xs
                     font-medium focus:outline-none focus:ring-2 focus:ring-ring
                     hover:border-ring transition-colors cursor-pointer"
        />
        <button
          onClick={() => onApply(draft)}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium
                     text-primary-foreground shadow-sm hover:bg-primary/90
                     transition-colors active:scale-95"
        >
          Apply
        </button>
      </div>
    </div>
  );
};