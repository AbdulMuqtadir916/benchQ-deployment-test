import type { ResumeVersion, ExportGate } from "@/lib/schemas/resume";
import type { ResumeDocument } from "@/lib/schemas/resume-document";
import type { ClaimState } from "@/lib/schemas/enums";
import { allClaims } from "@/lib/resume-doc/ops";
import { isBlank } from "@/lib/resume-doc/rich-text";

/**
 * The export gate. CLAUDE.md hard rule: a resume with ANY unverified claim
 * cannot be exported. Contradicted claims are reported but never ship either.
 */
export function deriveGateFromClaims(claims: Array<{ id: string; state: ClaimState }>): ExportGate {
  const unverified = claims.filter((c) => c.state === "UNVERIFIED");
  const contradicted = claims.filter((c) => c.state === "CONTRADICTED");

  let message: string | null = null;
  if (unverified.length > 0) {
    message = `${unverified.length} unverified claim${
      unverified.length === 1 ? "" : "s"
    } need${unverified.length === 1 ? "s" : ""} evidence before export.`;
  }

  return {
    canExport: unverified.length === 0,
    unverifiedCount: unverified.length,
    contradictedCount: contradicted.length,
    blockingClaimIds: unverified.map((c) => c.id),
    message,
  };
}

export function deriveExportGate(version: ResumeVersion): ExportGate {
  return deriveGateFromClaims(version.claims);
}

/** Gate for the builder's working document. Blank claims are left out of the PDF, so they don't block. */
export function deriveDocumentGate(doc: ResumeDocument): ExportGate {
  return deriveGateFromClaims(allClaims(doc).map((c) => c.claim).filter((c) => !isBlank(c.html)));
}
