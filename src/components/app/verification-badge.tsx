import { ShieldCheck, ShieldAlert, ShieldX, Shield } from "lucide-react";
import type { CompanyVerification } from "@/lib/schemas/company";
import { Tag } from "@/components/ui/tag";

/**
 * VerificationBadge — names the fired rule, never a bare verdict.
 * VERIFIED / CAUTION / REJECTED / UNKNOWN with the reason on non-verified.
 */
export function VerificationBadge({ verification }: { verification: CompanyVerification | null }) {
  if (!verification) {
    return <Tag tone="neutral"><Shield size={11} aria-hidden />Unverified</Tag>;
  }
  if (verification.verdict === "VERIFIED") {
    return <Tag tone="green"><ShieldCheck size={11} aria-hidden />Verified</Tag>;
  }
  const rule = verification.rules.find((r) => r.rule === verification.firedRule);
  const label = rule?.label ?? verification.firedRule ?? verification.verdict;
  if (verification.verdict === "REJECTED") {
    return <Tag tone="red"><ShieldX size={11} aria-hidden />{label}</Tag>;
  }
  return <Tag tone="amber"><ShieldAlert size={11} aria-hidden />{label}</Tag>;
}
