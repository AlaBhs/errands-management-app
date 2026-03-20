import { WidgetSkeleton } from "./WidgetSkeleton";

export const KpiCardSkeleton = () => (
  <div className="rounded-xl border bg-card p-6 shadow-sm">
    <WidgetSkeleton type="kpi" />
  </div>
);