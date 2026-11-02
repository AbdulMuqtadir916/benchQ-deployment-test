"use client";

import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-1 flex items-baseline justify-between gap-2">
      <span className="text-label text-[var(--color-text-2)]">{children}</span>
      {hint ? <span className="text-caption text-[var(--color-text-3)]">{hint}</span> : null}
    </span>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("block min-w-0", className)}>
      <FieldLabel>{label}</FieldLabel>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? label} />
    </label>
  );
}

/** Reorder + remove controls for one row. Keyboard reachable, labelled by the row it acts on. */
export function RowControls({ label, onUp, onDown, onRemove }: { label: string; onUp?: () => void; onDown?: () => void; onRemove: () => void }) {
  const icon = "inline-flex h-4 w-5 items-center justify-center rounded-[var(--radius-xs)] text-[var(--color-text-3)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] disabled:opacity-30";
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {onUp || onDown ? (
        <div className="flex flex-col">
          <button type="button" className={icon} onClick={onUp} disabled={!onUp} aria-label={`Move ${label} up`}><ChevronUp size={12} aria-hidden /></button>
          <button type="button" className={icon} onClick={onDown} disabled={!onDown} aria-label={`Move ${label} down`}><ChevronDown size={12} aria-hidden /></button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-3)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-fg)]"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}

export function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] text-sm font-[550] text-[var(--color-primary-subtle-fg)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]"
    >
      <Plus size={14} aria-hidden />
      {children}
    </button>
  );
}

export function EmptyHint({ title }: { title: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-4 py-5 text-center">
      <p className="text-body-strong text-[var(--color-text-2)]">{title}</p>
      <p className="mt-0.5 text-sm text-[var(--color-text-3)]">Empty sections are left out of the PDF.</p>
    </div>
  );
}

/** Up / down handlers for index `i` in a list of `length`, undefined at the ends. */
export function moveHandlers(i: number, length: number, move: (dir: -1 | 1) => void) {
  return { onUp: i > 0 ? () => move(-1) : undefined, onDown: i < length - 1 ? () => move(1) : undefined };
}
