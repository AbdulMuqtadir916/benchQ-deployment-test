import { cn } from "@/lib/cn";

/** MatchScore — compact score indicator with colour-coded bar and ring variants. */
export function MatchScore({
  score,
  className,
  variant = "bar",
}: {
  score: number;
  className?: string;
  variant?: "bar" | "ring";
}) {
  const band =
    score >= 85
      ? "var(--color-success-fg)"
      : score >= 70
        ? "var(--color-primary)"
        : score >= 55
          ? "var(--color-warning-fg)"
          : "var(--color-text-3)";

  if (variant === "ring") {
    return (
      <span
        role="img"
        aria-label={`Match score ${score}`}
        className={cn(
          "tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-[var(--color-surface)] text-[10px] font-semibold leading-none",
          className,
        )}
        style={{ borderColor: band, color: band }}
      >
        {score}
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)} aria-label={`Match score ${score}`}>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-[var(--color-surface-3)]">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: band }} />
      </div>
      <span className="tabular text-mono-sm" style={{ color: band }}>
        {score}
      </span>
    </div>
  );
}
