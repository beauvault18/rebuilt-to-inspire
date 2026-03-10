"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import FadeTransition from "@/components/shared/FadeTransition";
import StepNavigation from "@/components/shared/StepNavigation";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import StepTreatmentPhase from "./StepTreatmentPhase";
import StepEatingHabits from "./StepEatingHabits";
import StepCuisinePrefs from "./StepCuisinePrefs";
import StepAllergies from "./StepAllergies";
import StepDislikedFoods from "./StepDislikedFoods";
import StepSnackPrefs from "./StepSnackPrefs";
import StepCookingBudget from "./StepCookingBudget";
import { useNutritionForm } from "@/hooks/useNutritionForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { generateNutritionPlan } from "@/lib/api";
import { markNutritionPlanCreated } from "@/lib/nutrition-checkin-storage";
import type { PlanResponse } from "@/types/plan";
import type { WorkoutDaySummary } from "@/types/nutrition";

const STEP_TITLES = [
  "Treatment Status",
  "Eating Habits",
  "Cuisine Preferences",
  "Allergies & Restrictions",
  "Foods You Dislike",
  "Snack Preferences",
  "Cooking & Budget",
];

/** Extract a simplified workout schedule from a stored exercise plan. */
function extractWorkoutSchedule(): WorkoutDaySummary[] {
  try {
    const stored = sessionStorage.getItem("rti_plan");
    if (!stored) return [];
    const planResponse: PlanResponse = JSON.parse(stored);
    const weeklyPlan = planResponse.plan?.weekly_plan;
    if (!weeklyPlan || weeklyPlan.length === 0) return [];

    return weeklyPlan
      .filter((day) => {
        // Skip rest days
        const focus = (day.focus || "").toLowerCase();
        return !focus.includes("rest") && !focus.includes("off");
      })
      .map((day) => {
        // Estimate total duration from warmup + main exercises + cooldown
        let duration = 0;
        if (day.warmup?.duration_min) duration += day.warmup.duration_min;
        if (day.cooldown?.duration_min) duration += day.cooldown.duration_min;
        // Estimate main workout time: ~3-4 min per exercise
        if (day.main) duration += day.main.length * 4;
        if (duration === 0) duration = 30; // fallback

        // Determine intensity from main exercises
        const intensities = (day.main || [])
          .map((ex) => (ex.intensity || "").toLowerCase())
          .filter(Boolean);
        const avgIntensity = intensities.includes("vigorous")
          ? "vigorous"
          : intensities.includes("moderate")
            ? "moderate"
            : "light";

        return {
          day: day.day,
          focus: day.focus,
          estimated_duration_min: duration,
          intensity: avgIntensity,
        };
      });
  } catch {
    return [];
  }
}

export default function NutritionShell() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data, setField, toggleInList, addToList, removeFromList, getApiPayload } =
    useNutritionForm();
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const totalSteps = STEP_TITLES.length;
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  const canProceed = useCallback(() => {
    switch (step) {
      case 0: // Treatment phase
        return data.treatment_phase !== "";
      case 1: // Eating habits
        return data.current_diet !== "";
      case 2: // Cuisine prefs
        return data.favorite_cuisines.length > 0;
      case 3: // Allergies
        return true;
      case 4: // Disliked foods
        return true;
      case 5: // Snack prefs
        return true;
      case 6: // Cooking & budget
        return true;
      default:
        return true;
    }
  }, [step, data]);

  const handleNext = useCallback(async () => {
    if (!canProceed()) return;

    if (isLast) {
      setIsSubmitting(true);
      setShow(false);
      setError("");
      try {
        const cancerTypes = profile?.cancer_types || [];
        const workoutSchedule = extractWorkoutSchedule();
        const payload = getApiPayload(cancerTypes, workoutSchedule);
        // Save questionnaire data for regeneration
        sessionStorage.setItem("rti_nutrition_questionnaire", JSON.stringify(payload));
        const response = await generateNutritionPlan(payload);
        sessionStorage.setItem("rti_nutrition_plan", JSON.stringify(response));
        markNutritionPlanCreated();
        router.push("/nutrition/plan");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate nutrition plan. Is the backend running?",
        );
        setIsSubmitting(false);
        setShow(true);
      }
      return;
    }

    setShow(false);
  }, [canProceed, isLast, getApiPayload, profile, router]);

  const handleNextWithDirection = useCallback(async () => {
    setDirection("forward");
    await handleNext();
  }, [handleNext]);

  const handleBackWithDirection = useCallback(() => {
    setDirection("back");
    setShow(false);
  }, []);

  const handleExitedWithDirection = useCallback(() => {
    if (isSubmitting) {
      router.push("/nutrition/plan");
      return;
    }
    if (direction === "forward" && !isLast) {
      setStep((s) => s + 1);
    } else if (direction === "back" && !isFirst) {
      setStep((s) => s - 1);
    }
    setShow(true);
  }, [isSubmitting, router, direction, isLast, isFirst]);

  if (isSubmitting && !show) {
    return <LoadingSpinner />;
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <StepTreatmentPhase
            data={data}
            setField={setField}
            toggleInList={toggleInList}
          />
        );
      case 1:
        return (
          <StepEatingHabits
            data={data}
            setField={setField}
            toggleInList={toggleInList}
          />
        );
      case 2:
        return <StepCuisinePrefs data={data} toggleInList={toggleInList} />;
      case 3:
        return <StepAllergies data={data} toggleInList={toggleInList} />;
      case 4:
        return (
          <StepDislikedFoods
            data={data}
            addToList={addToList}
            removeFromList={removeFromList}
          />
        );
      case 5:
        return <StepSnackPrefs data={data} toggleInList={toggleInList} />;
      case 6:
        return <StepCookingBudget data={data} setField={setField} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-base text-muted-foreground mb-3">
          <span>
            Step {step + 1} of {totalSteps}
          </span>
          <span className="font-medium">{STEP_TITLES[step]}</span>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-300 rounded-full"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-8">
          <FadeTransition
            show={show}
            duration={300}
            onExited={handleExitedWithDirection}
          >
            {renderStep()}
          </FadeTransition>

          {error && (
            <p className="text-sm text-destructive mt-4">{error}</p>
          )}

          <StepNavigation
            onBack={handleBackWithDirection}
            onNext={handleNextWithDirection}
            canProceed={canProceed()}
            isFirst={isFirst}
            isLast={isLast}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
