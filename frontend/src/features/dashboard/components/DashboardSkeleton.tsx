import { Skeleton } from "@/components/ui/skeleton";


export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg border border-border p-5"
          >
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-4" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}