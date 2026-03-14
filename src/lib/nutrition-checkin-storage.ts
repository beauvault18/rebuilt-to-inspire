import type { NutritionCheckIn } from "@/types/nutrition-checkin";
import type { NutritionPlanResponse } from "@/types/nutrition";
import type {
  AdaptationResult,
  PendingAdaptation,
} from "@/types/nutrition-adaptation";

const STORAGE_KEY = "rti_nutrition_checkins";
const SNOOZE_KEY = "rti_nutrition_reflection_snoozed_until";
const PLAN_CREATED_KEY = "rti_nutrition_plan_created_at";
const ADAPTATION_PENDING_KEY = "rti_nutrition_adaptation_pending";
const PLAN_VERSION_KEY = "rti_nutrition_plan_version";
const PREVIOUS_PLAN_KEY = "rti_nutrition_previous_plan";
const ADAPTATION_DECLINED_KEY = "rti_nutrition_adaptation_declined";
const LAST_ADAPTATION_KEY = "rti_nutrition_last_adaptation";

export function getNutritionCheckIns(): NutritionCheckIn[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveNutritionCheckIn(entry: NutritionCheckIn): void {
  const existing = getNutritionCheckIns();
  existing.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getLastNutritionCheckIn(): NutritionCheckIn | null {
  const all = getNutritionCheckIns();
  if (all.length === 0) return null;
  return all[all.length - 1];
}

export function daysSinceLastNutritionCheckIn(): number | null {
  const last = getLastNutritionCheckIn();
  if (!last) return null;
  const lastDate = new Date(last.date + "T00:00:00");
  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function shouldShowNutritionReflection(): boolean {
  // Check snooze
  try {
    const snoozedUntil = localStorage.getItem(SNOOZE_KEY);
    if (snoozedUntil) {
      const snoozeDate = new Date(snoozedUntil);
      if (new Date() < snoozeDate) return false;
    }
  } catch {}

  const last = getLastNutritionCheckIn();
  if (last) {
    // Already checked in today — don't show again
    const today = new Date().toISOString().split("T")[0];
    if (last.date === today) return false;
    return true;
  }

  // Never checked in — show if a nutrition plan exists
  try {
    const created = localStorage.getItem(PLAN_CREATED_KEY);
    return !!created;
  } catch {
    return false;
  }
}

export function markNutritionPlanCreated(): void {
  if (!localStorage.getItem(PLAN_CREATED_KEY)) {
    localStorage.setItem(PLAN_CREATED_KEY, new Date().toISOString());
  }
}

export function snoozeNutritionReflection(): void {
  // Snooze until tomorrow
  const snoozeUntil = new Date();
  snoozeUntil.setDate(snoozeUntil.getDate() + 1);
  snoozeUntil.setHours(0, 0, 0, 0);
  localStorage.setItem(SNOOZE_KEY, snoozeUntil.toISOString());
}

// --- Adaptation storage ---

export function markAdaptationPending(result: AdaptationResult): void {
  const pending: PendingAdaptation = {
    tier: result.tier,
    signals: result.signals,
    triggeredAt: new Date().toISOString(),
  };
  localStorage.setItem(ADAPTATION_PENDING_KEY, JSON.stringify(pending));
}

export function getPendingAdaptation(): PendingAdaptation | null {
  try {
    const stored = localStorage.getItem(ADAPTATION_PENDING_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearPendingAdaptation(): void {
  localStorage.removeItem(ADAPTATION_PENDING_KEY);
}

export function getPlanVersion(): number {
  try {
    const stored = localStorage.getItem(PLAN_VERSION_KEY);
    if (!stored) return 1;
    return parseInt(stored, 10) || 1;
  } catch {
    return 1;
  }
}

export function bumpPlanVersion(): number {
  const current = getPlanVersion();
  const next = current + 1;
  localStorage.setItem(PLAN_VERSION_KEY, String(next));
  return next;
}

export function storePreviousPlan(plan: NutritionPlanResponse): void {
  localStorage.setItem(PREVIOUS_PLAN_KEY, JSON.stringify(plan));
}

export function getPreviousPlan(): NutritionPlanResponse | null {
  try {
    const stored = localStorage.getItem(PREVIOUS_PLAN_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearPreviousPlan(): void {
  localStorage.removeItem(PREVIOUS_PLAN_KEY);
}

export function markAdaptationDeclined(): void {
  localStorage.setItem(ADAPTATION_DECLINED_KEY, new Date().toISOString());
}

export function isAdaptationDeclined(): boolean {
  try {
    const stored = localStorage.getItem(ADAPTATION_DECLINED_KEY);
    if (!stored) return false;
    const declinedDate = new Date(stored);
    const daysSince = Math.floor(
      (new Date().getTime() - declinedDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    // 14-day cooldown — skips one full weekly reflection cycle
    return daysSince < 14;
  } catch {
    return false;
  }
}

export function isPendingAdaptationStale(): boolean {
  const pending = getPendingAdaptation();
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

export function markLastAdaptation(): void {
  localStorage.setItem(LAST_ADAPTATION_KEY, new Date().toISOString());
}

export function shouldSuppressAdaptation(): boolean {
  try {
    const stored = localStorage.getItem(LAST_ADAPTATION_KEY);
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
