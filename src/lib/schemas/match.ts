import { z } from "zod";
import { RequirementKind, RequirementMatch, ScoringDepth } from "./enums";
import { JobSchema } from "./job";

export const MatchComponentsSchema = z.object({
  skillOverlap: z.number().min(0).max(1),
  titleSimilarity: z.number().min(0).max(1),
  seniorityFit: z.number().min(0).max(1),
  locationFit: z.number().min(0).max(1),
  recency: z.number().min(0).max(1),
});
export type MatchComponents = z.infer<typeof MatchComponentsSchema>;

/**
 * JobNavigator-aligned scoring record.
 * LIGHT runs on every match for ranking. FULL runs only when the BDE opens a job.
 */
export const ScoringRecordSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  depth: ScoringDepth,
  provider: z.string().nullable(),
  modelId: z.string().nullable(),
  promptVersion: z.string().nullable(),

  score: z.number().int().min(0).max(100),

  keywordAnalysis: z
    .object({
      matched: z.array(z.string()),
      missing: z.array(z.string()),
      adjacent: z.array(z.string()),
      densityPct: z.number(),
    })
    .nullable(),

  requirementMapping: z
    .array(
      z.object({
        requirementId: z.string(),
        requirement: z.string(),
        kind: RequirementKind,
        match: RequirementMatch,
        evidenceId: z.string().nullable(),
        note: z.string().nullable(),
      }),
    )
    .nullable(),

  atsTips: z
    .array(
      z.object({
        severity: z.enum(["BLOCKER", "IMPORTANT", "MINOR"]),
        message: z.string(),
        fix: z.string(),
      }),
    )
    .nullable(),

  computedAt: z.string().datetime(),
  latencyMs: z.number().int().nullable(),
});
export type ScoringRecord = z.infer<typeof ScoringRecordSchema>;

export const MatchSchema = z.object({
  id: z.string(),
  candidateId: z.string(),
  jobId: z.string(),
  job: JobSchema,

  score: z.number().int().min(0).max(100),
  components: MatchComponentsSchema,
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  adjacentSkills: z.array(z.string()),

  scoring: ScoringRecordSchema.nullable(),

  isShortlisted: z.boolean(),
  isDismissed: z.boolean(),
  dismissReason: z.string().nullable(),
  hardFilterFailed: z
    .enum(["WORK_AUTH", "COMPANY_REJECTED", "ALREADY_APPLIED", "DISMISSED"])
    .nullable(),

  computedAt: z.string().datetime(),
});
export type Match = z.infer<typeof MatchSchema>;
