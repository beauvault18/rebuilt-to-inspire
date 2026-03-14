"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FadeTransition from "@/components/shared/FadeTransition";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import QuestionLayout from "@/components/questionnaire/QuestionLayout";
import OptionCard from "@/components/questionnaire/OptionCard";
import { useNutritionForm } from "@/hooks/useNutritionForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { generateNutritionPlan } from "@/lib/api";
import { markNutritionPlanCreated } from "@/lib/nutrition-checkin-storage";
import type { NutritionQuestionnaireData } from "@/types/nutrition";
import type { PlanResponse } from "@/types/plan";
import type { WorkoutDaySummary } from "@/types/nutrition";
import {
  TREATMENT_PHASES,
  CURRENT_MEDICATIONS,
  CURRENT_DIETS,
  APPETITE_LEVELS,
  DIGESTIVE_ISSUES,
  CUISINES,
  ALLERGIES,
  DIETARY_RESTRICTIONS,
  SNACK_PREFERENCES,
  COOKING_SKILLS,
  BUDGET_PREFERENCES,
  MEAL_PREP_TIMES,
} from "@/lib/nutrition-constants";

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------
interface StepDef {
  id: string;
  validate: (d: NutritionQuestionnaireData) => boolean;
}

const STEPS: StepDef[] = [
  // Intro
  { id: "welcome", validate: () => true },

  // Treatment
  { id: "treatment_phase", validate: (d) => d.treatment_phase !== "" },
  { id: "medications", validate: () => true },

  // Diet & appetite
  { id: "current_diet", validate: (d) => d.current_diet !== "" },
  { id: "meals_per_day", validate: () => true },
  { id: "appetite", validate: () => true },
  { id: "digestive_issues", validate: () => true },

  // Preferences
  { id: "cuisines", validate: (d) => d.favorite_cuisines.length > 0 },
  { id: "allergies", validate: () => true },
  { id: "dietary_restrictions", validate: () => true },
  { id: "disliked_foods", validate: () => true },
  { id: "snacks", validate: () => true },

  // Practical
  { id: "cooking_skill", validate: () => true },
  { id: "budget", validate: () => true },
  { id: "prep_time", validate: () => true },
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
        const focus = (day.focus || "").toLowerCase();
        return !focus.includes("rest") && !focus.includes("off");
      })
      .map((day) => {
        let duration = 0;
        if (day.warmup?.duration_min) duration += day.warmup.duration_min;
        if (day.cooldown?.duration_min) duration += day.cooldown.duration_min;
        if (day.main) duration += day.main.length * 4;
        if (duration === 0) duration = 30;

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function NutritionShell() {
  const router = useRouter();
  const { profile } = useAuth();
  const {
    data,
    setField,
    toggleInList,
    addToList,
    removeFromList,
    getApiPayload,
  } = useNutritionForm();

  const [stepIndex, setStepIndex] = useState(0);
  const [show, setShow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [dislikedInput, setDislikedInput] = useState("");

  const totalSteps = STEPS.length;
  const currentStep = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  const canProceed = useMemo(
    () => currentStep.validate(data),
    [currentStep, data],
  );

  // Navigation
  const handleNext = useCallback(async () => {
    if (!canProceed) return;

    if (isLast) {
      setIsSubmitting(true);
      setShow(false);
      setError("");
      try {
        const cancerTypes = profile?.cancer_types || [];
        const workoutSchedule = extractWorkoutSchedule();
        const payload = getApiPayload(cancerTypes, workoutSchedule);
        sessionStorage.setItem(
          "rti_nutrition_questionnaire",
          JSON.stringify(payload),
        );
        const response = await generateNutritionPlan(payload);
        sessionStorage.setItem(
          "rti_nutrition_plan",
          JSON.stringify(response),
        );
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

    setDirection("forward");
    setShow(false);
  }, [canProceed, isLast, getApiPayload, profile, router]);

  const handleBack = useCallback(() => {
    if (isFirst) return;
    setDirection("back");
    setShow(false);
  }, [isFirst]);

  const handleExited = useCallback(() => {
    if (isSubmitting) return;
    if (direction === "forward" && !isLast) {
      setStepIndex((s) => s + 1);
    } else if (direction === "back" && !isFirst) {
      setStepIndex((s) => s - 1);
    }
    setShow(true);
  }, [isSubmitting, direction, isLast, isFirst]);

  // Loading state
  if (isSubmitting && !show) {
    return <LoadingSpinner />;
  }

  // ---------------------------------------------------------------------------
  // Render step content
  // ---------------------------------------------------------------------------
  const renderStep = () => {
    switch (currentStep.id) {
      case "welcome":
        return (
          <QuestionLayout
            title="Let's build your meal plan"
            description="We'll ask a few questions about your treatment, preferences, and lifestyle to create a personalized nutrition plan backed by cancer-specific research."
          >
            <div className="rounded-2xl border-2 border-surface-border bg-surface-elevated/60 p-6 space-y-3">
              <p className="text-base font-semibold">
                Why nutrition matters during recovery
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Proper nutrition helps manage treatment side effects, supports
                immune function, maintains muscle mass, and improves energy
                levels. Your meal plan will be tailored to your specific
                treatment phase and dietary needs.
              </p>
            </div>
          </QuestionLayout>
        );

      case "treatment_phase":
        return (
          <QuestionLayout
            title="Where are you in treatment?"
            description="This helps us tailor recommendations to your current needs."
          >
            <div className="space-y-3">
              {TREATMENT_PHASES.map((phase) => (
                <OptionCard
                  key={phase.value}
                  label={phase.label}
                  selected={data.treatment_phase === phase.value}
                  onClick={() => setField("treatment_phase", phase.value)}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "medications":
        return (
          <QuestionLayout
            title="Are you on any medications?"
            description="Some medications interact with certain foods. Select all that apply."
          >
            <div className="space-y-3">
              {CURRENT_MEDICATIONS.map((med) => (
                <OptionCard
                  key={med.value}
                  label={med.label}
                  selected={data.current_medications.includes(med.value)}
                  onClick={() => {
                    if (med.value === "none") {
                      setField("current_medications", ["none"]);
                    } else {
                      const current = data.current_medications.filter(
                        (m) => m !== "none",
                      );
                      if (current.includes(med.value)) {
                        setField(
                          "current_medications",
                          current.filter((m) => m !== med.value),
                        );
                      } else {
                        setField("current_medications", [
                          ...current,
                          med.value,
                        ]);
                      }
                    }
                  }}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "current_diet":
        return (
          <QuestionLayout
            title="How would you describe your current diet?"
            description="No judgment — this helps us meet you where you are."
          >
            <div className="space-y-3">
              {CURRENT_DIETS.map((diet) => (
                <OptionCard
                  key={diet.value}
                  label={diet.label}
                  selected={data.current_diet === diet.value}
                  onClick={() => setField("current_diet", diet.value)}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "meals_per_day":
        return (
          <QuestionLayout
            title="How many meals do you eat per day?"
            description="Include main meals — we'll handle snacks separately."
          >
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setField("meals_per_day", n)}
                  className={`py-5 rounded-xl border-2 text-xl font-semibold transition-all ${
                    data.meals_per_day === n
                      ? "border-brand bg-brand/10 text-foreground"
                      : "border-surface-border text-muted-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </QuestionLayout>
        );

      case "appetite":
        return (
          <QuestionLayout
            title="How would you describe your appetite?"
            description="Treatment can significantly affect appetite. Be honest."
          >
            <div className="space-y-3">
              {APPETITE_LEVELS.map((level) => (
                <OptionCard
                  key={level.value}
                  label={`${level.label} — ${level.description}`}
                  selected={data.appetite_level === level.value}
                  onClick={() => setField("appetite_level", level.value)}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "digestive_issues":
        return (
          <QuestionLayout
            title="Any digestive issues?"
            description="Select all that apply. We'll adjust food choices accordingly."
          >
            <div className="space-y-3">
              {DIGESTIVE_ISSUES.map((issue) => (
                <OptionCard
                  key={issue.value}
                  label={issue.label}
                  selected={data.digestive_issues.includes(issue.value)}
                  onClick={() => {
                    if (issue.value === "none") {
                      setField("digestive_issues", ["none"]);
                    } else {
                      const current = data.digestive_issues.filter(
                        (i) => i !== "none",
                      );
                      if (current.includes(issue.value)) {
                        setField(
                          "digestive_issues",
                          current.filter((i) => i !== issue.value),
                        );
                      } else {
                        setField("digestive_issues", [
                          ...current,
                          issue.value,
                        ]);
                      }
                    }
                  }}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "cuisines":
        return (
          <QuestionLayout
            title="What cuisines do you enjoy?"
            description="Select all that appeal to you. We'll build meals around your tastes."
          >
            <div className="grid grid-cols-2 gap-3">
              {CUISINES.map((c) => (
                <OptionCard
                  key={c.value}
                  label={c.label}
                  selected={data.favorite_cuisines.includes(c.value)}
                  onClick={() => toggleInList("favorite_cuisines", c.value)}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "allergies":
        return (
          <QuestionLayout
            title="Do you have any food allergies?"
            description="Select all that apply so we can keep your meals safe."
          >
            <div className="space-y-3">
              {ALLERGIES.map((a) => (
                <OptionCard
                  key={a.value}
                  label={a.label}
                  selected={data.allergies.includes(a.value)}
                  onClick={() => {
                    if (a.value === "none") {
                      setField("allergies", ["none"]);
                    } else {
                      const current = data.allergies.filter(
                        (i) => i !== "none",
                      );
                      if (current.includes(a.value)) {
                        setField(
                          "allergies",
                          current.filter((i) => i !== a.value),
                        );
                      } else {
                        setField("allergies", [...current, a.value]);
                      }
                    }
                  }}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "dietary_restrictions":
        return (
          <QuestionLayout
            title="Any dietary restrictions?"
            description="Select all that apply."
          >
            <div className="space-y-3">
              {DIETARY_RESTRICTIONS.map((r) => (
                <OptionCard
                  key={r.value}
                  label={r.label}
                  selected={data.dietary_restrictions.includes(r.value)}
                  onClick={() => {
                    if (r.value === "none") {
                      setField("dietary_restrictions", ["none"]);
                    } else {
                      const current = data.dietary_restrictions.filter(
                        (i) => i !== "none",
                      );
                      if (current.includes(r.value)) {
                        setField(
                          "dietary_restrictions",
                          current.filter((i) => i !== r.value),
                        );
                      } else {
                        setField("dietary_restrictions", [
                          ...current,
                          r.value,
                        ]);
                      }
                    }
                  }}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "disliked_foods": {
        const handleAddDisliked = () => {
          const trimmed = dislikedInput.trim().toLowerCase();
          if (trimmed && !data.disliked_foods.includes(trimmed)) {
            addToList("disliked_foods", trimmed);
            setDislikedInput("");
          }
        };
        return (
          <QuestionLayout
            title="Any foods you really dislike?"
            description="Type them in and we'll avoid them in your meal plan."
          >
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={dislikedInput}
                  onChange={(e) => setDislikedInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddDisliked()}
                  placeholder="e.g. broccoli, mushrooms, tofu..."
                  className="h-14 text-lg rounded-2xl flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddDisliked}
                  className="h-14 px-6 rounded-2xl bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  Add
                </Button>
              </div>
              {data.disliked_foods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.disliked_foods.map((food) => (
                    <Badge
                      key={food}
                      variant="secondary"
                      className="text-base px-4 py-2 cursor-pointer hover:bg-destructive/20"
                      onClick={() => removeFromList("disliked_foods", food)}
                    >
                      {food} ×
                    </Badge>
                  ))}
                </div>
              )}
              {data.disliked_foods.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No disliked foods added yet. Skip if none.
                </p>
              )}
            </div>
          </QuestionLayout>
        );
      }

      case "snacks":
        return (
          <QuestionLayout
            title="What snacks do you enjoy?"
            description="Select your favorites and we'll work them into your plan."
          >
            <div className="grid grid-cols-2 gap-3">
              {SNACK_PREFERENCES.map((s) => (
                <OptionCard
                  key={s.value}
                  label={s.label}
                  selected={data.snack_preferences.includes(s.value)}
                  onClick={() => toggleInList("snack_preferences", s.value)}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "cooking_skill":
        return (
          <QuestionLayout
            title="What's your cooking skill level?"
            description="We'll match recipe complexity to your comfort zone."
          >
            <div className="space-y-3">
              {COOKING_SKILLS.map((s) => (
                <OptionCard
                  key={s.value}
                  label={`${s.label} — ${s.description}`}
                  selected={data.cooking_skill === s.value}
                  onClick={() => setField("cooking_skill", s.value)}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "budget":
        return (
          <QuestionLayout
            title="What's your budget preference?"
            description="We'll find options that work for your wallet."
          >
            <div className="space-y-3">
              {BUDGET_PREFERENCES.map((b) => (
                <OptionCard
                  key={b.value}
                  label={b.label}
                  selected={data.budget_preference === b.value}
                  onClick={() => setField("budget_preference", b.value)}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Per-person weekly estimates based on USDA Food Plans: Cost of Food at Home Reports, Jan 2025.
            </p>
          </QuestionLayout>
        );

      case "prep_time":
        return (
          <QuestionLayout
            title="How much time do you have to cook each meal?"
            description="On average, per meal."
          >
            <div className="space-y-3">
              {MEAL_PREP_TIMES.map((t) => (
                <OptionCard
                  key={t.value}
                  label={t.label}
                  selected={data.meal_prep_time === t.value}
                  onClick={() => setField("meal_prep_time", t.value)}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
      <div className="w-full space-y-8">
        {/* Progress bar */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirst}
            className={`shrink-0 p-1.5 -ml-1.5 rounded-lg hover:bg-surface-elevated transition-colors ${
              isFirst
                ? "invisible"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1 h-2.5 bg-muted/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step content */}
        <FadeTransition show={show} duration={250} onExited={handleExited}>
          {renderStep()}
        </FadeTransition>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Continue button */}
        <Button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="w-full h-14 text-lg font-semibold rounded-2xl bg-brand text-brand-foreground hover:bg-brand/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          {isSubmitting
            ? "Generating..."
            : isLast
              ? "Build My Meal Plan"
              : "Continue"}
        </Button>
      </div>
    </div>
  );
}
