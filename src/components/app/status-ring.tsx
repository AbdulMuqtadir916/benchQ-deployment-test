import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type RingState = "todo" | "in-progress" | "done";

/** StatusRing — a compact circular status indicator for task-style rows. */
export function StatusRing({
  state,
  className,
}: {
  state: RingState;
  className?: string;
}) {
  if (state === "done") {
    return (
      <span
        role="img"
        aria-label="Done"
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-success-fg)] text-[var(--color-success-bg)]",
          className,
        )}
      >
        <Check size={10} strokeWidth={3} aria-hidden />
      </span>
    );
  }

  if (state === "in-progress") {
    return (
      <span
        role="img"
        aria-label="In progress"
        className={cn("h-4 w-4 shrink-0 rounded-full border-2 border-[var(--color-primary)]", className)}
        style={{
          background:
            "conic-gradient(var(--color-primary) 0turn 0.5turn, transparent 0.5turn 1turn)",
        }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label="Not started"
      className={cn(
        "h-4 w-4 shrink-0 rounded-full border-2 border-dashed border-[var(--color-border-strong)]",
        className,
      )}
    />
  );
}
