"use client";

import { ListFilter } from "lucide-react";
import type { CandidateStatus } from "@/lib/schemas/enums";
import { Select, type SelectOption } from "@/components/ui/select";

export type CandidateStatusFilter = "ALL" | CandidateStatus;

const STATUS_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "All statuses", icon: <ListFilter size={14} /> },
  { value: "ON_BENCH", label: "On bench", icon: <StatusDot color="var(--color-info-fg)" /> },
  { value: "INTERVIEWING", label: "Interviewing", icon: <StatusDot color="var(--color-violet-fg)" /> },
  { value: "OFFER", label: "Offer", icon: <StatusDot color="var(--color-success-fg)" /> },
  { value: "PLACED", label: "Placed", icon: <StatusDot color="var(--color-teal-fg)" /> },
  { value: "PAUSED", label: "Paused", icon: <StatusDot color="var(--color-warning-fg)" /> },
  { value: "INACTIVE", label: "Inactive", icon: <StatusDot color="var(--color-text-3)" /> },
];

interface CandidateStatusSelectProps {
  value: CandidateStatusFilter;
  onValueChange: (value: CandidateStatusFilter) => void;
  className?: string;
}

export function CandidateStatusSelect({ value, onValueChange, className }: CandidateStatusSelectProps) {
  return (
    <Select
      aria-label="Filter by status"
      className={className}
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as CandidateStatusFilter)}
      options={STATUS_OPTIONS}
    />
  );
}

function StatusDot({ color }: { color: string }) {
  return <span className="h-2.5 w-2.5 rounded-full ring-2 ring-[var(--color-surface)]" style={{ backgroundColor: color }} />;
}
