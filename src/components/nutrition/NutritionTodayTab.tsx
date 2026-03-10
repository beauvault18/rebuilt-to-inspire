"use client";

import DaySummaryBar from "./DaySummaryBar";
import MealCard from "./MealCard";
import type { MealDay, NutritionPlanResponse } from "@/types/nutrition";

interface QuestionnairePayload {
  treatment_phase: string;
  current_medications: string[];
  current_diet: string;
  meals_per_day: number;
  appetite_level: string;
  digestive_issues: string[];
  favorite_cuisines: string[];
  allergies: string[];
  dietary_restrictions: string[];
  disliked_foods: string[];
  snack_preferences: string[];
  cooking_skill: string;
  budget_preference: string;
  meal_prep_time: string;
  cancer_types: string[];
}

interface Props {
  day: MealDay;
  plan: NutritionPlanResponse;
  questionnaire?: QuestionnairePayload | null;
}

export default function NutritionTodayTab({ day, plan }: Props) {
  const mealCount = day.meals.length;
  const firstHydration = plan.hydration_tips?.[0];
  const firstMedTiming = plan.medication_timing?.[0];

  return (
    <div className="space-y-8">
      {/* Today's Fueling */}
      <div>
        <h2 className="text-xl font-semibold">
          Today&apos;s Fueling
        </h2>
        <p className="text-base text-muted-foreground mt-1">
          {day.day} &middot; {mealCount} meal{mealCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Daily Summary Card */}
      <div className="bg-surface-card rounded-lg p-6 space-y-4">
        <DaySummaryBar day={day} />

        {firstHydration && (
          <p className="text-base text-muted-foreground">
            <span className="font-medium">Hydration:</span> {firstHydration}
          </p>
        )}

        {firstMedTiming && (
          <p className="text-base text-muted-foreground">
            <span className="font-medium">Medication timing:</span> {firstMedTiming}
          </p>
        )}
      </div>

      {/* Compact Meal Cards */}
      <div className="space-y-4">
        {day.meals.map((meal, i) => (
          <MealCard key={`${meal.type}-${i}`} meal={meal} compact />
        ))}
      </div>

      {/* View more link */}
      <p className="text-base text-muted-foreground">
        View grocery list and snack suggestions in the{" "}
        <span className="font-medium text-foreground">Plan</span> tab.
      </p>
    </div>
  );
}
