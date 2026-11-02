import { Bookmark, Calendar, CheckCircle2, Circle, BadgeCheck, MessageCircle, Search, Send, XCircle, type LucideIcon } from "lucide-react";
import type { Application } from "@/lib/schemas/application";
import type { ApplicationStatus } from "@/lib/schemas/enums";
import type { TagTone } from "@/components/ui/tag";

/** One vocabulary for application stages, shared by every board, list and drawer. */
export const PIPELINE: ApplicationStatus[] = ["SAVED", "APPLIED", "RESPONSE", "SCREENING", "INTERVIEW", "OFFER", "PLACED"];
export const CLOSED: ApplicationStatus[] = ["REJECTED", "WITHDRAWN", "EXPIRED"];

export const NEXT_STATUS: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
  SAVED: "APPLIED", APPLIED: "RESPONSE", RESPONSE: "SCREENING", SCREENING: "INTERVIEW", INTERVIEW: "OFFER", OFFER: "PLACED",
};

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  SAVED: "Saved", APPLIED: "Applied", RESPONSE: "Recruiter reply", SCREENING: "Shortlisted", INTERVIEW: "Interview", OFFER: "Offer", PLACED: "Placed", REJECTED: "Rejected", WITHDRAWN: "Withdrawn", EXPIRED: "Expired",
};

export const STATUS_TONE: Record<ApplicationStatus, TagTone> = {
  SAVED: "neutral", APPLIED: "blue", RESPONSE: "violet", SCREENING: "violet", INTERVIEW: "amber", OFFER: "green", PLACED: "teal", REJECTED: "red", WITHDRAWN: "neutral", EXPIRED: "neutral",
};

export const STATUS_ICON: Record<ApplicationStatus, LucideIcon> = {
  SAVED: Bookmark, APPLIED: Send, RESPONSE: MessageCircle, SCREENING: Search, INTERVIEW: Calendar, OFFER: BadgeCheck, PLACED: CheckCircle2, REJECTED: XCircle, WITHDRAWN: Circle, EXPIRED: Circle,
};

export const STATUS_COLOR: Record<ApplicationStatus, string> = {
  SAVED: "text-[var(--color-text-3)]",
  APPLIED: "text-[var(--color-info-fg)]",
  RESPONSE: "text-[var(--color-violet-fg)]",
  SCREENING: "text-[var(--color-violet-fg)]",
  INTERVIEW: "text-[var(--color-warning-fg)]",
  OFFER: "text-[var(--color-success-fg)]",
  PLACED: "text-[var(--color-teal-fg)]",
  REJECTED: "text-[var(--color-danger-fg)]",
  WITHDRAWN: "text-[var(--color-text-3)]",
  EXPIRED: "text-[var(--color-text-3)]",
};

/** Position along the pipeline; closed outcomes sit outside it (-1). */
export function stageRank(status: ApplicationStatus): number {
  return PIPELINE.indexOf(status);
}

export function isClosed(status: ApplicationStatus): boolean {
  return CLOSED.includes(status);
}

/** When the application entered its current stage — drives "days in stage". */
export function stageEnteredAt(application: Application): string {
  const entered = [...application.events].reverse().find((event) => event.toStatus === application.status);
  return entered?.createdAt ?? application.appliedAt ?? application.createdAt;
}
