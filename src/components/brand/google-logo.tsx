"use client";

import { Mail } from "lucide-react";

const GOOGLE_MARK_URL = "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";

/** Canonical Google mark with an offline-safe mail fallback. */
export function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex shrink-0 items-center justify-center text-[var(--color-text-2)]"
      style={{ width: size, height: size }}
    >
      <Mail size={Math.round(size * 0.78)} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={GOOGLE_MARK_URL}
        alt=""
        data-google-logo
        className="absolute inset-0 h-full w-full object-contain"
        onError={(event) => { event.currentTarget.style.display = "none"; }}
      />
    </span>
  );
}
