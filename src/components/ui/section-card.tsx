import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * SectionCard — labeled panel with an icon plate, title, and trailing action.
 * Matches the "Automated email — Step 1" reference. Used for:
 *   • outreach composer steps
 *   • follow-up cadence blocks
 *   • capture / import steps
 *   • any labeled workflow chunk with its own action
 *
 * Composition:
 *   <SectionCard icon={Mail} title="Automated email — Step 1"
 *                action={<Button variant="secondary" size="sm">Test</Button>}>
 *     …body…
 *   </SectionCard>
 */
export function SectionCard({
  icon: Icon,
  title,
  action,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--color-border)]",
        "bg-[var(--color-surface)] overflow-hidden",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 min-w-0">
          {Icon ? (
            <span
              aria-hidden="true"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
            >
              <Icon size={18} />
            </span>
          ) : null}
          <h3 className="text-h3 text-[var(--color-text)] truncate">{title}</h3>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="p-4 text-[var(--color-text)]">{children}</div>
    </section>
  );
}

/**
 * SectionRow — labeled key/value row inside a SectionCard.
 * Matches the "Subject: …" pattern.
 */
export function SectionRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-3", className)}>
      <span className="text-body text-[var(--color-text-3)] shrink-0">{label}</span>
      <span className="text-body-strong text-[var(--color-text)]">{children}</span>
    </div>
  );
}
