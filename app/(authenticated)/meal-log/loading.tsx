import { Skeleton } from "@/components/ui/skeleton";

export default function MealLogLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      {/* Back link skeleton */}
      <Skeleton className="h-6 w-40" />

      {/* Main Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1 space-y-3">
          <Skeleton className="h-8 w-32 mb-4" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>

        {/* Main Panel Skeleton */}
        <div className="lg:col-span-4 space-y-6">
          {/* Form skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>

          {/* Separator */}
          <Skeleton className="h-[1px] w-full" />

          {/* Weight form skeleton */}
          <Skeleton className="h-48 w-full" />

          {/* Separator */}
          <Skeleton className="h-[1px] w-full" />

          {/* Entries skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
