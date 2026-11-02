/**
 * Helpers shared by every backend mapper in src/lib/api/dto/.
 *
 * FastAPI emits timestamps as `2026-10-03T10:00:00+00:00` or with no zone at
 * all; the frontend schemas only accept `...Z`. Declare backend timestamps as
 * z.string() in DTO schemas and convert them here.
 */

const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Backend timestamp → `YYYY-MM-DDTHH:mm:ss.sssZ`. Zone-less values are treated as UTC. */
export function toIso(value: string): string {
  const normalised = DATE_ONLY.test(value) ? `${value}T00:00:00Z` : HAS_ZONE.test(value) ? value : `${value}Z`;
  const date = new Date(normalised);
  if (Number.isNaN(date.getTime())) throw new Error(`Unparseable backend timestamp: ${value}`);
  return date.toISOString();
}

export function toIsoOrNull(value: string | null | undefined): string | null {
  return value ? toIso(value) : null;
}
