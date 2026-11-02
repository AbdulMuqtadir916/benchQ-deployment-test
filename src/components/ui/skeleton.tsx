import { cn } from "@/lib/cn";

/**
 * Skeleton — the base loading primitive. Every skeleton in the product
 * composes this. Shape-matched to real content, never a generic grey box —
 * a mismatched skeleton causes layout shift on load, which is worse than
 * showing nothing (docs/05 §5).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-3)]",
        className,
      )}
    />
  );
}
