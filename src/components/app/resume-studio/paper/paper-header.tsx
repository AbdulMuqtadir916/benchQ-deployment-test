"use client";

import type { ReactNode } from "react";
import type { ResumeDocument } from "@/lib/schemas/resume-document";
import { EditableText } from "../editable-text";
import { useDocActions } from "../use-doc-actions";

export function PaperName({ doc, editable, children }: { doc: ResumeDocument; editable: boolean; children?: ReactNode }) {
  const a = useDocActions();
  return (
    <header className="rt-header" data-rt-section="header">
      <EditableText className="rt-name" value={doc.fullName} onChange={(v) => a.setTop("fullName", v)} editable={editable} label="Full name" />
      {editable || doc.title ? (
        <EditableText className="rt-title" value={doc.title} onChange={(v) => a.setTop("title", v)} editable={editable} label="Title" placeholder="Headline, e.g. Senior Java Developer" />
      ) : null}
      {children}
    </header>
  );
}

export function PaperContacts({ doc, editable }: { doc: ResumeDocument; editable: boolean }) {
  const a = useDocActions();
  const contacts = doc.contacts.filter((c) => editable || c.label.trim());
  if (!contacts.length) return null;
  return (
    <div className="rt-contacts">
      {contacts.map((c) => (
        <span key={c.id} className="rt-contact">
          <EditableText value={c.label} onChange={(v) => a.patch("contacts", c.id, { label: v })} editable={editable} label="Contact item" />
        </span>
      ))}
    </div>
  );
}
