import type { NutritionCheckIn } from "@/types/nutrition-checkin";
import type { AdaptationResult, AdaptationSignal } from "@/types/nutrition-adaptation";

const LOW_THRESHOLD = 2;

/**
 * Evaluate recent nutrition check-ins for sustained low signals.
 * Returns an AdaptationResult if a tier threshold is met, or null.
 *
 * Tier 2 (user confirmation required):
 *   - 3 consecutive reflections with appetite ≤ 2
 *   - 3 consecutive reflections with gi ≤ 2
 *   - Any reflection with weightTrend === "significantly_down"
 *
 * Tier 1 (auto-execute):
 *   - 2 consecutive reflections with appetite ≤ 2
 *   - 2 consecutive reflections with gi ≤ 2
 *
 * Tier 2 supersedes Tier 1.
 */
export function evaluateNutritionTrend(
  checkIns: NutritionCheckIn[],
): AdaptationResult | null {
  if (checkIns.length < 2) return null;

  // Sort by date descending (most recent first)
  const sorted = [...checkIns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const recent = sorted.slice(0, 3);

  const tier2Signals: AdaptationSignal[] = [];
  const tier1Signals: AdaptationSignal[] = [];

  // Check for significant weight loss (any recent reflection)
  if (recent[0].weightTrend === "significantly_down") {
    tier2Signals.push({
      metric: "weight",
      value: "significantly_down",
      consecutiveCount: 1,
    });
  }

  // Count consecutive low appetite (from most recent)
  const consecutiveLowAppetite = countConsecutiveLow(
    recent,
    (c) => c.appetite,
  );

  if (consecutiveLowAppetite >= 3) {
    tier2Signals.push({
      metric: "appetite",
      value: recent[0].appetite,
      consecutiveCount: consecutiveLowAppetite,
    });
  } else if (consecutiveLowAppetite >= 2) {
    tier1Signals.push({
      metric: "appetite",
      value: recent[0].appetite,
      consecutiveCount: consecutiveLowAppetite,
    });
  }

  // Count consecutive low gi (from most recent)
  const consecutiveLowGi = countConsecutiveLow(recent, (c) => c.gi);

  if (consecutiveLowGi >= 3) {
    tier2Signals.push({
      metric: "gi",
      value: recent[0].gi,
      consecutiveCount: consecutiveLowGi,
    });
  } else if (consecutiveLowGi >= 2) {
    tier1Signals.push({
      metric: "gi",
      value: recent[0].gi,
      consecutiveCount: consecutiveLowGi,
    });
  }

  // Tier 2 supersedes Tier 1
  if (tier2Signals.length > 0) {
    return { tier: 2, signals: [...tier2Signals, ...tier1Signals] };
  }

  if (tier1Signals.length > 0) {
    return { tier: 1, signals: tier1Signals };
  }

  return null;
}

function countConsecutiveLow(
  sorted: NutritionCheckIn[],
  accessor: (c: NutritionCheckIn) => number,
): number {
  let count = 0;
  for (const checkIn of sorted) {
    if (accessor(checkIn) <= LOW_THRESHOLD) {
      count++;
    } else {
      break;
    }
  }
  return count;
}
