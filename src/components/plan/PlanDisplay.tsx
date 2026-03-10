"use client";

/**
 * Adaptive Fitness Intelligence
 *
 * Adapts slowly based on sustained post-workout patterns.
 * Observes check-in trends, then gently adjusts. Never the reverse.
 *
 * Do not:
 * - Add urgency indicators or alert styling
 * - Add performance metrics or trend graphs
 * - Add automatic escalation beyond Tier 2
 * - Execute adaptation outside the Program tab
 * - Conflate deload advisory (TodayTab) with plan adaptation (ProgramTab)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import PlanAnchor from "./PlanAnchor";
import TodayTab from "./TodayTab";
import ProgramTab from "./ProgramTab";
import SafetyTab from "./SafetyTab";
import { generatePlan } from "@/lib/api";
import { hasMentalSupportActivatedInLast7Days } from "@/lib/adaptive-throttle";
import {
  getTodayLog,
  getTodayDayIndex,
  loadWorkoutLog,
  getFitnessPendingAdaptation,
  clearFitnessPendingAdaptation,
  getFitnessPlanVersion,
  bumpFitnessPlanVersion,
  storeFitnessPreviousPlan,
  getFitnessPreviousPlan,
  clearFitnessPreviousPlan,
  isFitnessAdaptationDeclined,
  shouldSuppressFitnessAdaptation,
  markFitnessAdaptationDeclined,
  markLastFitnessAdaptation,
  isFitnessPendingAdaptationStale,
} from "@/lib/workout-storage";
import type { PlanResponse } from "@/types/plan";
import type { WorkoutLogEntry, PlanTracking } from "@/types/workout";
import type { AdaptationState, FitnessPendingAdaptation } from "@/types/fitness-adaptation";

interface Props {
  response: PlanResponse;
  userName?: string;
  workoutLog: WorkoutLogEntry[];
  onWorkoutLogUpdated: () => void;
  planTracking: PlanTracking | null;
  weekNumber: number;
  onPlanUpdate?: (response: PlanResponse) => void;
}

type TabId = "today" | "program" | "safety";

const TABS: { id: TabId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "program", label: "Program" },
  { id: "safety", label: "Safety" },
];

export default function PlanDisplay({
  response,
  userName,
  workoutLog,
  onWorkoutLogUpdated,
  planTracking,
  weekNumber,
  onPlanUpdate,
}: Props) {
  const router = useRouter();
  const days = response.plan.weekly_plan || [];
  const [activeIndex, setActiveIndex] = useState(
    () => getTodayDayIndex(days.length || 7),
  );
  const [activeTab, setActiveTab] = useState<TabId>("today");

  // Adaptation state
  const [adaptationState, setAdaptationState] = useState<AdaptationState>("idle");
  const [pendingAdaptation, setPendingAdaptation] = useState<FitnessPendingAdaptation | null>(null);
  const [adaptationError, setAdaptationError] = useState<string | null>(null);
  const [planVersion, setPlanVersion] = useState(1);
  const [canRevert, setCanRevert] = useState(false);
  const adaptationChecked = useRef(false);
  const executeAdaptationRef = useRef<(pending: FitnessPendingAdaptation) => Promise<void>>(null);

  const activeDay = days[activeIndex];
  const todayCompleted = getTodayLog(workoutLog) !== null;

  const executeAdaptation = useCallback(async (pending: FitnessPendingAdaptation) => {
    setAdaptationState("adapting");
    setAdaptationError(null);

    const storedPayload = sessionStorage.getItem("rti_questionnaire");
    if (!storedPayload) {
      setAdaptationState("error");
      setAdaptationError("Original questionnaire not found. Please regenerate manually.");
      clearFitnessPendingAdaptation();
      return;
    }

    let payload;
    try {
      payload = JSON.parse(storedPayload);
    } catch {
      setAdaptationState("error");
      setAdaptationError("Stored questionnaire data is corrupted. Please regenerate manually.");
      clearFitnessPendingAdaptation();
      return;
    }

    try {
      payload.questionnaire.adaptive_context = {
        tier: pending.tier,
        signals: pending.signals,
      };
      const newResponse = await generatePlan(payload);

      // Store previous plan for revert
      storeFitnessPreviousPlan(response);

      // Update plan
      sessionStorage.setItem("rti_plan", JSON.stringify(newResponse));
      const newVersion = bumpFitnessPlanVersion();
      markLastFitnessAdaptation();
      clearFitnessPendingAdaptation();

      setActiveIndex(0);
      setPlanVersion(newVersion);
      setCanRevert(true);
      setPendingAdaptation(null);
      setAdaptationState("success");
      onPlanUpdate?.(newResponse);
    } catch {
      setAdaptationState("error");
      setAdaptationError("Adaptation failed. Your current plan is unchanged.");
      clearFitnessPendingAdaptation();
    }
  }, [response, onPlanUpdate]);

  executeAdaptationRef.current = executeAdaptation;

  // Initialize version and revert state on mount
  useEffect(() => {
    setPlanVersion(getFitnessPlanVersion());
    setCanRevert(getFitnessPreviousPlan() !== null);
  }, []);

  // Adaptation detection — only when Program tab becomes active
  useEffect(() => {
    if (activeTab !== "program" || adaptationChecked.current) return;
    adaptationChecked.current = true;

    const pending = getFitnessPendingAdaptation();
    if (!pending) return;

    // Stale, declined, recently adapted, or cross-pillar throttled — discard silently
    if (isFitnessPendingAdaptationStale() || isFitnessAdaptationDeclined() || shouldSuppressFitnessAdaptation() || hasMentalSupportActivatedInLast7Days()) {
      if (isFitnessPendingAdaptationStale()) clearFitnessPendingAdaptation();
      return;
    }

    if (pending.tier === 1) {
      executeAdaptationRef.current?.(pending);
    } else {
      setPendingAdaptation(pending);
      setAdaptationState("awaiting_confirmation");
    }
  }, [activeTab]);

  const handleDecline = () => {
    markFitnessAdaptationDeclined();
    clearFitnessPendingAdaptation();
    setPendingAdaptation(null);
    setAdaptationState("declined");
  };

  const handleRevert = () => {
    const previous = getFitnessPreviousPlan();
    if (!previous) return;
    sessionStorage.setItem("rti_plan", JSON.stringify(previous));
    clearFitnessPreviousPlan();
    // Treat revert as an explicit "not now" — prevent re-adaptation
    markFitnessAdaptationDeclined();
    setActiveIndex(0);
    setCanRevert(false);
    setPlanVersion((v) => Math.max(1, v - 1));
    onPlanUpdate?.(previous);
  };

  return (
    <div className="space-y-8">
      {/* Persistent Anchor Header */}
      <PlanAnchor
        userName={userName}
        progressionContext={response.progression_context}
        progressionStage={response.progression_stage}
        weekNumber={weekNumber}
        days={days}
        activeIndex={activeIndex}
        onSelectDay={setActiveIndex}
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-surface-card rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-5 py-2.5 text-base font-medium transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? "bg-surface-panel text-foreground ring-1 ring-white/15"
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
        {activeTab === "today" && activeDay && (
          <TodayTab
            day={activeDay}
            dayIndex={activeIndex}
            response={response}
            todayCompleted={todayCompleted}
            workoutLog={workoutLog}
            planTracking={planTracking}
            weekNumber={weekNumber}
            onWorkoutLogged={() => onWorkoutLogUpdated()}
          />
        )}

        {activeTab === "today" && !activeDay && (
          <div className="py-16 text-center">
            <p className="text-base text-muted-foreground">
              No workout data available.
            </p>
          </div>
        )}

        {activeTab === "program" && (
          <ProgramTab
            response={response}
            workoutLog={workoutLog}
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
          <SafetyTab response={response} activeDay={activeDay} />
        )}
      </div>
    </div>
  );
}
