import type { WorkoutLogEntry } from "@/types/workout";
import type {
  FitnessAdaptationResult,
  FitnessAdaptationSignal,
} from "@/types/fitness-adaptation";

const HIGH_THRESHOLD = 4;
const LOW_ENERGY_THRESHOLD = 2;

/**
 * Evaluate recent workout check-ins for sustained high-stress signals.
 * Returns a FitnessAdaptationResult if a tier threshold is met, or null.
 *
 * Tier 2 (user confirmation required):
 *   - 6+ consecutive check-ins with pain ≥ 4
 *   - 6+ consecutive check-ins with fatigue ≥ 4
 *   - 4+ consecutive check-ins with energy ≤ 2
 *
 * Tier 1 (auto-execute):
 *   - 4+ consecutive check-ins with pain ≥ 4
 *   - 4+ consecutive check-ins with fatigue ≥ 4
 *
 * Tier 2 supersedes Tier 1.
 */
export function evaluateFitnessTrend(
  log: WorkoutLogEntry[],
): FitnessAdaptationResult | null {
  const withCheckIn = log.filter((e) => e.checkIn);
  if (withCheckIn.length < 4) return null;

  // Sort by date descending (most recent first)
  const sorted = [...withCheckIn].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const tier2Signals: FitnessAdaptationSignal[] = [];
  const tier1Signals: FitnessAdaptationSignal[] = [];

  // Consecutive high pain
  const consecutiveHighPain = countConsecutiveAbove(
    sorted,
    (e) => e.checkIn!.pain,
    HIGH_THRESHOLD,
  );

  if (consecutiveHighPain >= 6) {
    tier2Signals.push({
      metric: "pain",
      value: sorted[0].checkIn!.pain,
      consecutiveCount: consecutiveHighPain,
    });
  } else if (consecutiveHighPain >= 4) {
    tier1Signals.push({
      metric: "pain",
      value: sorted[0].checkIn!.pain,
      consecutiveCount: consecutiveHighPain,
    });
  }

  // Consecutive high fatigue
  const consecutiveHighFatigue = countConsecutiveAbove(
    sorted,
    (e) => e.checkIn!.fatigue,
    HIGH_THRESHOLD,
  );

  if (consecutiveHighFatigue >= 6) {
    tier2Signals.push({
      metric: "fatigue",
      value: sorted[0].checkIn!.fatigue,
      consecutiveCount: consecutiveHighFatigue,
    });
  } else if (consecutiveHighFatigue >= 4) {
    tier1Signals.push({
      metric: "fatigue",
      value: sorted[0].checkIn!.fatigue,
      consecutiveCount: consecutiveHighFatigue,
    });
  }

  // Consecutive low energy (Tier 2 only)
  const consecutiveLowEnergy = countConsecutiveBelow(
    sorted,
    (e) => e.checkIn!.energy,
    LOW_ENERGY_THRESHOLD,
  );

  if (consecutiveLowEnergy >= 4) {
    tier2Signals.push({
      metric: "energy",
      value: sorted[0].checkIn!.energy,
      consecutiveCount: consecutiveLowEnergy,
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

function countConsecutiveAbove(
  sorted: WorkoutLogEntry[],
  accessor: (e: WorkoutLogEntry) => number,
  threshold: number,
): number {
  let count = 0;
  for (const entry of sorted) {
    if (accessor(entry) >= threshold) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function countConsecutiveBelow(
  sorted: WorkoutLogEntry[],
  accessor: (e: WorkoutLogEntry) => number,
  threshold: number,
): number {
  let count = 0;
  for (const entry of sorted) {
    if (accessor(entry) <= threshold) {
      count++;
    } else {
      break;
    }
  }
  return count;
}
