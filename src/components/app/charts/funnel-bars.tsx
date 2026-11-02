"use client";

import { motion, useReducedMotion } from "motion/react";
import type { FunnelStage } from "@/lib/schemas/analytics";

/**
 * FunnelBars — horizontal funnel. Each stage bar is proportional to the top
 * stage; the conversion-from-previous percentage is shown on the right.
 * Dependency-free; colours and motion come from tokens.
 */
export function FunnelBars({ stages }: { stages: FunnelStage[] }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="space-y-2.5">
      {stages.map((stage, i) => {
        const pct = (stage.count / max) * 100;
        return (
          <div key={stage.status} className="flex items-center gap-3">
            <div className="w-20 shrink-0 text-sm text-[var(--color-text-2)]">{stage.label}</div>
            <div className="relative h-7 flex-1 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface-2)]">
              <motion.div
                className="flex h-full items-center rounded-[var(--radius-sm)] px-2"
                style={{ background: "var(--gradient-primary)" }}
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${Math.max(pct, 8)}%` }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="tabular text-mono-sm font-medium text-[var(--color-primary-fg)]">
                  {stage.count}
                </span>
              </motion.div>
            </div>
            <div className="w-14 shrink-0 text-right">
              {stage.conversionFromPreviousPct !== null ? (
                <span className="tabular text-mono-sm text-[var(--color-text-3)]">
                  {stage.conversionFromPreviousPct}%
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
