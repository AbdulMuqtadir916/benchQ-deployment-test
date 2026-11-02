"use client";

import { create } from "zustand";
import type { ResumeDocument, ResumeSectionKey } from "@/lib/schemas/resume-document";
import { allClaims } from "@/lib/resume-doc/ops";

export type StudioMode = "build" | "view";
export type Zoom = "fit" | number;

interface StudioState {
  doc: ResumeDocument | null;
  mode: StudioMode;
  zoom: Zoom;
  galleryOpen: boolean;
  openSections: Partial<Record<ResumeSectionKey, boolean>>;
  /** Expanded experience / list entries in the builder, by entry id. */
  openEntries: Record<string, boolean>;
  savedAt: number | null;
  pageCount: number;
  notice: { text: string; tone: "info" | "ai" | "danger" } | null;
  /** Claim that just changed under AI — the paper and the field flash it once. */
  flashClaimId: string | null;
  /** Ask whichever view is showing to scroll to and focus a claim. Nonce re-triggers the same id. */
  focusRequest: { claimId: string; nonce: number } | null;

  load: (doc: ResumeDocument, mode: StudioMode) => void;
  setMode: (mode: StudioMode) => void;
  update: (fn: (doc: ResumeDocument) => ResumeDocument) => void;
  setTemplate: (templateId: string) => void;
  setZoom: (zoom: Zoom) => void;
  setGalleryOpen: (open: boolean) => void;
  toggleSection: (key: ResumeSectionKey, open?: boolean) => void;
  toggleEntry: (id: string, open?: boolean) => void;
  /** Open the section and entry holding a claim, then focus it in the current mode. */
  jumpToClaim: (claimId: string) => void;
  flash: (claimId: string) => void;
  requestFocus: (claimId: string) => void;
  setPageCount: (pages: number) => void;
  notify: (text: string, tone?: "info" | "ai" | "danger") => void;
}

export const useStudio = create<StudioState>((set) => ({
  doc: null,
  mode: "build",
  zoom: "fit",
  galleryOpen: false,
  openSections: { header: true },
  openEntries: {},
  savedAt: null,
  pageCount: 1,
  notice: null,
  flashClaimId: null,
  focusRequest: null,

  load: (doc, mode) => set({ doc, mode, savedAt: null, galleryOpen: false, openSections: { header: true }, openEntries: {}, flashClaimId: null, focusRequest: null, notice: null }),
  setMode: (mode) => set({ mode }),
  update: (fn) => set((s) => (s.doc ? { doc: fn(s.doc), savedAt: Date.now() } : s)),
  setTemplate: (templateId) => set((s) => (s.doc ? { doc: { ...s.doc, templateId }, savedAt: Date.now() } : s)),
  setZoom: (zoom) => set({ zoom }),
  setGalleryOpen: (galleryOpen) => set({ galleryOpen }),
  toggleSection: (key, open) =>
    set((s) => ({ openSections: { ...s.openSections, [key]: open ?? !s.openSections[key] } })),
  toggleEntry: (id, open) => set((s) => ({ openEntries: { ...s.openEntries, [id]: open ?? !s.openEntries[id] } })),
  jumpToClaim: (claimId) => {
    set((s) => {
      const hit = s.doc ? allClaims(s.doc).find((c) => c.claim.id === claimId) : undefined;
      if (!hit) return s;
      return {
        openSections: { ...s.openSections, [hit.section]: true },
        openEntries: hit.entryId ? { ...s.openEntries, [hit.entryId]: true } : s.openEntries,
      };
    });
    // Let the section finish expanding (BuilderSection animates for ~220ms) before focusing.
    setTimeout(() => set({ focusRequest: { claimId, nonce: Date.now() } }), 260);
  },
  flash: (claimId) => {
    set({ flashClaimId: claimId });
    setTimeout(() => set((s) => (s.flashClaimId === claimId ? { flashClaimId: null } : s)), 1800);
  },
  requestFocus: (claimId) => set({ focusRequest: { claimId, nonce: Date.now() } }),
  setPageCount: (pageCount) => set({ pageCount }),
  notify: (text, tone = "info") => {
    const notice = { text, tone };
    set({ notice });
    setTimeout(() => set((s) => (s.notice === notice ? { notice: null } : s)), 4500);
  },
}));
