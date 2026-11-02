import { describe, expect, it } from "vitest";
import { z } from "zod";
import { toIso, toIsoOrNull } from "./shared";

describe("toIso", () => {
  it.each([
    ["2026-10-03T10:00:00+00:00", "2026-10-03T10:00:00.000Z"],
    ["2026-10-03T15:30:00+05:30", "2026-10-03T10:00:00.000Z"],
    ["2026-10-03T10:00:00", "2026-10-03T10:00:00.000Z"],
    ["2026-10-03T10:00:00.123456", "2026-10-03T10:00:00.123Z"],
    ["2026-10-03", "2026-10-03T00:00:00.000Z"],
  ])("normalises %s", (input, expected) => {
    expect(toIso(input)).toBe(expected);
    expect(z.string().datetime().safeParse(toIso(input)).success).toBe(true);
  });

  it("rejects garbage instead of producing Invalid Date", () => {
    expect(() => toIso("not a date")).toThrow();
  });

  it("passes null through", () => {
    expect(toIsoOrNull(null)).toBeNull();
    expect(toIsoOrNull(undefined)).toBeNull();
  });
});
