import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * StatCard — docs/04 §3.1 + design.md §10.3.
 * Number (display, tabular), label, trend delta (arrow + sign + colour),
 * and the window it covers. A number without a window is a lie.
 */
interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  window: string;
  icon?: LucideIcon;
  iconTone?: "primary" | "danger" | "success" | "warning";
}

const ICON_TONES = {
  primary: "bg-[var(--color-info-bg)] text-[var(--color-info-fg)]",
  danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]",
  success: "bg-[var(--color-success-bg)] text-[var(--color-success-fg)]",
  warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)]",
} as const;

export function StatCard({ label, value, delta, trend = "neutral", window, icon: Icon, iconTone = "primary" }: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-[var(--color-success-fg)]"
      : trend === "down"
        ? "text-[var(--color-danger-fg)]"
        : "text-[var(--color-text-3)]";

  const Arrow = trend === "down" ? ArrowDown : ArrowUp;

  return (
    <div className="bq-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-label text-[var(--color-text-3)]">{label}</div>
        {Icon ? (
          <span className={cn("inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)]", ICON_TONES[iconTone])} aria-hidden="true">
            <Icon size={14} fill="currentColor" strokeWidth={1.75} />
          </span>
        ) : null}
      </div>
      <div className="tabular mt-1 text-h1 text-[var(--color-text)]">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-caption">
        {delta ? (
          <span className={cn("tabular inline-flex items-center gap-1", trendColor)}>
            {trend !== "neutral" ? <Arrow size={12} aria-hidden="true" /> : null}
            <span>{delta}</span>
          </span>
        ) : null}
        <span className="text-[var(--color-text-3)]">{window}</span>
      </div>
    </div>
  );
}
