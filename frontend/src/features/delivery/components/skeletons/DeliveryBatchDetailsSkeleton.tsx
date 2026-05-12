import { Skeleton } from "@/components/ui/skeleton";

export function DeliveryBatchDetailsSkeleton() {
  return (
    <div className="w-full px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Back link */}
        <Skeleton className="h-4 w-32" />

        {/* Header card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>

        {/* Two‑column grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column (main content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline section */}
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      {i < 3 && <div className="mt-1 w-px h-8 bg-border" />}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pickup Proof section */}
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              {/* Attachment placeholder */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Skeleton className="h-4 w-4 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Right column (sidebar) */}
          <div className="space-y-6">
            {/* Actions card */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-5 py-3">
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="p-5 space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>

            {/* Client Information card */}
            <div className="rounded-xl border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}