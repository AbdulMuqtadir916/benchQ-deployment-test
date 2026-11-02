"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * ErrorState — docs/05 §5. Every adapter 500 renders this, never a blank
 * screen. Plain-language message, retry action. Never "Oops", never an
 * exclamation mark (CLAUDE.md content rules).
 */
interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
  variant?: "inline" | "page";
  className?: string;
}

export function ErrorState({
  error,
  onRetry,
  variant = "inline",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center px-6",
        variant === "page" ? "py-24" : "py-10",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] mb-4 bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]"
      >
        <AlertTriangle size={22} />
      </span>
      <h3 className="text-h3 text-[var(--color-text)]">
        Something didn’t load
      </h3>
      <p className="mt-1.5 max-w-sm text-body text-[var(--color-text-3)]">
        {error.message || "The request failed. Try again."}
      </p>
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCw size={14} aria-hidden="true" />
          Retry
        </Button>
      ) : null}
    </div>
  );
}
