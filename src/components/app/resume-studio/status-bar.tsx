"use client";

import { AlertTriangle, ArrowRight, Info, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ResumeDocument } from "@/lib/schemas/resume-document";
import type { ExportGate } from "@/lib/schemas/resume";
import { allClaims } from "@/lib/resume-doc/ops";
import { isBlank, stripTags } from "@/lib/resume-doc/rich-text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { POPOVER_TRANSITION } from "@/lib/motion";
import { useStudio } from "./studio-store";

const NOTICE_ICON = { info: Info, ai: Sparkles, danger: AlertTriangle } as const;

/** Bottom bar: the export gate with a jump to the next unverified claim, live counts, and notices. */
export function StatusBar({ doc, gate }: { doc: ResumeDocument; gate: ExportGate }) {
  const jumpToClaim = useStudio((s) => s.jumpToClaim);
  const notice = useStudio((s) => s.notice);
  const reduce = useReducedMotion() ?? false;

  const claims = allClaims(doc).map((c) => c.claim).filter((c) => !isBlank(c.html) && c.state !== "CONTRADICTED");
  const verified = claims.filter((c) => c.state === "VERIFIED").length;
  const words = claims.reduce((n, c) => n + stripTags(c.html).split(" ").filter(Boolean).length, 0);
  const NoticeIcon = notice ? NOTICE_ICON[notice.tone] : Info;

  return (
    <footer className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5">
      {gate.canExport ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-success-fg)]">
          <ShieldCheck size={14} aria-hidden />
          Every claim is verified — ready to export.
        </span>
      ) : (
        <span className="inline-flex items-center gap-2 text-sm text-[var(--color-text-2)]">
          <Lock size={14} aria-hidden className="text-[var(--color-unverified-fg)]" />
          {gate.message}
          <Button size="sm" variant="ghost" onClick={() => gate.blockingClaimIds[0] && jumpToClaim(gate.blockingClaimIds[0])}>
            Review next
            <ArrowRight size={13} aria-hidden />
          </Button>
        </span>
      )}

      <span className="tabular hidden text-sm text-[var(--color-text-3)] md:inline">
        {verified} of {claims.length} claims verified · {words} words
      </span>

      <div className="ml-auto min-w-0" aria-live="polite">
        <AnimatePresence>
          {notice ? (
            <motion.span
              key={notice.text}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={POPOVER_TRANSITION}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] px-2.5 py-1 text-sm",
                notice.tone === "ai" && "bg-[var(--color-violet-bg)] text-[var(--color-violet-fg)]",
                notice.tone === "danger" && "bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]",
                notice.tone === "info" && "bg-[var(--color-info-bg)] text-[var(--color-info-fg)]",
              )}
            >
              <NoticeIcon size={13} aria-hidden />
              <span className="truncate">{notice.text}</span>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </footer>
  );
}
