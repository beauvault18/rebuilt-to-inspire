"use client";

/**
 * Phase 3 — Adaptive Nutrition Intelligence
 *
 * This system adapts slowly and softly based on weekly fueling reflections.
 * It observes, then advises, then gently adjusts. Never the reverse.
 *
 * Do not:
 * - Add urgency indicators or alert styling
 * - Add performance metrics or trend graphs
 * - Add automatic escalation beyond Tier 2
 * - Add push notifications or dashboard-level adaptation
 * - Execute adaptation outside the Plan tab
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import NutritionAnchor from "./NutritionAnchor";
import NutritionTodayTab from "./NutritionTodayTab";
import NutritionPlanTab from "./NutritionPlanTab";
import NutritionSafetyTab from "./NutritionSafetyTab";
import { generateNutritionPlan } from "@/lib/api";
import { hasMentalSupportActivatedInLast7Days } from "@/lib/adaptive-throttle";
import {
  getPendingAdaptation,
  clearPendingAdaptation,
  getPlanVersion,
  bumpPlanVersion,
  storePreviousPlan,
  getPreviousPlan,
  clearPreviousPlan,
  isAdaptationDeclined,
  shouldSuppressAdaptation,
  markAdaptationDeclined,
  markLastAdaptation,
  isPendingAdaptationStale,
} from "@/lib/nutrition-checkin-storage";
import type { NutritionPlanResponse, NutritionQuestionnaireData, WorkoutDaySummary } from "@/types/nutrition";
import type { AdaptationState, PendingAdaptation } from "@/types/nutrition-adaptation";

type QuestionnairePayload = NutritionQuestionnaireData & {
  cancer_types: string[];
  workout_schedule: WorkoutDaySummary[];
};

interface Props {
  plan: NutritionPlanResponse;
  questionnaire?: QuestionnairePayload | null;
  onPlanUpdate?: (plan: NutritionPlanResponse) => void;
}

type TabId = "today" | "plan" | "safety";

const TABS: { id: TabId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "plan", label: "Plan" },
  { id: "safety", label: "Safety" },
];

export default function NutritionPlanDisplay({
  plan,
  questionnaire,
  onPlanUpdate,
}: Props) {
  const router = useRouter();
  const [dayIndex, setDayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [regenerating, setRegenerating] = useState(false);

  // Adaptation state
  const [adaptationState, setAdaptationState] = useState<AdaptationState>("idle");
  const [pendingAdaptation, setPendingAdaptation] = useState<PendingAdaptation | null>(null);
  const [adaptationError, setAdaptationError] = useState<string | null>(null);
  const [planVersion, setPlanVersion] = useState(1);
  const [canRevert, setCanRevert] = useState(false);
  const adaptationChecked = useRef(false);
  const executeAdaptationRef = useRef<(pending: PendingAdaptation) => Promise<void>>(null);

  const currentDay = plan.meal_plan[dayIndex];

  const executeAdaptation = useCallback(async (pending: PendingAdaptation) => {
    setAdaptationState("adapting");
    setAdaptationError(null);

    const storedPayload = sessionStorage.getItem("rti_nutrition_questionnaire");
    if (!storedPayload) {
      setAdaptationState("error");
      setAdaptationError("Original questionnaire not found. Please regenerate manually.");
      clearPendingAdaptation();
      return;
    }

    let payload;
    try {
      payload = JSON.parse(storedPayload);
    } catch {
      setAdaptationState("error");
      setAdaptationError("Stored questionnaire data is corrupted. Please regenerate manually.");
      clearPendingAdaptation();
      return;
    }

    try {
      payload.adaptive_context = {
        tier: pending.tier,
        signals: pending.signals,
      };
      const response = await generateNutritionPlan(payload);

      // Store previous plan for revert
      storePreviousPlan(plan);

      // Update plan
      sessionStorage.setItem("rti_nutrition_plan", JSON.stringify(response));
      const newVersion = bumpPlanVersion();
      markLastAdaptation();
      clearPendingAdaptation();

      setDayIndex(0);
      setPlanVersion(newVersion);
      setCanRevert(true);
      setPendingAdaptation(null);
      setAdaptationState("success");
      onPlanUpdate?.(response);
    } catch {
      setAdaptationState("error");
      setAdaptationError("Adaptation failed. Your current plan is unchanged.");
      clearPendingAdaptation();
    }
  }, [plan, onPlanUpdate]);

  executeAdaptationRef.current = executeAdaptation;

  // Initialize version and revert state on mount
  useEffect(() => {
    setPlanVersion(getPlanVersion());
    setCanRevert(getPreviousPlan() !== null);
  }, []);

  // Adaptation detection — only when Plan tab becomes active
  useEffect(() => {
    if (activeTab !== "plan" || adaptationChecked.current) return;
    adaptationChecked.current = true;

    const pending = getPendingAdaptation();
    if (!pending) return;

    // Stale, declined, recently adapted, or cross-pillar throttled — discard silently
    if (isPendingAdaptationStale() || isAdaptationDeclined() || shouldSuppressAdaptation() || hasMentalSupportActivatedInLast7Days()) {
      if (isPendingAdaptationStale()) clearPendingAdaptation();
      return;
    }

    if (pending.tier === 1) {
      executeAdaptationRef.current?.(pending);
    } else {
      setPendingAdaptation(pending);
      setAdaptationState("awaiting_confirmation");
    }
  }, [activeTab]);

  const handleRegenerate = async () => {
    const storedPayload = sessionStorage.getItem("rti_nutrition_questionnaire");
    if (!storedPayload) {
      router.push("/nutrition");
      return;
    }
    let payload;
    try {
      payload = JSON.parse(storedPayload);
    } catch {
      router.push("/nutrition");
      return;
    }

    setRegenerating(true);
    try {
      const response = await generateNutritionPlan(payload);
      sessionStorage.setItem("rti_nutrition_plan", JSON.stringify(response));
      setDayIndex(0);
      onPlanUpdate?.(response);
    } catch {
      // If regeneration fails, stay on current plan
    } finally {
      setRegenerating(false);
    }
  };

  const handleDecline = () => {
    markAdaptationDeclined();
    clearPendingAdaptation();
    setPendingAdaptation(null);
    setAdaptationState("declined");
  };

  const handleRevert = () => {
    const previous = getPreviousPlan();
    if (!previous) return;
    sessionStorage.setItem("rti_nutrition_plan", JSON.stringify(previous));
    clearPreviousPlan();
    // Treat revert as an explicit "not now" — prevent re-adaptation
    markAdaptationDeclined();
    setDayIndex(0);
    setCanRevert(false);
    setPlanVersion((v) => Math.max(1, v - 1));
    onPlanUpdate?.(previous);
  };

  return (
    <div className="space-y-8">
      {/* Persistent Anchor Header */}
      <NutritionAnchor
        treatmentPhase={questionnaire?.treatment_phase}
        days={plan.meal_plan}
        activeIndex={dayIndex}
        onSelectDay={setDayIndex}
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-surface-card rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-5 py-2.5 text-base font-medium transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? "bg-surface-panel text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={{
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "today" && currentDay && (
          <NutritionTodayTab
            day={currentDay}
            plan={plan}
            questionnaire={questionnaire}
          />
        )}

        {activeTab === "today" && !currentDay && (
          <div className="py-16 text-center">
            <p className="text-base text-muted-foreground">
              No meal data available.
            </p>
          </div>
        )}

        {activeTab === "plan" && (
          <NutritionPlanTab
            plan={plan}
            questionnaire={questionnaire}
            onRegenerate={handleRegenerate}
            regenerating={regenerating}
            adaptationState={adaptationState}
            pendingAdaptation={pendingAdaptation}
            adaptationError={adaptationError}
            planVersion={planVersion}
            canRevert={canRevert}
            onAcceptAdaptation={() => pendingAdaptation && executeAdaptation(pendingAdaptation)}
            onDeclineAdaptation={handleDecline}
            onRevert={handleRevert}
          />
        )}

        {activeTab === "safety" && (
          <NutritionSafetyTab plan={plan} />
        )}
      </div>
    </div>
  );
}
