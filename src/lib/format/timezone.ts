import { formatDistanceToNow } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

/**
 * Timezone helpers per docs/01 §4 lib/format/.
 * IST is the firm's operating timezone, the client's local timezone is
 * whatever the browser reports — never assume America/New_York, the docs
 * only use it as the default client timezone, not a hardcode.
 */

export function formatIst(iso: string, pattern = "MMM d, h:mm a"): string {
  return formatInTimeZone(new Date(iso), "Asia/Kolkata", pattern);
}

export function formatLocal(iso: string, pattern = "MMM d, h:mm a"): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return formatInTimeZone(new Date(iso), tz, pattern);
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

/** "Mon, 25 Aug 2025" — used for due-date style columns (local timezone). */
export function formatDueDate(iso: string): string {
  return formatLocal(iso, "EEE, dd MMM yyyy");
}
