import { Award, Briefcase, File, FileText, GraduationCap, IdCard, Stamp, type LucideIcon } from "lucide-react";
import { format } from "date-fns";
import type { CandidateDocument, DocumentKind } from "@/lib/schemas/document";
import type { TagTone } from "@/components/ui/tag";

/** Display order mirrors how often vendors ask for each: visa first, always. */
export const KIND_META: Record<DocumentKind, { label: string; Icon: LucideIcon; hasExpiry: boolean }> = {
  WORK_AUTH: { label: "Work authorization", Icon: Stamp, hasExpiry: true },
  IDENTITY: { label: "Identity", Icon: IdCard, hasExpiry: true },
  RESUME: { label: "Resumes", Icon: FileText, hasExpiry: false },
  CERTIFICATION: { label: "Certifications", Icon: Award, hasExpiry: true },
  EDUCATION: { label: "Education", Icon: GraduationCap, hasExpiry: false },
  EMPLOYMENT: { label: "Employment letters", Icon: Briefcase, hasExpiry: false },
  OTHER: { label: "Other", Icon: File, hasExpiry: false },
};
export const KIND_ORDER = Object.keys(KIND_META) as DocumentKind[];

/** Expired, expiring within 60 days, or valid — with the tone to show it in. */
export function expiryStatus(doc: CandidateDocument, now: number): { label: string; tone: TagTone } | null {
  if (!doc.expiresAt) return null;
  const days = Math.ceil((new Date(doc.expiresAt).getTime() - now) / 86_400_000);
  if (days < 0) return { label: "Expired", tone: "red" };
  if (days <= 60) return { label: `Expires in ${days} ${days === 1 ? "day" : "days"}`, tone: "amber" };
  return { label: `Valid to ${format(new Date(doc.expiresAt), "MMM yyyy")}`, tone: "green" };
}

const RULES: Array<[RegExp, DocumentKind]> = [
  [/i-?797|h-?1b|h4|ead|opt|cpt|i-?20|i-?94|visa|green.?card|gc\b/i, "WORK_AUTH"],
  [/passport|licen[cs]e|\bdl\b|\bid\b|ssn|state.?id/i, "IDENTITY"],
  [/resume|\bcv\b/i, "RESUME"],
  [/cert|aws|azure|gcp|pmp|scrum|cka|ckad|salesforce/i, "CERTIFICATION"],
  [/degree|diploma|transcript|bachelor|master|mba|b\.?tech|m\.?s\b/i, "EDUCATION"],
  [/offer|relieving|experience.?letter|pay.?stub|payslip|w-?2|1099/i, "EMPLOYMENT"],
];

/** Best guess from the file name; the BDE can change it before saving. */
export function detectKind(fileName: string): DocumentKind {
  return RULES.find(([pattern]) => pattern.test(fileName))?.[1] ?? "OTHER";
}

export function titleFromFile(fileName: string): string {
  return fileName.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " ").trim();
}

export function formatSize(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}
