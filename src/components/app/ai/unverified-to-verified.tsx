"use client";

import { motion, useReducedMotion } from "motion/react";
import { ClaimChip, type ClaimState } from "@/components/app/claim-chip";
import { cn } from "@/lib/cn";
import { durations, easeInOut } from "@/lib/motion";

interface UnverifiedToVerifiedProps {
  state: Extract<ClaimState, "UNVERIFIED" | "VERIFIED">;
  text: string;
  reason?: string;
  className?: string;
}

export function UnverifiedToVerified({
  state,
  text,
  reason,
  className,
}: UnverifiedToVerifiedProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      layout
      initial={false}
      animate={{ opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: durations.verify, ease: easeInOut }
      }
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-md)] border p-3",
        state === "UNVERIFIED"
          ? "border-dashed border-[var(--color-unverified-fg)] bg-[var(--color-unverified-bg)]"
          : "border-solid border-[var(--color-verified-fg)] bg-[var(--color-verified-bg)]",
        className,
      )}
    >
      <ClaimChip state={state} reason={reason} />
      <motion.p
        layout
        className={cn(
          "text-body",
          state === "UNVERIFIED"
            ? "text-[var(--color-unverified-fg)]"
            : "text-[var(--color-verified-fg)]",
        )}
      >
        {text}
      </motion.p>
    </motion.div>
  );
}
