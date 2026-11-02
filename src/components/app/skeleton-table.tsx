import { Skeleton } from "@/components/ui/skeleton";

/** SkeletonTable — shape-matched to DataTable rows/columns. */
export function SkeletonTable({
  rows = 8,
  columns = 5,
  "aria-label": ariaLabel = "Loading table",
}: {
  rows?: number;
  columns?: number;
  "aria-label"?: string;
}) {
  return (
    <div role="status" aria-busy="true" aria-label={ariaLabel} className="w-full">
      <div className="flex items-center gap-4 h-9 px-4 border-b border-[var(--color-border)]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 h-[var(--row-default)] px-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
