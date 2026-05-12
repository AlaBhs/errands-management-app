interface WidgetEmptyStateProps {
  message?: string;
}

export const WidgetEmptyState = ({
  message = "No data available for the selected period.",
}: WidgetEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
      <svg
        className="h-6 w-6 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621
             0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21
             6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z
             M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621
             0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125
             1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z
             M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621
             0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125
             1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    </div>
    <p className="text-sm font-medium text-muted-foreground">{message}</p>
  </div>
);