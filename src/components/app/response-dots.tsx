import { cn } from "@/lib/cn";

/** ResponseDots — five-dot momentum indicator (●●●○○) from a 0–5 score. */
export function ResponseDots({ filled, className }: { filled: number; className?: string }) {
  const n = Math.max(0, Math.min(5, filled));
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={`Momentum ${n} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: i < n ? "var(--color-primary)" : "var(--color-surface-3)" }}
        />
      ))}
    </span>
  );
}
