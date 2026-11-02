import { Plug, Globe, UserPlus, PencilLine } from "lucide-react";
import type { JobSourceType, LegalBasis } from "@/lib/schemas/enums";
import { Tag } from "@/components/ui/tag";

const SOURCE: Record<JobSourceType, { label: string; Icon: typeof Plug }> = {
  CONNECTOR: { label: "Connector", Icon: Plug },
  AGGREGATOR: { label: "Aggregator", Icon: Globe },
  USER_SUBMITTED: { label: "Captured", Icon: UserPlus },
  MANUAL: { label: "Manual", Icon: PencilLine },
};

const BASIS_LABEL: Record<LegalBasis, string> = {
  PUBLIC_DOCUMENTED: "public source",
  LICENSED_API: "licensed API",
  USER_SESSION: "user session",
};

/** SourceChip — provenance and legal basis of a job. */
export function SourceChip({
  sourceType,
  legalBasis,
  showBasis = false,
}: {
  sourceType: JobSourceType;
  legalBasis?: LegalBasis;
  showBasis?: boolean;
}) {
  const { label, Icon } = SOURCE[sourceType];
  return (
    <Tag tone="neutral">
      <Icon size={11} aria-hidden />
      {label}
      {showBasis && legalBasis ? <span className="text-[var(--color-text-3)]"> · {BASIS_LABEL[legalBasis]}</span> : null}
    </Tag>
  );
}
