import { cn } from "@/shared/utils/utils";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subVariant?: "default" | "success" | "warning" | "danger";
  icon: React.ReactNode;
  accent?: "blue" | "green" | "amber" | "red" | "purple" | "slate";
}

const accentMap = {
  blue:   { border: "border-l-[var(--chart-1)]",  icon: "bg-blue-50   text-[var(--chart-1)]   dark:bg-blue-950/40"   },
  green:  { border: "border-l-emerald-500",        icon: "bg-emerald-50 text-emerald-600        dark:bg-emerald-950/40" },
  amber:  { border: "border-l-amber-400",          icon: "bg-amber-50   text-amber-600          dark:bg-amber-950/40"   },
  red:    { border: "border-l-rose-500",           icon: "bg-rose-50    text-rose-600           dark:bg-rose-950/40"    },
  purple: { border: "border-l-violet-500",         icon: "bg-violet-50  text-violet-600         dark:bg-violet-950/40"  },
  slate:  { border: "border-l-slate-400",          icon: "bg-slate-100  text-slate-500          dark:bg-slate-800"      },
};

const subVariantClass = {
  default: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-500  dark:text-amber-400",
  danger:  "text-rose-500   dark:text-rose-400",
};

export const KpiCard = ({
  label,
  value,
  sub,
  subVariant = "default",
  icon,
  accent = "slate",
}: KpiCardProps) => {
  const isNumeric = typeof value === "number";
  const animated  = useAnimatedCounter(isNumeric ? (value as number) : 0);
  const display   = isNumeric ? animated : value;
  const colors    = accentMap[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border-l-4 bg-card",
        "shadow-sm hover:shadow-md transition-all duration-200",
        "p-5 flex items-start gap-4",
        colors.border
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          "transition-transform duration-200 group-hover:scale-105",
          colors.icon
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          {display}
        </p>
        {sub && (
          <p className={cn("mt-1 text-xs font-medium", subVariantClass[subVariant])}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
};