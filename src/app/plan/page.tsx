"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PlanDisplay from "@/components/plan/PlanDisplay";
import StageReveal from "@/components/plan/StageReveal";
import SiteHeader from "@/components/shared/SiteHeader";
import FadeTransition from "@/components/shared/FadeTransition";
import {
  loadWorkoutLog,
  loadPlanTracking,
  initTracking,
  getWeekNumber,
  hashPlan,
} from "@/lib/workout-storage";
import type { PlanResponse } from "@/types/plan";
import type { WorkoutLogEntry, PlanTracking } from "@/types/workout";

export default function PlanPage() {
  const router = useRouter();
  const [response, setResponse] = useState<PlanResponse | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [showReveal, setShowReveal] = useState(true);
  const [revealExited, setRevealExited] = useState(false);

  const [workoutLog, setWorkoutLog] = useState<WorkoutLogEntry[]>([]);
  const [planTracking, setPlanTracking] = useState<PlanTracking | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("rti_plan");
    if (!stored) {
      router.push("/questionnaire");
      return;
    }
    let parsed: PlanResponse;
    try {
      parsed = JSON.parse(stored);
    } catch {
      router.push("/questionnaire");
      return;
    }
    setResponse(parsed);

    try {
      const profile = sessionStorage.getItem("rti_profile");
      if (profile) {
        const { firstName } = JSON.parse(profile);
        setUserName(firstName);
      }
    } catch {}

    // Skip reveal if already seen this session
    const alreadyRevealed = sessionStorage.getItem("rti_stage_revealed");
    if (alreadyRevealed) {
      setShowReveal(false);
      setRevealExited(true);
    }

    // Load workout tracking from localStorage
    setWorkoutLog(loadWorkoutLog());

    // Initialize or validate plan tracking
    let tracking = loadPlanTracking();
    if (!tracking || tracking.planHash !== hashPlan(parsed)) {
      tracking = initTracking(parsed);
    }
    setPlanTracking(tracking);
  }, [router]);

  const handleContinue = () => {
    setShowReveal(false);
  };

  const handleRevealExited = () => {
    sessionStorage.setItem("rti_stage_revealed", "true");
    setRevealExited(true);
  };

  const weekNumber = planTracking ? getWeekNumber(planTracking) : 1;

  if (!response) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1">
        {!revealExited ? (
          <FadeTransition
            show={showReveal}
            duration={500}
            onExited={handleRevealExited}
          >
            <StageReveal
              progressionContext={response.progression_context}
              progressionStage={response.progression_stage}
              userName={userName}
              onContinue={handleContinue}
            />
          </FadeTransition>
        ) : (
          <FadeTransition show={true}>
            <div className="py-12 px-8 max-w-5xl mx-auto">
              <PlanDisplay
                response={response}
                userName={userName}
                workoutLog={workoutLog}
                onWorkoutLogUpdated={() => setWorkoutLog(loadWorkoutLog())}
                planTracking={planTracking}
                weekNumber={weekNumber}
                onPlanUpdate={(updated) => setResponse(updated)}
              />
            </div>
          </FadeTransition>
        )}
      </div>
    </div>
  );
}
