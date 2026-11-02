"use client";

import { formatIst, formatLocal, formatRelative } from "@/lib/format/timezone";

/**
 * DualTimestamp — CLAUDE.md: "never render a bare UTC string anywhere in
 * this product." Client-local time primary, IST secondary. This is the
 * ONLY component allowed to render a raw ISO timestamp to the user.
 */
interface DualTimestampProps {
  iso: string;
  primary?: "local" | "ist";
  format?: "relative" | "absolute" | "both";
  className?: string;
}

export function DualTimestamp({
  iso,
  primary = "local",
  format = "both",
  className,
}: DualTimestampProps) {
  const local = formatLocal(iso);
  const ist = formatIst(iso);
  const relative = formatRelative(iso);

  const primaryLabel = primary === "local" ? local : ist;
  const secondaryLabel = primary === "local" ? `${ist} IST` : `${local} local`;

  if (format === "relative") {
    return (
      <time dateTime={iso} title={`${local} local · ${ist} IST`} className={className}>
        {relative}
      </time>
    );
  }

  if (format === "absolute") {
    return (
      <time dateTime={iso} title={secondaryLabel} className={className}>
        {primaryLabel}
      </time>
    );
  }

  return (
    <time dateTime={iso} className={className}>
      <span className="tabular">{primaryLabel}</span>
      <span className="tabular text-[var(--color-text-3)]"> · {secondaryLabel}</span>
    </time>
  );
}
