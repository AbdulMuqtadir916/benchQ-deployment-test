import { Skeleton } from "@/components/ui/skeleton";

/**
 * SkeletonList — shape-matched to a row list (candidate rows, job rows,
 * follow-up rows). Avatar + two text lines + trailing chip, repeated.
 */
export function SkeletonList({
  rows = 6,
  "aria-label": ariaLabel = "Loading list",
}: {
  rows?: number;
  "aria-label"?: string;
}) {
  return (
    <div role="status" aria-busy="true" aria-label={ariaLabel} className="divide-y divide-[var(--color-border)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 h-[var(--row-default)] px-4">
          <Skeleton className="h-8 w-8 shrink-0 rounded-[var(--radius-full)]" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="h-5 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}
