"use client";

import type { ResumeDocument } from "@/lib/schemas/resume-document";
import { newClaim, newId } from "@/lib/resume-doc/build";
import { Input } from "@/components/ui/input";
import { useDocActions } from "../use-doc-actions";
import { AddButton, EmptyHint, RowControls, TextField, moveHandlers } from "./fields";
import { ClaimField } from "./claim-field";

const card = "rounded-[var(--radius-md)] border border-[var(--color-border)] p-3";

export function SkillsFields({ doc }: { doc: ResumeDocument }) {
  const a = useDocActions();
  return (
    <>
      {doc.skills.length === 0 ? <EmptyHint title="No skills yet" /> : null}
      <ul className="space-y-2">
        {doc.skills.map((row, i) => (
          <li key={row.id} className="flex items-center gap-2">
            <Input className="w-36 shrink-0 font-[550]" aria-label={`Skill category ${i + 1}`} value={row.category} onChange={(e) => a.patch("skills", row.id, { category: e.target.value })} placeholder="Category" />
            <Input aria-label={`Skills in ${row.category || `row ${i + 1}`}`} value={row.items} onChange={(e) => a.patch("skills", row.id, { items: e.target.value })} placeholder="Java, Spring Boot, Kafka" />
            <RowControls label={`${row.category || "skill"} row`} onRemove={() => a.remove("skills", row.id)} {...moveHandlers(i, doc.skills.length, (d) => a.move("skills", row.id, d))} />
          </li>
        ))}
      </ul>
      <AddButton onClick={() => a.add("skills", { id: newId("skills"), category: "", items: "" })}>Add skill row</AddButton>
    </>
  );
}

export function EducationFields({ doc }: { doc: ResumeDocument }) {
  const a = useDocActions();
  return (
    <>
      {doc.education.length === 0 ? <EmptyHint title="No education yet" /> : null}
      {doc.education.map((e) => (
        <div key={e.id} className={card}>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="School" value={e.school} onChange={(v) => a.patch("education", e.id, { school: v })} />
            <TextField label="Location" value={e.location} onChange={(v) => a.patch("education", e.id, { location: v })} />
            <TextField label="Degree" value={e.degree} onChange={(v) => a.patch("education", e.id, { degree: v })} />
            <TextField label="Years" value={e.years} onChange={(v) => a.patch("education", e.id, { years: v })} placeholder="2015 – 2019" />
          </div>
          <div className="mt-2 flex justify-end">
            <button type="button" onClick={() => a.remove("education", e.id)} className="text-sm text-[var(--color-text-3)] hover:text-[var(--color-danger-fg)]">Remove</button>
          </div>
        </div>
      ))}
      <AddButton onClick={() => a.add("education", { id: newId("edu"), school: "", location: "", degree: "", years: "" })}>Add education</AddButton>
    </>
  );
}

export function CertificationFields({ doc }: { doc: ResumeDocument }) {
  const a = useDocActions();
  return (
    <>
      {doc.certifications.length === 0 ? <EmptyHint title="No certifications yet" /> : null}
      <ul className="space-y-2">
        {doc.certifications.map((c, i) => (
          <li key={c.id} className="flex items-center gap-2">
            <Input aria-label={`Certification ${i + 1} name`} value={c.name} onChange={(e) => a.patch("certifications", c.id, { name: e.target.value })} placeholder="AWS Solutions Architect" />
            <Input className="w-32 shrink-0" aria-label={`Certification ${i + 1} issuer`} value={c.issuer} onChange={(e) => a.patch("certifications", c.id, { issuer: e.target.value })} placeholder="Issuer" />
            <Input className="w-16 shrink-0" aria-label={`Certification ${i + 1} year`} value={c.year} onChange={(e) => a.patch("certifications", c.id, { year: e.target.value })} placeholder="Year" />
            <RowControls label={c.name || "certification"} onRemove={() => a.remove("certifications", c.id)} />
          </li>
        ))}
      </ul>
      <AddButton onClick={() => a.add("certifications", { id: newId("cert"), name: "", issuer: "", year: "" })}>Add certification</AddButton>
    </>
  );
}

export function ProjectFields({ doc }: { doc: ResumeDocument }) {
  const a = useDocActions();
  return (
    <>
      {doc.projects.length === 0 ? <EmptyHint title="No projects yet" /> : null}
      {doc.projects.map((p) => (
        <div key={p.id} className={`${card} space-y-3`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Project name" value={p.name} onChange={(v) => a.patch("projects", p.id, { name: v })} />
            <TextField label="Link" value={p.link} onChange={(v) => a.patch("projects", p.id, { link: v })} placeholder="github.com/… (optional)" />
          </div>
          <ClaimField claim={p.description} label="Project description" placeholder="What it does and the result" onRemove={() => a.remove("projects", p.id)} />
        </div>
      ))}
      <AddButton onClick={() => a.add("projects", { id: newId("proj"), name: "", link: "", description: newClaim() })}>Add project</AddButton>
    </>
  );
}
