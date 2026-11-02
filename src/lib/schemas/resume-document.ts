import { z } from "zod";
import { ClaimState } from "./enums";

/**
 * The resume builder's working document — a client-side view model composed
 * from Resume + ResumeVersion + Candidate + Record (see lib/resume-doc/build.ts).
 * Every statement a client could fact-check is a RichClaim and carries a
 * verification state; everything else is plain text.
 */
export const RichClaimSchema = z.object({
  id: z.string(),
  /** Sanitised inline HTML — only b / i / u / br survive (lib/resume-doc/rich-text.ts). */
  html: z.string(),
  state: ClaimState,
  evidenceId: z.string().nullable(),
  note: z.string().nullable(),
});
export type RichClaim = z.infer<typeof RichClaimSchema>;

export const ContactItemSchema = z.object({ id: z.string(), label: z.string(), url: z.string() });
export type ContactItem = z.infer<typeof ContactItemSchema>;

export const ExperienceEntrySchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  location: z.string(),
  dates: z.string(),
  description: z.string(),
  bullets: z.array(RichClaimSchema),
});
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;

export const SkillRowSchema = z.object({ id: z.string(), category: z.string(), items: z.string() });
export type SkillRow = z.infer<typeof SkillRowSchema>;

export const EducationEntrySchema = z.object({
  id: z.string(),
  school: z.string(),
  location: z.string(),
  degree: z.string(),
  years: z.string(),
});
export type EducationEntry = z.infer<typeof EducationEntrySchema>;

export const CertificationEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  year: z.string(),
});
export type CertificationEntry = z.infer<typeof CertificationEntrySchema>;

export const ProjectEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  link: z.string(),
  description: RichClaimSchema,
});
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;

export const ResumeSectionKey = z.enum([
  "header",
  "summary",
  "experience",
  "skills",
  "education",
  "certifications",
  "projects",
]);
export type ResumeSectionKey = z.infer<typeof ResumeSectionKey>;

/** Sections that are arrays of entries with an id — the generic list ops work on these. */
export type ResumeListKey = "contacts" | "experience" | "skills" | "education" | "certifications" | "projects";

export const ResumeDocumentSchema = z.object({
  resumeId: z.string(),
  candidateId: z.string(),
  name: z.string(),
  isMaster: z.boolean(),
  templateId: z.string(),
  fullName: z.string(),
  title: z.string(),
  contacts: z.array(ContactItemSchema),
  summary: RichClaimSchema,
  experience: z.array(ExperienceEntrySchema),
  skills: z.array(SkillRowSchema),
  education: z.array(EducationEntrySchema),
  certifications: z.array(CertificationEntrySchema),
  projects: z.array(ProjectEntrySchema),
});
export type ResumeDocument = z.infer<typeof ResumeDocumentSchema>;

/** AI text actions offered on a text selection. Output always lands UNVERIFIED. */
export const RewriteAction = z.enum(["improve", "concise", "quantify", "grammar"]);
export type RewriteAction = z.infer<typeof RewriteAction>;

export const RewriteInputSchema = z.object({ text: z.string().min(1), action: RewriteAction });
export type RewriteInput = z.infer<typeof RewriteInputSchema>;

export const RewriteResultSchema = z.object({ text: z.string(), note: z.string() });
export type RewriteResult = z.infer<typeof RewriteResultSchema>;
