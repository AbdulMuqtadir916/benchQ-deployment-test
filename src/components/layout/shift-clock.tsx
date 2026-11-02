"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * ShiftClock — docs/04 §1.1. US Eastern + IST side by side,
 * remaining shift time, amber inside the last 45 minutes.
 * Placeholder wiring — the real shift window comes from the firm settings.
 * Renders nothing until mount to keep SSR stable.
 */
export function ShiftClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const initialId = window.setTimeout(() => setNow(new Date()), 0);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.clearTimeout(initialId);
      clearInterval(id);
    };
  }, []);

  if (!now) {
    return (
      <div
        aria-hidden="true"
        className="h-8 w-[220px] rounded-[var(--radius-sm)]"
      />
    );
  }

  const ist = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(now);

  const et = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/New_York",
  }).format(now);

  // Shift 18:30–00:30 IST → remaining minutes till 00:30 IST
  const remaining = remainingShiftMinutes(now);
  const inShift = remaining !== null;
  const isLast45 = inShift && remaining! <= 45;

  return (
    <div
      className={cn(
        "tabular hidden md:flex items-center gap-3 px-3 h-8",
        "rounded-[var(--radius-sm)] border border-[var(--color-border)]",
        "bg-[var(--color-surface)] text-caption text-[var(--color-text-2)]",
      )}
      aria-label={`Shift clock: IST ${ist}, ET ${et}`}
    >
      <Clock3 size={14} aria-hidden="true" className="shrink-0 text-[var(--color-text-3)]" />
      <span>
        <span className="text-[var(--color-text-3)]">IST </span>
        {ist}
      </span>
      <span className="h-3 w-px bg-[var(--color-border)]" aria-hidden="true" />
      <span>
        <span className="text-[var(--color-text-3)]">ET </span>
        {et}
      </span>
      {inShift ? (
        <>
          <span className="h-3 w-px bg-[var(--color-border)]" aria-hidden="true" />
          <span
            className={cn(
              isLast45
                ? "text-[var(--color-warning-fg)]"
                : "text-[var(--color-text-3)]",
            )}
          >
            {formatRemaining(remaining!)} left
          </span>
        </>
      ) : null}
    </div>
  );
}

/** Minutes remaining until 00:30 IST, or null when outside 18:30–00:30. */
function remainingShiftMinutes(now: Date): number | null {
  const istMinutes = istMinuteOfDay(now);
  const start = 18 * 60 + 30;
  const endWrapped = 24 * 60 + 30; // 00:30 next day
  if (istMinutes < start) return null;
  const remaining = endWrapped - istMinutes;
  return remaining > 0 ? remaining : null;
}

function istMinuteOfDay(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

function formatRemaining(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
