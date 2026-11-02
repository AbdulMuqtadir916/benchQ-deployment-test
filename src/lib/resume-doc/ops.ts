import type { ResumeDocument, ResumeListKey, RichClaim } from "@/lib/schemas/resume-document";
import type { ClaimState } from "@/lib/schemas/enums";

/** Pure, immutable edits on the builder document. The store wires these to state. */

type Entry<K extends ResumeListKey> = ResumeDocument[K][number];

export function patchEntry<K extends ResumeListKey>(doc: ResumeDocument, key: K, id: string, patch: Partial<Entry<K>>): ResumeDocument {
  const list = doc[key] as Entry<K>[];
  return { ...doc, [key]: list.map((e) => (e.id === id ? { ...e, ...patch } : e)) };
}

export function addEntry<K extends ResumeListKey>(doc: ResumeDocument, key: K, entry: Entry<K>): ResumeDocument {
  return { ...doc, [key]: [...(doc[key] as Entry<K>[]), entry] };
}

export function removeEntry(doc: ResumeDocument, key: ResumeListKey, id: string): ResumeDocument {
  return { ...doc, [key]: (doc[key] as Array<{ id: string }>).filter((e) => e.id !== id) };
}

export function moveEntry(doc: ResumeDocument, key: ResumeListKey, id: string, dir: -1 | 1): ResumeDocument {
  const list = [...(doc[key] as Array<{ id: string }>)];
  const from = list.findIndex((e) => e.id === id);
  const to = from + dir;
  if (from < 0 || to < 0 || to >= list.length) return doc;
  [list[from], list[to]] = [list[to]!, list[from]!];
  return { ...doc, [key]: list };
}

/** Every claim in the document, in reading order. */
export function allClaims(doc: ResumeDocument): Array<{ claim: RichClaim; section: "summary" | "experience" | "projects"; entryId: string | null }> {
  return [
    { claim: doc.summary, section: "summary" as const, entryId: null },
    ...doc.experience.flatMap((e) => e.bullets.map((claim) => ({ claim, section: "experience" as const, entryId: e.id }))),
    ...doc.projects.map((p) => ({ claim: p.description, section: "projects" as const, entryId: p.id })),
  ];
}

/** Apply `fn` to the claim with this id, wherever it lives. */
export function updateClaim(doc: ResumeDocument, claimId: string, fn: (c: RichClaim) => RichClaim): ResumeDocument {
  if (doc.summary.id === claimId) return { ...doc, summary: fn(doc.summary) };
  return {
    ...doc,
    experience: doc.experience.map((e) =>
      e.bullets.some((b) => b.id === claimId) ? { ...e, bullets: e.bullets.map((b) => (b.id === claimId ? fn(b) : b)) } : e,
    ),
    projects: doc.projects.map((p) => (p.description.id === claimId ? { ...p, description: fn(p.description) } : p)),
  };
}

export function setClaimState(doc: ResumeDocument, claimId: string, state: ClaimState, note: string | null): ResumeDocument {
  return updateClaim(doc, claimId, (c) => ({
    ...c,
    state,
    note,
    // A claim is only VERIFIED with evidence attached — never without an id.
    evidenceId: state === "VERIFIED" ? (c.evidenceId ?? `ev_manual_${c.id}`) : c.evidenceId,
  }));
}

/** Append a bullet, or insert it right after `afterId` (Enter in the inline editor). */
export function addBullet(doc: ResumeDocument, experienceId: string, bullet: RichClaim, afterId?: string): ResumeDocument {
  return {
    ...doc,
    experience: doc.experience.map((e) => {
      if (e.id !== experienceId) return e;
      const at = afterId ? e.bullets.findIndex((b) => b.id === afterId) + 1 : e.bullets.length;
      const bullets = [...e.bullets];
      bullets.splice(at > 0 ? at : bullets.length, 0, bullet);
      return { ...e, bullets };
    }),
  };
}

export function removeBullet(doc: ResumeDocument, experienceId: string, bulletId: string): ResumeDocument {
  return {
    ...doc,
    experience: doc.experience.map((e) => (e.id === experienceId ? { ...e, bullets: e.bullets.filter((b) => b.id !== bulletId) } : e)),
  };
}
