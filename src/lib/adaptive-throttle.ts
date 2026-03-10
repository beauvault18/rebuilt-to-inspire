const NUTRITION_KEY = "rti_nutrition_last_adaptation";
const FITNESS_KEY = "rti_fitness_last_adaptation";
const MENTAL_KEY = "rti_mental_support_activated_at";

function wasWithinDays(key: string, days: number): boolean {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return false;
    const date = new Date(stored);
    const daysSince = Math.floor(
      (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSince < days;
  } catch {
    return false;
  }
}

/**
 * Returns true if any pillar has adapted/activated within the last 7 days.
 * Used by mental health before surfacing a proposal.
 */
export function hasAnyPillarAdaptedInLast7Days(): boolean {
  return (
    wasWithinDays(NUTRITION_KEY, 7) ||
    wasWithinDays(FITNESS_KEY, 7) ||
    wasWithinDays(MENTAL_KEY, 7)
  );
}

/**
 * Returns true if mental health support was activated within the last 7 days.
 * Used by nutrition and fitness before surfacing their adaptations.
 */
export function hasMentalSupportActivatedInLast7Days(): boolean {
  return wasWithinDays(MENTAL_KEY, 7);
}
