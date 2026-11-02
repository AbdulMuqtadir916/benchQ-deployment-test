"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { deriveDocumentGate } from "@/lib/derive";
import { EASE_OUT } from "@/lib/motion";
import { BuilderPanel } from "./builder/builder-panel";
import { PreviewPane } from "./preview/preview-pane";
import { StudioTopbar } from "./studio-topbar";
import { StatusBar } from "./status-bar";
import { ViewerOutline } from "./viewer-outline";
import { SelectionToolbar } from "./selection-toolbar";
import { useTailorRun } from "./tailor-run";
import { usePrintExport } from "./print-export";
import { stepTemplate } from "./templates";
import { useStudio } from "./studio-store";

/** True when a key press belongs to a text field rather than to the studio. */
function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

/**
 * The full-screen resume workspace — no app sidebar or top nav, so the page
 * gets all the room. Builder mode: section forms left, live page right.
 * Viewer mode: the page itself, editable in place.
 */
export function ResumeStudio({ subtitle, canEdit, onClose }: { subtitle: string; canEdit: boolean; onClose: () => void }) {
  const doc = useStudio((s) => s.doc);
  const mode = useStudio((s) => s.mode);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const tailor = useTailorRun();
  const exporter = usePrintExport(doc);
  const gate = useMemo(() => (doc ? deriveDocumentGate(doc) : null), [doc]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || isTyping(e.target)) return;
      if (e.key === "Escape") onClose();
      if (e.key === "[" || e.key === "]") {
        const { doc: current, setTemplate } = useStudio.getState();
        if (current) setTemplate(stepTemplate(current.templateId, e.key === "]" ? 1 : -1).id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!doc || !gate) return null;
  const isEditable = canEdit && mode === "view";

  return (
    <motion.div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${doc.name} — ${doc.fullName}`}
      initial={reduce ? false : { opacity: 0, scale: 0.985, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.26, ease: EASE_OUT }}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg)]"
    >
      <StudioTopbar
        doc={doc}
        subtitle={subtitle}
        gate={gate}
        canEdit={canEdit}
        isTailoring={tailor.isRunning}
        onClose={onClose}
        onTailor={tailor.start}
        onExport={exporter.print}
      />

      <div className="flex min-h-0 flex-1">
        {mode === "build" ? (
          <>
            <div className="w-full shrink-0 overflow-y-auto bg-[var(--color-bg-subtle)] p-3 sm:p-4 lg:w-[44%] lg:max-w-2xl lg:border-r lg:border-[var(--color-border)]">
              {canEdit ? <BuilderPanel doc={doc} /> : <p className="p-4 text-body text-[var(--color-text-3)]">You have view-only access to this resume.</p>}
            </div>
            <div className="hidden min-w-0 flex-1 lg:flex">
              <PreviewPane doc={doc} />
            </div>
          </>
        ) : (
          <>
            <ViewerOutline doc={doc} />
            <PreviewPane doc={doc} editable={isEditable} />
          </>
        )}
      </div>

      <StatusBar doc={doc} gate={gate} />
      {isEditable || (canEdit && mode === "build") ? <SelectionToolbar scopeRef={rootRef} /> : null}
      {tailor.panel}
      {exporter.portal}
    </motion.div>
  );
}
