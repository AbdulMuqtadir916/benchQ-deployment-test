import { format } from "date-fns";
import type { Candidate } from "@/lib/schemas/candidate";
import type { Record_ } from "@/lib/schemas/record";
import type { Resume, ResumeClaim } from "@/lib/schemas/resume";
import type { ClaimState } from "@/lib/schemas/enums";
import type { ResumeDocument, RichClaim } from "@/lib/schemas/resume-document";
import { escapeHtml } from "./rich-text";

let seq = 0;
/** Client-side ids for entries the user adds while editing. */
export function newId(prefix: string): string {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}${seq}`;
}

export function newClaim(html = "", state: ClaimState = "UNVERIFIED", note: string | null = null): RichClaim {
  return { id: newId("claim"), html, state, evidenceId: null, note };
}

function fromClaim(c: ResumeClaim): RichClaim {
  return { id: c.id, html: escapeHtml(c.text), state: c.state, evidenceId: c.evidenceId, note: c.reason };
}

function monthYear(iso: string | null): string {
  return iso ? format(new Date(iso), "MMM yyyy") : "";
}

function contactsFor(candidate: Candidate | undefined) {
  if (!candidate) return [];
  const place = [candidate.city, candidate.state].filter(Boolean).join(", ");
  const linkedin = candidate.linkedinUrl?.replace(/^https?:\/\/(www\.)?/, "") ?? null;
  return [
    place ? { id: "contact_location", label: place, url: "" } : null,
    candidate.phone ? { id: "contact_phone", label: candidate.phone, url: `tel:${candidate.phone}` } : null,
    candidate.email ? { id: "contact_email", label: candidate.email, url: `mailto:${candidate.email}` } : null,
    linkedin ? { id: "contact_linkedin", label: linkedin, url: candidate.linkedinUrl ?? "" } : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null);
}

/** Compose the builder document from the resume's latest version and the candidate's Record. */
export function buildResumeDocument(resume: Resume, candidate: Candidate | undefined, record: Record_ | undefined): ResumeDocument {
  const version = resume.versions.find((v) => v.id === resume.latestVersionId) ?? resume.versions[0];
  const claims = version?.claims ?? [];
  const summaryClaim = claims.find((c) => c.section === "summary");

  const experience = (record?.experiences ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((exp) => {
      const expClaims = claims
        .filter((c) => c.section === "experience" && c.entityId === exp.id)
        .sort((a, b) => (a.bulletIndex ?? 0) - (b.bulletIndex ?? 0));
      const bullets = expClaims.length
        ? expClaims.map(fromClaim)
        : exp.bullets.map((b) => ({ id: b.id, html: escapeHtml(b.text), state: b.state, evidenceId: b.evidenceId, note: null }));
      return {
        id: exp.id,
        company: exp.company,
        title: exp.title,
        location: exp.location ?? "",
        dates: `${monthYear(exp.startDate)} – ${exp.isCurrent ? "Present" : monthYear(exp.endDate)}`,
        description: exp.technologies.length ? `Stack: ${exp.technologies.join(", ")}` : "",
        bullets,
      };
    });

  const families = new Map<string, string[]>();
  for (const skill of record?.skills ?? []) {
    const key = skill.family ?? "Core";
    families.set(key, [...(families.get(key) ?? []), skill.name]);
  }

  return {
    resumeId: resume.id,
    candidateId: resume.candidateId,
    name: resume.name,
    isMaster: resume.isMaster,
    templateId: version?.templateId ?? resume.templateId,
    fullName: candidate?.fullName ?? "",
    title: candidate?.primaryRole ?? record?.headline ?? "",
    contacts: contactsFor(candidate),
    summary: summaryClaim
      ? fromClaim(summaryClaim)
      : newClaim(escapeHtml(record?.summary ?? ""), record?.summaryState ?? "UNVERIFIED"),
    experience,
    skills: [...families].map(([category, items], i) => ({ id: `skills_${i}`, category, items: items.join(", ") })),
    education: (record?.educations ?? []).map((e) => ({
      id: e.id,
      school: e.institution,
      location: "",
      degree: [e.degree, e.field].filter(Boolean).join(", "),
      years: [e.startDate, e.endDate].map((d) => (d ? format(new Date(d), "yyyy") : "")).filter(Boolean).join(" – "),
    })),
    certifications: (record?.certificates ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer ?? "",
      year: c.issueDate ? format(new Date(c.issueDate), "yyyy") : "",
    })),
    projects: [],
  };
}
