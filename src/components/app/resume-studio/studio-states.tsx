"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/** Full-screen frame for the studio's non-ready states, so loading never flashes the app shell. */
export function StudioFrame({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg)]">
      <header className="flex min-h-14 items-center gap-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4">
        <button type="button" onClick={onClose} aria-label="Close resume" title="Close  Esc" className="bq-secondary inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)]">
          <X size={15} aria-hidden />
        </button>
        <span className="text-h3 text-[var(--color-text-2)]">Resume Builder</span>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

export function StudioSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading resume" className="flex h-full">
      <div className="w-full space-y-2.5 bg-[var(--color-bg-subtle)] p-4 lg:w-[44%] lg:max-w-2xl">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="bq-card flex h-12 items-center gap-3 px-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
      <div className="rs-desk hidden flex-1 justify-center p-8 lg:flex">
        <div className="w-full max-w-2xl space-y-4 rounded-[var(--radius-xs)] bg-[var(--color-paper)] p-10 shadow-[var(--shadow-paper)]">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3 w-80" />
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-2 pt-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
