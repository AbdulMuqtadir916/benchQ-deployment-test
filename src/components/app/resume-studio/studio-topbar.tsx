"use client";

import { useEffect, useState } from "react";
import { CloudCheck, Download, FileCheck2, FileUser, LoaderCircle, Lock, Sparkles, X } from "lucide-react";
import type { ResumeDocument } from "@/lib/schemas/resume-document";
import type { ExportGate } from "@/lib/schemas/resume";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { useStudio } from "./studio-store";
import { useDocActions } from "./use-doc-actions";
import { ModeSwitch } from "./mode-switch";

interface StudioTopbarProps {
  doc: ResumeDocument;
  subtitle: string;
  gate: ExportGate;
  canEdit: boolean;
  isTailoring: boolean;
  onClose: () => void;
  onTailor: () => void;
  onExport: () => void;
}

export function StudioTopbar({ doc, subtitle, gate, canEdit, isTailoring, onClose, onTailor, onExport }: StudioTopbarProps) {
  const a = useDocActions();
  const Icon = doc.isMaster ? FileUser : FileCheck2;

  return (
    <header className="grid min-h-14 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <button type="button" onClick={onClose} aria-label="Close resume" title="Close  Esc" className="bq-secondary inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)]">
          <X size={15} aria-hidden />
        </button>
        <span className="h-5 w-px shrink-0 bg-[var(--color-border)]" aria-hidden />
        <span aria-hidden className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-subtle)] text-[var(--color-primary-subtle-fg)] sm:inline-flex">
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <input
              value={doc.name}
              onChange={(e) => a.setTop("name", e.target.value)}
              readOnly={!canEdit}
              aria-label="Resume name"
              className="min-w-0 max-w-64 truncate rounded-[var(--radius-sm)] bg-transparent px-1 text-h3 text-[var(--color-text)] hover:bg-[var(--color-surface-2)] focus-visible:bg-[var(--color-surface-2)]"
            />
            <Tag tone={doc.isMaster ? "blue" : "teal"} className="hidden sm:inline-flex">{doc.isMaster ? "Master" : "Tailored"}</Tag>
          </div>
          <p className="hidden truncate px-1 text-caption text-[var(--color-text-3)] md:block">{subtitle}</p>
        </div>
      </div>

      <ModeSwitch />

      <div className="flex min-w-0 items-center justify-end gap-2">
        <SaveStatus />
        {canEdit ? (
          <Button variant="secondary" size="sm" onClick={onTailor} disabled={isTailoring} className="hidden md:inline-flex">
            {isTailoring ? <LoaderCircle size={14} className="animate-spin" aria-hidden /> : <Sparkles size={14} aria-hidden />}
            Tailor with AI
          </Button>
        ) : null}
        <Button size="sm" onClick={onExport} disabled={!gate.canExport} title={gate.canExport ? "Download as PDF" : (gate.message ?? undefined)}>
          {gate.canExport ? <Download size={14} aria-hidden /> : <Lock size={14} aria-hidden />}
          <span className="hidden sm:inline">Export PDF</span>
        </Button>
      </div>
    </header>
  );
}

/** Simulated autosave — every edit reads "Saving…" for a beat, then "Saved". */
function SaveStatus() {
  const savedAt = useStudio((s) => s.savedAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 400);
    return () => clearInterval(t);
  }, []);

  const isSaving = savedAt !== null && now - savedAt < 700;
  return (
    <span className="hidden items-center gap-1.5 text-sm text-[var(--color-text-3)] lg:inline-flex" aria-live="polite">
      {isSaving ? <LoaderCircle size={13} className="animate-spin" aria-hidden /> : <CloudCheck size={14} aria-hidden />}
      {isSaving ? "Saving…" : "Saved"}
    </span>
  );
}
