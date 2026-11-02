"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { POPOVER_TRANSITION } from "@/lib/motion";

/** Bottom-centre confirmation for a status change — announced to screen readers. */
export function CandidateToast({ message }: { message: string | null }) {
  const reduce = useReducedMotion() ?? false;
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <AnimatePresence>
        {message ? (
          <motion.div
            key={message}
            initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={POPOVER_TRANSITION}
            className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text)] shadow-[var(--shadow-lg)]"
          >
            <CheckCircle2 size={15} aria-hidden className="text-[var(--color-success-fg)]" />
            {message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
