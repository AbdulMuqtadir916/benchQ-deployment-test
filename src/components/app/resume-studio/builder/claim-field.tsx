"use client";

import { ShieldCheck, X } from "lucide-react";
import type { RichClaim } from "@/lib/schemas/resume-document";
import { ClaimChip } from "@/components/app/claim-chip";
import { Button } from "@/components/ui/button";
import { EditableText } from "../editable-text";
import { useDocActions } from "../use-doc-actions";

interface ClaimFieldProps {
  claim: RichClaim;
  label: string;
  placeholder?: string;
  onRemove?: () => void;
  onEnter?: () => void;
  onBackspaceEmpty?: () => void;
}

/** A rich-text claim in Builder mode: the text, its verification state, and the verify action. */
export function ClaimField({ claim, label, placeholder, onRemove, onEnter, onBackspaceEmpty }: ClaimFieldProps) {
  const a = useDocActions();
  const isContradicted = claim.state === "CONTRADICTED";

  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <EditableText
          rich
          className={isContradicted ? "bq-rich-field text-body text-[var(--color-text-3)] line-through" : "bq-rich-field text-body"}
          value={claim.html}
          onChange={(v) => a.setClaimHtml(claim.id, v)}
          label={label}
          placeholder={placeholder}
          claimId={claim.id}
          claimState={claim.state}
          onEnter={onEnter}
          onBackspaceEmpty={onBackspaceEmpty}
        />
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <ClaimChip state={claim.state} reason={claim.note ?? undefined} />
          {claim.state === "UNVERIFIED" ? (
            <>
              <span className="min-w-0 flex-1 text-caption text-[var(--color-text-3)]">{claim.note ?? "No evidence attached yet."}</span>
              <Button size="sm" variant="subtle" onClick={() => a.setClaimState(claim.id, "VERIFIED")} title="Attach evidence from the candidate record and mark verified">
                <ShieldCheck size={13} aria-hidden />
                Verify with evidence
              </Button>
            </>
          ) : null}
          {isContradicted ? <span className="text-caption text-[var(--color-contradicted-fg)]">Conflicts with the record — left out of the PDF.</span> : null}
        </div>
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label.toLowerCase()}`}
          className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-3)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-fg)]"
        >
          <X size={14} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
