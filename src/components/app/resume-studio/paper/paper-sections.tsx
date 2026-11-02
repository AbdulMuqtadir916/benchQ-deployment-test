"use client";

import type { ReactNode } from "react";
import type { ResumeDocument, ResumeSectionKey, RichClaim } from "@/lib/schemas/resume-document";
import { newClaim } from "@/lib/resume-doc/build";
import { isBlank } from "@/lib/resume-doc/rich-text";
import { EditableText } from "../editable-text";
import { useDocActions } from "../use-doc-actions";
import { useStudio } from "../studio-store";

type BlockProps = { doc: ResumeDocument; editable: boolean };

/** Contradicted claims never reach the page; blank ones only show while editing. */
const shows = (c: RichClaim, editable: boolean) => c.state !== "CONTRADICTED" && (editable || !isBlank(c.html));

function Section({ id, title, children }: { id: ResumeSectionKey; title: string; children: ReactNode }) {
  return (
    <section className="rt-section" data-rt-section={id}>
      <h2 className="rt-h">{title}</h2>
      {children}
    </section>
  );
}

export function PaperSummary({ doc, editable }: BlockProps) {
  const a = useDocActions();
  if (!shows(doc.summary, editable)) return null;
  return (
    <Section id="summary" title="Summary">
      <EditableText as="p" rich value={doc.summary.html} onChange={(v) => a.setClaimHtml(doc.summary.id, v)} editable={editable} label="Summary" claimId={doc.summary.id} claimState={doc.summary.state} />
    </Section>
  );
}

export function PaperExperience({ doc, editable }: BlockProps) {
  const a = useDocActions();
  const requestFocus = useStudio((s) => s.requestFocus);
  if (!doc.experience.length) return null;
  return (
    <Section id="experience" title="Experience">
      {doc.experience.map((e) => (
        <div key={e.id} className="rt-entry">
          <div className="rt-entry-head">
            <EditableText className="rt-role" value={e.title} onChange={(v) => a.patch("experience", e.id, { title: v })} editable={editable} label="Job title" />
            <EditableText className="rt-meta" value={e.dates} onChange={(v) => a.patch("experience", e.id, { dates: v })} editable={editable} label="Dates" />
          </div>
          <div className="rt-entry-head">
            <EditableText className="rt-org" value={e.company} onChange={(v) => a.patch("experience", e.id, { company: v })} editable={editable} label="Company" />
            {editable || e.location ? <EditableText className="rt-meta" value={e.location} onChange={(v) => a.patch("experience", e.id, { location: v })} editable={editable} label="Location" /> : null}
          </div>
          {e.description ? <EditableText className="rt-desc" value={e.description} onChange={(v) => a.patch("experience", e.id, { description: v })} editable={editable} label="Role description" /> : null}
          <ul className="rt-bullets">
            {e.bullets.filter((b) => shows(b, editable)).map((b) => (
              <EditableText
                key={b.id}
                as="li"
                rich
                value={b.html}
                onChange={(v) => a.setClaimHtml(b.id, v)}
                editable={editable}
                label="Bullet"
                placeholder="Describe an outcome"
                claimId={b.id}
                claimState={b.state}
                onEnter={() => {
                  const next = newClaim();
                  a.addBullet(e.id, next, b.id);
                  requestFocus(next.id);
                }}
                onBackspaceEmpty={() => a.removeBullet(e.id, b.id)}
              />
            ))}
          </ul>
        </div>
      ))}
    </Section>
  );
}

export function PaperSkills({ doc, editable }: BlockProps) {
  const a = useDocActions();
  if (!doc.skills.length) return null;
  return (
    <Section id="skills" title="Skills">
      {doc.skills.map((row) => (
        <div key={row.id} className="rt-skill-row">
          <EditableText className="rt-skill-cat" value={row.category} onChange={(v) => a.patch("skills", row.id, { category: v })} editable={editable} label="Skill category" />
          <span className="rt-skill-sep">: </span>
          <EditableText value={row.items} onChange={(v) => a.patch("skills", row.id, { items: v })} editable={editable} label="Skills" />
        </div>
      ))}
    </Section>
  );
}

export function PaperEducation({ doc, editable }: BlockProps) {
  const a = useDocActions();
  if (!doc.education.length) return null;
  return (
    <Section id="education" title="Education">
      {doc.education.map((e) => (
        <div key={e.id} className="rt-entry">
          <div className="rt-entry-head">
            <EditableText className="rt-role" value={e.school} onChange={(v) => a.patch("education", e.id, { school: v })} editable={editable} label="School" />
            <EditableText className="rt-meta" value={e.years} onChange={(v) => a.patch("education", e.id, { years: v })} editable={editable} label="Years" />
          </div>
          <div className="rt-entry-head">
            <EditableText className="rt-org" value={e.degree} onChange={(v) => a.patch("education", e.id, { degree: v })} editable={editable} label="Degree" />
            {editable || e.location ? <EditableText className="rt-meta" value={e.location} onChange={(v) => a.patch("education", e.id, { location: v })} editable={editable} label="Location" /> : null}
          </div>
        </div>
      ))}
    </Section>
  );
}

export function PaperCertifications({ doc, editable }: BlockProps) {
  const a = useDocActions();
  if (!doc.certifications.length) return null;
  return (
    <Section id="certifications" title="Certifications">
      {doc.certifications.map((c) => (
        <div key={c.id} className="rt-entry-head">
          <span>
            <EditableText className="rt-role" value={c.name} onChange={(v) => a.patch("certifications", c.id, { name: v })} editable={editable} label="Certification" />
            {editable || c.issuer ? <>{" · "}<EditableText className="rt-org" value={c.issuer} onChange={(v) => a.patch("certifications", c.id, { issuer: v })} editable={editable} label="Issuer" /></> : null}
          </span>
          <EditableText className="rt-meta" value={c.year} onChange={(v) => a.patch("certifications", c.id, { year: v })} editable={editable} label="Year" />
        </div>
      ))}
    </Section>
  );
}

export function PaperProjects({ doc, editable }: BlockProps) {
  const a = useDocActions();
  if (!doc.projects.length) return null;
  return (
    <Section id="projects" title="Projects">
      {doc.projects.map((p) => (
        <div key={p.id} className="rt-entry">
          <div className="rt-entry-head">
            <EditableText className="rt-role" value={p.name} onChange={(v) => a.patch("projects", p.id, { name: v })} editable={editable} label="Project name" />
            {editable || p.link ? <EditableText className="rt-meta" value={p.link} onChange={(v) => a.patch("projects", p.id, { link: v })} editable={editable} label="Project link" /> : null}
          </div>
          {shows(p.description, editable) ? (
            <EditableText as="p" rich value={p.description.html} onChange={(v) => a.setClaimHtml(p.description.id, v)} editable={editable} label="Project description" claimId={p.description.id} claimState={p.description.state} />
          ) : null}
        </div>
      ))}
    </Section>
  );
}
