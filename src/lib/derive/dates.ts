/** Small date helpers shared by the derive functions. Pure, no side effects. */

export function daysBetween(a: string | Date, b: string | Date): number {
  const t1 = new Date(a).getTime();
  const t2 = new Date(b).getTime();
  return Math.round(Math.abs(t2 - t1) / 86_400_000);
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function minDate(dates: Array<string | null | undefined>): string | null {
  const valid = dates.filter((d): d is string => !!d).sort();
  return valid[0] ?? null;
}

export function maxDate(dates: Array<string | null | undefined>): string | null {
  const valid = dates.filter((d): d is string => !!d).sort();
  return valid[valid.length - 1] ?? null;
}
