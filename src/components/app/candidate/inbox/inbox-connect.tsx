"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CalendarClock, Check, GitMerge, LoaderCircle, Lock, Star } from "lucide-react";
import type { Candidate } from "@/lib/schemas/candidate";
import { useConnectMailbox } from "@/lib/hooks/use-inbox";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GoogleLogo } from "@/components/brand/google-logo";

type Step = "intro" | "consent" | "syncing";

const BENEFITS = [
  { Icon: Star, text: "Spots shortlists, recruiter calls, interview invites, offers and rejections" },
  { Icon: GitMerge, text: "Matches every recruiter email to the application it's about" },
  { Icon: CalendarClock, text: "Suggests status updates you confirm in one click — nothing changes on its own" },
];

/**
 * Connect the candidate's Google account. Simulated: a consent step, then a
 * staged first sync. Stays on screen until the sync story has played out.
 */
export function InboxConnect({ candidate, applicationCount, onSyncChange }: { candidate: Candidate; applicationCount: number; onSyncChange: (isSyncing: boolean) => void }) {
  const reduce = useReducedMotion() ?? false;
  const connect = useConnectMailbox(candidate.id);
  const [step, setStep] = useState<Step>("intro");
  const [stage, setStage] = useState(0);
  const first = candidate.fullName.split(" ")[0]!;
  const address = candidate.email ?? "their Gmail address";
  const result = connect.data;
  const found = result ? result.messages.filter((m) => m.signal !== "CONFIRMATION").length : 0;
  const matched = result ? new Set(result.messages.map((m) => m.applicationId).filter(Boolean)).size : 0;
  const stages = ["Connecting to Google", "Reading recruiter and job-portal emails", `Matching emails to ${applicationCount} applications`, result ? `Found ${found} recruiter updates across ${matched} applications` : "Detecting shortlists, calls and interviews"];

  useEffect(() => {
    if (step !== "syncing") return;
    const each = reduce ? 150 : 800;
    const timers = [1, 2, 3].map((n) => setTimeout(() => setStage(n), each * n));
    return () => timers.forEach(clearTimeout);
  }, [step, reduce]);

  const isFinished = step === "syncing" && stage >= 3 && connect.isSuccess;
  useEffect(() => {
    if (!isFinished) return;
    const t = setTimeout(() => onSyncChange(false), reduce ? 100 : 900);
    return () => clearTimeout(t);
  }, [isFinished, onSyncChange, reduce]);

  function allow() {
    setStep("syncing");
    setStage(0);
    onSyncChange(true);
    connect.mutate(undefined, { onError: () => { setStep("consent"); onSyncChange(false); } });
  }

  return (
    <Card className="mx-auto max-w-xl overflow-hidden p-0">
      <div className="flex flex-col items-center px-6 pb-2 pt-8 text-center sm:px-10">
        <span aria-hidden className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]"><GoogleLogo size={28} /></span>
        <h2 className="text-h2 text-[var(--color-text)]">{step === "syncing" ? `Syncing ${first}'s inbox` : `Connect ${first}'s Google account`}</h2>
        <p className="mt-1.5 max-w-md text-body text-[var(--color-text-3)]">Track every application from the recruiter&apos;s side — who replied, who shortlisted, and when the interview is.</p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: EASE_OUT }} className="px-6 pb-8 pt-5 sm:px-10">
          {step === "intro" ? (
            <>
              <ul className="space-y-3">
                {BENEFITS.map(({ Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-[var(--color-text-2)]">
                    <span aria-hidden className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-2)] text-[var(--color-text-2)]"><Icon size={14} /></span>
                    <span className="pt-1">{text}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" size="lg" onClick={() => setStep("consent")}><span className="inline-flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] bg-white"><GoogleLogo size={14} /></span>Connect Google account</Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-caption text-[var(--color-text-3)]"><Lock size={12} aria-hidden />Read-only. BenchQ never sends, deletes or changes email.</p>
            </>
          ) : step === "consent" ? (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
              <p className="text-body-strong text-[var(--color-text)]">Allow read-only access to {address}?</p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-text-2)]">
                <li className="flex gap-2"><Check size={14} aria-hidden className="mt-0.5 shrink-0 text-[var(--color-success-fg)]" />Read emails from recruiters and job portals</li>
                <li className="flex gap-2"><Check size={14} aria-hidden className="mt-0.5 shrink-0 text-[var(--color-success-fg)]" />Match them to {first}&apos;s applications in BenchQ</li>
              </ul>
              {connect.error ? <p role="alert" className="mt-3 text-sm text-[var(--color-danger-fg)]">{connect.error.message}</p> : null}
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setStep("intro")}>Cancel</Button>
                <Button onClick={allow}>Allow access</Button>
              </div>
            </div>
          ) : (
            <ol className="space-y-2.5" aria-live="polite">
              {stages.map((label, i) => {
                const isDone = stage > i || (i === 3 && isFinished);
                const isActive = !isDone && stage === i;
                return (
                  <li key={i} className={cn("flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 text-sm transition-colors", isActive ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)] text-[var(--color-text)]" : isDone ? "border-[var(--color-border)] text-[var(--color-text)]" : "border-[var(--color-border)] text-[var(--color-text-3)]")}>
                    <span aria-hidden className={cn("inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-full)]", isDone ? "bg-[var(--color-success-bg)] text-[var(--color-success-fg)]" : "")}>
                      {isDone ? <Check size={12} /> : isActive ? <LoaderCircle size={14} className="animate-spin text-[var(--color-primary)]" /> : <span className="h-1.5 w-1.5 rounded-[var(--radius-full)] bg-[var(--color-border-strong)]" />}
                    </span>
                    {label}
                  </li>
                );
              })}
            </ol>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
