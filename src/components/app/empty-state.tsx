import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * EmptyState — docs/05 §5. Three variants, each meaning something different:
 *   first-run  — nothing exists yet, teach the user what to do
 *   filtered   — filters produced zero rows, offer a way out
 *   error      — the adapter threw, offer a retry (prefer ErrorState for this)
 * Using one variant for all three is CLAUDE.md's named example of an
 * unfinished-feeling app. Don't default to first-run everywhere.
 */
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: "first-run" | "filtered" | "error";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "first-run",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-16",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] mb-4",
          variant === "error"
            ? "bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]"
            : "bg-[var(--color-primary-subtle)] text-[var(--color-primary-subtle-fg)]",
        )}
      >
        <Icon size={22} />
      </span>
      <h3 className="text-h3 text-[var(--color-text)]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-body text-[var(--color-text-3)]">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
