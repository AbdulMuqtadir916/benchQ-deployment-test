"use client";

import { useMemo } from "react";
import type { ClaimState } from "@/lib/schemas/enums";
import type { ResumeDocument, ResumeListKey, RichClaim } from "@/lib/schemas/resume-document";
import { addBullet, addEntry, moveEntry, patchEntry, removeBullet, removeEntry, setClaimState, updateClaim } from "@/lib/resume-doc/ops";
import { useStudio } from "./studio-store";

type TopField = "fullName" | "title" | "name";

/** Document edits bound to the studio store — one place both modes write through. */
export function useDocActions() {
  const update = useStudio((s) => s.update);
  return useMemo(
    () => ({
      setTop: (key: TopField, value: string) => update((d) => ({ ...d, [key]: value })),
      patch: <K extends ResumeListKey>(key: K, id: string, p: Partial<ResumeDocument[K][number]>) => update((d) => patchEntry(d, key, id, p)),
      add: <K extends ResumeListKey>(key: K, entry: ResumeDocument[K][number]) => update((d) => addEntry(d, key, entry)),
      remove: (key: ResumeListKey, id: string) => update((d) => removeEntry(d, key, id)),
      move: (key: ResumeListKey, id: string, dir: -1 | 1) => update((d) => moveEntry(d, key, id, dir)),
      setClaimHtml: (claimId: string, html: string) => update((d) => updateClaim(d, claimId, (c) => ({ ...c, html }))),
      setClaimState: (claimId: string, state: ClaimState, note: string | null = null) => update((d) => setClaimState(d, claimId, state, note)),
      addBullet: (experienceId: string, bullet: RichClaim, afterId?: string) => update((d) => addBullet(d, experienceId, bullet, afterId)),
      removeBullet: (experienceId: string, bulletId: string) => update((d) => removeBullet(d, experienceId, bulletId)),
    }),
    [update],
  );
}
