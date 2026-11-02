import type { Application } from "@/lib/schemas/application";
import { cn } from "@/lib/cn";
import { DualTimestamp } from "@/components/app/dual-timestamp";
import { STATUS_COLOR, STATUS_ICON, STATUS_LABEL } from "./status-meta";

/** Every stage change for one application, oldest first, with who made it. */
export function StatusTimeline({ application, actorName }: { application: Application; actorName: (userId: string | null) => string | null }) {
  const events = [...application.events].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  return (
    <ol className="relative">
      {events.map((e, i) => {
        const Icon = STATUS_ICON[e.toStatus];
        const isLast = i === events.length - 1;
        return (
          <li key={e.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast ? <span aria-hidden className="absolute bottom-0 left-4 top-9 w-px bg-[var(--color-border)]" /> : null}
            <span aria-hidden className={cn("relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-full)] border bg-[var(--color-surface)]", isLast ? "border-[var(--color-primary)]" : "border-[var(--color-border)]")}>
              <Icon size={14} className={STATUS_COLOR[e.toStatus]} />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-body-strong text-[var(--color-text)]">{e.fromStatus ? `Moved to ${STATUS_LABEL[e.toStatus]}` : STATUS_LABEL[e.toStatus]}{isLast ? <span className="ml-2 text-caption font-normal text-[var(--color-primary-subtle-fg)]">Current</span> : null}</p>
              {e.note ? <p className="mt-0.5 text-sm text-[var(--color-text-2)]">{e.note}</p> : null}
              <p className="mt-0.5 text-caption text-[var(--color-text-3)]">
                <DualTimestamp iso={e.createdAt} format="absolute" /> · {e.isAutomated ? "Automated" : (actorName(e.actorUserId) ?? (e.toStatus === "APPLIED" ? actorName(application.submittedByUserId) : null) ?? "Team member")}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
