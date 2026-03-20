import { useState, useEffect } from "react";
import type { AnalyticsFilter } from "../types/analytics.types";

interface DateRangeFilterProps {
  filter: AnalyticsFilter;
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
      from:  toIsoDate(new Date(
               today.getFullYear(),
               today.getMonth() - 3,
               today.getDate())),
      to: toIsoDate(today),
    },
    {
      label: "Last 6 months",
      from:  toIsoDate(new Date(
               today.getFullYear(),
               today.getMonth() - 6,
               today.getDate())),
      to: toIsoDate(today),
    },
    { label: "All time", from: null, to: null },
  ];
};

// Derive selectable years from current year back to 2024 for example
const buildYearOptions = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= 2024; y--) years.push(y);
  return years;
};

const yearToFilter = (year: number): AnalyticsFilter => ({
  from: `${year}-01-01`,
  to:   `${year}-12-31`,
});

const filterMatchesYear = (filter: AnalyticsFilter, year: number): boolean =>
  filter.from === `${year}-01-01` && filter.to === `${year}-12-31`;

const isActivePreset = (preset: Preset, filter: AnalyticsFilter): boolean =>
  preset.from === filter.from && preset.to === filter.to;

export const DateRangeFilter = ({
  filter,
  onPreset,
  onApply,
}: DateRangeFilterProps) => {
  const presets     = buildPresets();
  const yearOptions = buildYearOptions();

  const [draft, setDraft] = useState<AnalyticsFilter>(filter);
  useEffect(() => { setDraft(filter); }, [filter]);

  // Which year is currently selected in the dropdown — "" if none matches
  const selectedYear =
    yearOptions.find((y) => filterMatchesYear(filter, y))?.toString() ?? "";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">

      {/* Quick preset buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onPreset({ from: p.from, to: p.to })}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors
              ${isActivePreset(p, filter)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-border" />

      {/* Year dropdown — selecting a year applies immediately */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Year</label>
        <select
          value={selectedYear}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              // "Select year" placeholder chosen — reset to all time
              onPreset({ from: null, to: null });
            } else {
              onPreset(yearToFilter(Number(val)));
            }
          }}
          className="rounded-md border bg-background px-2 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-ring
                     text-foreground"
        >
          <option value="">Select year...</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="h-5 w-px bg-border" />

      {/* Custom date range — requires Apply */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="text-muted-foreground">From</label>
        <input
          type="date"
          value={draft.from ?? ""}
          max={draft.to ?? undefined}
          onChange={(e) =>
            setDraft((d) => ({ ...d, from: e.target.value || null }))
          }
          className="rounded-md border bg-background px-2 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <label className="text-muted-foreground">To</label>
        <input
          type="date"
          value={draft.to ?? ""}
          min={draft.from ?? undefined}
          onChange={(e) =>
            setDraft((d) => ({ ...d, to: e.target.value || null }))
          }
          className="rounded-md border bg-background px-2 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => onApply(draft)}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium
                     text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Apply
        </button>
      </div>

    </div>
  );
};