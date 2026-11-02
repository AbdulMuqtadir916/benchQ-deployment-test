"use client";

import { Building2, Globe2 } from "lucide-react";
import type { Job } from "@/lib/schemas/job";

export type PortalKey = "LINKEDIN" | "INDEED" | "DICE" | "GLASSDOOR" | "COMPANY";

export const PORTALS: Record<PortalKey, { label: string; logo?: string; color: string }> = {
  LINKEDIN: { label: "LinkedIn", logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg", color: "#0A66C2" },
  INDEED: { label: "Indeed", logo: "https://cdn.simpleicons.org/indeed/003A9B", color: "#003A9B" },
  DICE: { label: "Dice", logo: "https://mma.prnewswire.com/media/1099567/Dice_Logo.jpg?p=facebook", color: "#EE2747" },
  GLASSDOOR: { label: "Glassdoor", logo: "https://cdn.simpleicons.org/glassdoor/00A264", color: "#00A264" },
  COMPANY: { label: "Company site", color: "var(--color-text-2)" },
};

function jobNumber(job: Job) {
  return Number(job.id.replace(/\D/g, "")) || 0;
}

export function portalForJob(job: Job): PortalKey {
  const index = jobNumber(job);
  if (job.provenance.sourceType === "CONNECTOR") return index % 3 === 0 ? "DICE" : "LINKEDIN";
  if (job.provenance.sourceType === "AGGREGATOR") return index % 2 === 0 ? "GLASSDOOR" : "INDEED";
  return "COMPANY";
}

export function PortalLogo({ portal, domain, size = 24 }: { portal: PortalKey; domain?: string | null; size?: number }) {
  const config = PORTALS[portal];
  const companyFavicon = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64` : null;
  const src = config.logo ?? companyFavicon;
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xs)]"
      style={{ width: size, height: size, color: config.color }}
      aria-hidden="true"
    >
      {portal === "COMPANY" ? <Building2 size={Math.round(size * 0.56)} /> : <Globe2 size={Math.round(size * 0.5)} />}
      {src ? (
        // Brand marks use canonical assets; the icon fallback remains legible offline.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="absolute inset-[4px] h-[calc(100%-8px)] w-[calc(100%-8px)] object-contain"
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
      ) : null}
    </span>
  );
}
