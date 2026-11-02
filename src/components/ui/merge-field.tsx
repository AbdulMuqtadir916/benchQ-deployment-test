import { cn } from "@/lib/cn";

/**
 * MergeField — inline placeholder chip for outreach templates and merge fields.
 * Amber monospace with brace notation distinguishes template fields from status.
 * Semantic: a placeholder that will be filled at send time.
 */
export function MergeField({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bq-tag",
        "bg-[var(--color-mergefield-bg)] text-[var(--color-mergefield-fg)]",
        "align-baseline",
        className,
      )}
    >
      {"{"}{children}{"}"}
    </span>
  );
}
