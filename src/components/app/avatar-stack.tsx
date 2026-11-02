import { cn } from "@/lib/cn";

const PALETTE = [
  "var(--gradient-avatar-1)",
  "var(--gradient-avatar-2)",
  "var(--gradient-avatar-3)",
  "var(--gradient-avatar-4)",
  "var(--gradient-avatar-5)",
  "var(--gradient-avatar-6)",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** AvatarStack — overlapping initials avatars for assignee-style columns. */
export function AvatarStack({
  people,
  max = 3,
  className,
}: {
  people: Array<{ name: string }>;
  max?: number;
  className?: string;
}) {
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;

  if (people.length === 0) {
    return <span className="text-sm text-[var(--color-text-3)]">Unassigned</span>;
  }

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {shown.map((person, i) => (
        <span
          key={person.name + i}
          title={person.name}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-surface)] text-[10px] font-medium text-white"
          style={{ background: PALETTE[i % PALETTE.length] }}
        >
          {initials(person.name)}
        </span>
      ))}
      {overflow > 0 ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-surface-3)] text-[10px] font-medium text-[var(--color-text-2)]">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
