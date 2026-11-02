import { cn } from "@/lib/cn";

const SIZE = {
  sm: "h-8 w-8 text-caption font-[600]",
  md: "h-11 w-11 text-body-strong",
  lg: "h-14 w-14 text-h2",
  xl: "h-16 w-16 text-h2",
} as const;

const PALETTES = 8;

/**
 * Stable palette per person. Ids ending in a number ("cand_07") cycle through the
 * palettes in order, so neighbours on the bench never share colours; anything
 * else falls back to a hash of the key.
 */
function paletteFor(key: string): number {
  const n = key.match(/(\d+)$/);
  if (n) return (Number(n[1]) - 1 + PALETTES) % PALETTES;
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % PALETTES;
}

export function initials(name: string): string {
  return name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

/** Shaded initials avatar — layered gradients (see .bq-avatar in globals.css), sheen on hover. */
/** `colorKey` — pass the candidate id so the colour matches everywhere the person appears. */
export function CandidateAvatar({ name, colorKey, size = "md", className }: { name: string; colorKey?: string; size?: keyof typeof SIZE; className?: string }) {
  return (
    <span aria-hidden="true" data-palette={paletteFor(colorKey ?? name)} className={cn("bq-avatar inline-flex shrink-0 items-center justify-center rounded-[var(--radius-full)]", SIZE[size], className)}>
      {initials(name)}
    </span>
  );
}
