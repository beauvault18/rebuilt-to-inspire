import type { WorkoutLogEntry, PlanTracking } from "@/types/workout";
import type { PlanResponse, DayPlan } from "@/types/plan";
import type {
  FitnessAdaptationResult,
  FitnessPendingAdaptation,
} from "@/types/fitness-adaptation";

const LOG_KEY = "rti_workout_log";
const TRACKING_KEY = "rti_plan_tracking";
const FITNESS_ADAPTATION_PENDING_KEY = "rti_fitness_adaptation_pending";
const FITNESS_PLAN_VERSION_KEY = "rti_fitness_plan_version";
const FITNESS_PREVIOUS_PLAN_KEY = "rti_fitness_previous_plan";
const FITNESS_ADAPTATION_DECLINED_KEY = "rti_fitness_adaptation_declined";
const FITNESS_LAST_ADAPTATION_KEY = "rti_fitness_last_adaptation";

// ---------------------------------------------------------------------------
// Load / Save
// ---------------------------------------------------------------------------

export function loadWorkoutLog(): WorkoutLogEntry[] {
  try {
    const stored = localStorage.getItem(LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveWorkoutLog(entries: WorkoutLogEntry[]) {
  localStorage.setItem(LOG_KEY, JSON.stringify(entries));
}

export function loadPlanTracking(): PlanTracking | null {
  try {
    const stored = localStorage.getItem(TRACKING_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function savePlanTracking(tracking: PlanTracking) {
  localStorage.setItem(TRACKING_KEY, JSON.stringify(tracking));
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function getTodayLog(
  log: WorkoutLogEntry[],
): WorkoutLogEntry | null {
  const today = getTodayISO();
  return log.find((e) => e.date === today) ?? null;
}

export function getWeekNumber(tracking: PlanTracking): number {
  const start = new Date(tracking.startDate + "T00:00:00");
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.floor(diffDays / 7) + 1;
}

// ---------------------------------------------------------------------------
// Plan hashing (simple — detect regeneration)
// ---------------------------------------------------------------------------

export function hashPlan(response: PlanResponse): string {
  const src =
    (response.progression_stage || "") +
    (response.plan.summary || "") +
    JSON.stringify(response.plan.weekly_plan?.map((d) => d.focus) ?? []);
  let hash = 0;
  for (let i = 0; i < src.length; i++) {
    hash = (hash << 5) - hash + src.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

export function initTracking(response: PlanResponse): PlanTracking {
  const tracking: PlanTracking = {
    startDate: getTodayISO(),
    planHash: hashPlan(response),
    deloadOverrideCount: 0,
    preferredMode: "summary",
  };
  savePlanTracking(tracking);
  return tracking;
}

// ---------------------------------------------------------------------------
// Day helpers (reuse logic from dashboard)
// ---------------------------------------------------------------------------

export function isRestDay(day: DayPlan): boolean {
  const focus = day.focus.toLowerCase();
  return (
    focus.includes("rest") ||
    focus.includes("recovery") ||
    !day.main ||
    day.main.length === 0
  );
}

export function estimateDuration(day: DayPlan): number {
  const warmup = day.warmup?.duration_min || 0;
  const cooldown = day.cooldown?.duration_min || 0;
  const main = (day.main?.length || 0) * 4;
  return warmup + main + cooldown;
}

export function getTodayDayIndex(planLength: number): number {
  return new Date().getDay() % planLength;
}

// ---------------------------------------------------------------------------
// Missed workout detection
// ---------------------------------------------------------------------------

function getYesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function getYesterdayDayIndex(planLength: number): number {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.getDay() % planLength;
}

/** Returns the missed DayPlan from yesterday, or null if rest day or already logged. */
export function detectMissedYesterday(
  log: WorkoutLogEntry[],
  weeklyPlan: DayPlan[],
): DayPlan | null {
  if (!weeklyPlan.length) return null;
  const yesterdayISO = getYesterdayISO();
  const alreadyLogged = log.some((e) => e.date === yesterdayISO);
  if (alreadyLogged) return null;

  const idx = getYesterdayDayIndex(weeklyPlan.length);
  const day = weeklyPlan[idx];
  if (!day || isRestDay(day)) return null;

  return day;
}

/** Count non-rest scheduled days this week that have no log entry. */
export function countMissedThisWeek(
  log: WorkoutLogEntry[],
  weeklyPlan: DayPlan[],
): number {
  if (!weeklyPlan.length) return 0;
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
  let missed = 0;

  for (let offset = 1; offset <= dayOfWeek; offset++) {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    const iso = d.toISOString().split("T")[0];
    const idx = d.getDay() % weeklyPlan.length;
    const day = weeklyPlan[idx];

    if (day && !isRestDay(day)) {
      const logged = log.some((e) => e.date === iso);
      if (!logged) missed++;
    }
  }

  return missed;
}

// ---------------------------------------------------------------------------
// Deload detection (Phase 5)
// ---------------------------------------------------------------------------

export function shouldRecommendDeload(log: WorkoutLogEntry[]): boolean {
  const withCheckIn = log.filter((e) => e.checkIn).slice(-7);
  if (withCheckIn.length < 3) return false;

  const avgPain =
    withCheckIn.reduce((s, e) => s + (e.checkIn?.pain || 0), 0) /
    withCheckIn.length;
  const avgFatigue =
    withCheckIn.reduce((s, e) => s + (e.checkIn?.fatigue || 0), 0) /
    withCheckIn.length;

  return avgPain >= 3.5 || avgFatigue >= 4;
}

// ---------------------------------------------------------------------------
// Fitness adaptation storage
// ---------------------------------------------------------------------------

export function markFitnessAdaptationPending(result: FitnessAdaptationResult): void {
  const pending: FitnessPendingAdaptation = {
    tier: result.tier,
    signals: result.signals,
    triggeredAt: new Date().toISOString(),
  };
  localStorage.setItem(FITNESS_ADAPTATION_PENDING_KEY, JSON.stringify(pending));
}

export function getFitnessPendingAdaptation(): FitnessPendingAdaptation | null {
  try {
    const stored = localStorage.getItem(FITNESS_ADAPTATION_PENDING_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearFitnessPendingAdaptation(): void {
  localStorage.removeItem(FITNESS_ADAPTATION_PENDING_KEY);
}

export function getFitnessPlanVersion(): number {
  try {
    const stored = localStorage.getItem(FITNESS_PLAN_VERSION_KEY);
    if (!stored) return 1;
    return parseInt(stored, 10) || 1;
  } catch {
    return 1;
  }
}

export function bumpFitnessPlanVersion(): number {
  const current = getFitnessPlanVersion();
  const next = current + 1;
  localStorage.setItem(FITNESS_PLAN_VERSION_KEY, String(next));
  return next;
}

export function storeFitnessPreviousPlan(plan: PlanResponse): void {
  localStorage.setItem(FITNESS_PREVIOUS_PLAN_KEY, JSON.stringify(plan));
}

export function getFitnessPreviousPlan(): PlanResponse | null {
  try {
    const stored = localStorage.getItem(FITNESS_PREVIOUS_PLAN_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearFitnessPreviousPlan(): void {
  localStorage.removeItem(FITNESS_PREVIOUS_PLAN_KEY);
}

export function markFitnessAdaptationDeclined(): void {
  localStorage.setItem(FITNESS_ADAPTATION_DECLINED_KEY, new Date().toISOString());
}

export function isFitnessAdaptationDeclined(): boolean {
  try {
    const stored = localStorage.getItem(FITNESS_ADAPTATION_DECLINED_KEY);
    if (!stored) return false;
    const declinedDate = new Date(stored);
    const daysSince = Math.floor(
      (new Date().getTime() - declinedDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    // 14-day cooldown — skips multiple workout cycles
    return daysSince < 14;
  } catch {
    return false;
  }
}

export function isFitnessPendingAdaptationStale(): boolean {
  const pending = getFitnessPendingAdaptation();
  if (!pending) return false;
  try {
    const triggeredDate = new Date(pending.triggeredAt);
    const daysSince = Math.floor(
      (new Date().getTime() - triggeredDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSince > 14;
  } catch {
    return true;
  }
}

export function markLastFitnessAdaptation(): void {
  localStorage.setItem(FITNESS_LAST_ADAPTATION_KEY, new Date().toISOString());
}

export function shouldSuppressFitnessAdaptation(): boolean {
  try {
    const stored = localStorage.getItem(FITNESS_LAST_ADAPTATION_KEY);
    if (!stored) return false;
    const lastDate = new Date(stored);
    const daysSince = Math.floor(
      (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSince < 7;
  } catch {
    return false;
  }
}
