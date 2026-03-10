import type { MoodEntry } from "@/types/mental-health";

const STRICT_LOW_THRESHOLD = 3; // clearly low
const MODERATE_LOW_THRESHOLD = 4; // slightly low

const STRICT_CONSECUTIVE_REQUIRED = 4;
const MODERATE_CONSECUTIVE_REQUIRED = 6;

const MAX_RECENT_ENTRIES = 10;

/**
 * Count consecutive entries (from most recent) where mood ≤ threshold.
 * Entries must already be sorted by date descending.
 */
function countConsecutiveLowMood(
  sorted: MoodEntry[],
  threshold: number,
): number {
  let count = 0;
  for (const entry of sorted) {
    if (entry.mood <= threshold) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Evaluate whether the mood trend qualifies for a support proposal.
 *
 * Dual-threshold logic:
 * - Strict (mood ≤ 3): 4+ consecutive from most recent
 * - Moderate (mood ≤ 4): 6+ consecutive from most recent
 *
 * Only evaluates the last 10 entries. Pure function — no side effects.
 */
export function evaluateMentalTrend(entries: MoodEntry[]): boolean {
  const valid = entries.filter(
    (e) => typeof e.mood === "number" && e.mood >= 1 && e.mood <= 10,
  );
  if (valid.length < STRICT_CONSECUTIVE_REQUIRED) return false;

  const sorted = [...valid].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const recent = sorted.slice(0, MAX_RECENT_ENTRIES);

  const strictConsecutive = countConsecutiveLowMood(
    recent,
    STRICT_LOW_THRESHOLD,
  );
  const moderateConsecutive = countConsecutiveLowMood(
    recent,
    MODERATE_LOW_THRESHOLD,
  );

  return (
    strictConsecutive >= STRICT_CONSECUTIVE_REQUIRED ||
    moderateConsecutive >= MODERATE_CONSECUTIVE_REQUIRED
  );
}
