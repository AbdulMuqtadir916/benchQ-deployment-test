"use client";

import type { ResumeDocument } from "@/lib/schemas/resume-document";
import { newId } from "@/lib/resume-doc/build";
import { stripTags } from "@/lib/resume-doc/rich-text";
import { Input } from "@/components/ui/input";
import { useDocActions } from "../use-doc-actions";
import { AddButton, FieldLabel, RowControls, TextField, moveHandlers } from "./fields";
import { ClaimField } from "./claim-field";

export function HeaderFields({ doc }: { doc: ResumeDocument }) {
  const a = useDocActions();
  return (
    <>
      <TextField label="Full name" value={doc.fullName} onChange={(v) => a.setTop("fullName", v)} />
      <TextField label="Title" value={doc.title} onChange={(v) => a.setTop("title", v)} placeholder="Headline, e.g. Senior Java Developer" />
      <div>
        <FieldLabel hint="text · link (optional)">Contact items</FieldLabel>
        <ul className="space-y-2">
          {doc.contacts.map((c, i) => (
            <li key={c.id} className="flex items-center gap-2">
              <Input aria-label={`Contact ${i + 1} text`} value={c.label} onChange={(e) => a.patch("contacts", c.id, { label: e.target.value })} placeholder="e.g. Dallas, TX" />
              <Input aria-label={`Contact ${i + 1} link`} value={c.url} onChange={(e) => a.patch("contacts", c.id, { url: e.target.value })} placeholder="URL (optional)" />
              <RowControls label={`contact ${c.label || i + 1}`} onRemove={() => a.remove("contacts", c.id)} {...moveHandlers(i, doc.contacts.length, (d) => a.move("contacts", c.id, d))} />
            </li>
          ))}
        </ul>
        <div className="mt-2">
          <AddButton onClick={() => a.add("contacts", { id: newId("contact"), label: "", url: "" })}>Add contact item</AddButton>
        </div>
      </div>
    </>
  );
}

export function SummaryFields({ doc }: { doc: ResumeDocument }) {
  const length = stripTags(doc.summary.html).length;
  return (
    <>
      <ClaimField claim={doc.summary} label="Summary" placeholder="Two or three lines on who the candidate is and what they deliver" />
      <p className="tabular text-caption text-[var(--color-text-3)]">{length} characters{length > 450 ? " · recruiters skim — aim for under 450" : ""}</p>
    </>
  );
}
