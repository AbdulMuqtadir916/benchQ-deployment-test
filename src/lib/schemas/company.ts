import { z } from "zod";
import { ClientType, VerificationVerdict } from "./enums";

/** JobNavigator-aligned: LCA / H-1B sponsorship data. Central to bench sales. */
export const H1bDataSchema = z.object({
  sponsorsH1b: z.boolean().nullable(),
  lcaCount: z.number().int().nullable(),
  lcaYear: z.number().int().nullable(),
  medianLcaWage: z.number().nullable(),
  topLcaTitles: z.array(z.string()),
  dataSource: z.string().nullable(),
  lastCheckedAt: z.string().datetime().nullable(),
});
export type H1bData = z.infer<typeof H1bDataSchema>;

export const VerificationRuleSchema = z.object({
  rule: z.string(),
  label: z.string(),
  passed: z.boolean(),
  observed: z.string().nullable(),
});
export type VerificationRule = z.infer<typeof VerificationRuleSchema>;

export const CompanyVerificationSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  verdict: VerificationVerdict,
  rules: z.array(VerificationRuleSchema),
  firedRule: z.string().nullable(),
  isManual: z.boolean(),
  overrideReason: z.string().nullable(),
  checkedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type CompanyVerification = z.infer<typeof CompanyVerificationSchema>;

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  normalisedName: z.string(),
  domain: z.string().nullable(),
  websiteUrl: z.string().url().nullable(),
  linkedinUrl: z.string().url().nullable(),
  employeeBand: z
    .enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"])
    .nullable(),
  hasUsPresence: z.boolean().nullable(),
  clientType: ClientType,
  atsProvider: z.string().nullable(),
  h1b: H1bDataSchema.nullable(),
  verification: CompanyVerificationSchema.nullable(),
});
export type Company = z.infer<typeof CompanySchema>;
