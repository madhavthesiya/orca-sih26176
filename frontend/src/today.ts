import type { FishingOutlook } from "./types";

/**
 * Rules shared by the console's Today view and the phone app, so both
 * screens make the same call from the same outlook.
 */

/**
 * A day with no trip in it. The backend still sends the grounds and the
 * best hours on a dangerous day; shown under "do not go out" they read as an
 * invitation. EXTREME risk is always a no-go; otherwise the backend's own
 * `duration.feasible` (is there enough safe time for a worthwhile trip) decides.
 */
export function tripIsOff(o: Pick<FishingOutlook, "safety" | "duration">): boolean {
  if (o.safety.category === "EXTREME") return true;
  return o.duration ? !o.duration.feasible : false;
}

/** A reading older than this is no longer "now" and is marked stale. */
export const STALE_AFTER_MS = 30 * 60 * 1000;

/** Which face a data panel shows. */
export type ReadingState = "loading" | "error" | "stale" | "ready";

/**
 * - nothing yet, request in flight (or position unknown) → loading
 * - nothing yet and the request failed → error
 * - a reading on screen but the newest refresh failed, or the reading has
 *   aged past STALE_AFTER_MS → stale (kept, never passed off as live)
 * - otherwise → ready
 */
export function readingState(s: {
  hasData: boolean;
  loading: boolean;
  failed: boolean;
  generatedAt?: string | null;
  now?: number;
}): ReadingState {
  if (!s.hasData) return s.failed && !s.loading ? "error" : "loading";
  if (s.failed) return "stale";
  const at = s.generatedAt ? Date.parse(s.generatedAt) : NaN;
  if (Number.isFinite(at) && (s.now ?? Date.now()) - at > STALE_AFTER_MS) return "stale";
  return "ready";
}

/** Same spot to within ~100 m — a reading for it can be held through a failed refresh. */
export function sameSpot(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): boolean {
  return Math.abs(a.latitude - b.latitude) < 0.001 && Math.abs(a.longitude - b.longitude) < 0.001;
}

/** Minutes since an ISO timestamp, floored; null if it cannot be read. */
export function minutesSince(iso: string | null | undefined, now = Date.now()): number | null {
  const at = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(at) ? Math.max(0, Math.floor((now - at) / 60_000)) : null;
}
