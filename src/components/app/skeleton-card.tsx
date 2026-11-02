import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

/** SkeletonCard — shape-matched to a StatCard / SectionCard. */
export function SkeletonCard({
  "aria-label": ariaLabel = "Loading",
}: {
  "aria-label"?: string;
}) {
  return (
    <Card role="status" aria-busy="true" aria-label={ariaLabel}>
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </Card>
  );
}
