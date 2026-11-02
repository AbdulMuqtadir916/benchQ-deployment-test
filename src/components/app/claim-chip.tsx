"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle2, CircleHelp, Ban } from "lucide-react";
import { cn } from "@/lib/cn";
import { durations, easeInOut } from "@/lib/motion";

/**
 * ClaimChip — the load-bearing pattern (docs/05 §3, CLAUDE.md "the three claim states").
 *
 * Rules encoded here:
 *  • label + icon + colour — never colour alone (docs/05 §3)
 *  • VERIFIED: CheckCircle2, solid, --color-verified-*
 *  • UNVERIFIED: CircleHelp, dashed border (non-colour channel), --color-unverified-*
 *  • CONTRADICTED: Ban, line-through (non-colour channel), --color-contradicted-*
 *  • unverified → verified animates via layout + duration-verify (350ms); useReducedMotion → 0ms
 *    but the state change stays perceivable because all 4 channels change instantly
 *  • accessible name always names the state so screen readers hear it
 */

export type ClaimState = "VERIFIED" | "UNVERIFIED" | "CONTRADICTED";

const STATES = {
  VERIFIED: {
    label: "Verified",
    Icon: CheckCircle2,
    cls: "text-[var(--color-verified-fg)] bg-[var(--color-verified-bg)] border-[var(--color-verified-fg)]/40 border-solid",
  },
  UNVERIFIED: {
    label: "Unverified",
    Icon: CircleHelp,
    cls: "text-[var(--color-unverified-fg)] bg-[var(--color-unverified-bg)] border-[var(--color-unverified-fg)]/50 border-dashed",
  },
  CONTRADICTED: {
    label: "Contradicted",
    Icon: Ban,
    cls: "text-[var(--color-contradicted-fg)] bg-[var(--color-contradicted-bg)] border-[var(--color-contradicted-fg)]/40 border-solid line-through",
  },
} as const;

interface ClaimChipProps {
  state: ClaimState;
  /** Optional context — surfaced to SR as "Unverified — {reason}" */
  reason?: string;
  /** The claim text itself. Falls back to just the state label if absent. */
  children?: React.ReactNode;
  className?: string;
}

export function ClaimChip({ state, reason, children, className }: ClaimChipProps) {
  const config = STATES[state];
  const Icon = config.Icon;
  const reduce = useReducedMotion();

  const srName =
    state === "UNVERIFIED"
      ? `Unverified — unverified claim${reason ? `: ${reason}` : ""}`
      : state === "CONTRADICTED"
        ? `Contradicted — contradicted by evidence${reason ? `: ${reason}` : ""}`
        : `Verified — verified claim`;

  return (
    <motion.span
      layout
      role="status"
      aria-label={srName}
      transition={
        reduce ? { duration: 0 } : { duration: durations.verify, ease: easeInOut }
      }
      className={cn(
        "bq-tag",
        config.cls,
        className,
      )}
    >
      <Icon size={12} aria-hidden="true" />
      <span aria-hidden="true">{config.label}</span>
      {children ? (
        <>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span>{children}</span>
        </>
      ) : null}
    </motion.span>
  );
}
