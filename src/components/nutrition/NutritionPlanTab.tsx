"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Undo2 } from "lucide-react";
import GroceryListCard from "./GroceryListCard";
import SnackCard from "./SnackCard";
import {
  getLastNutritionCheckIn,
  daysSinceLastNutritionCheckIn,
} from "@/lib/nutrition-checkin-storage";
import type { NutritionPlanResponse, MealDay } from "@/types/nutrition";
import type { NutritionCheckIn } from "@/types/nutrition-checkin";
import type {
  AdaptationState,
  AdaptationSignal,
  PendingAdaptation,
} from "@/types/nutrition-adaptation";

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
  plan: NutritionPlanResponse;
  questionnaire?: QuestionnairePayload | null;
  onRegenerate: () => Promise<void>;
  regenerating: boolean;
  adaptationState: AdaptationState;
  pendingAdaptation: PendingAdaptation | null;
  adaptationError: string | null;
  planVersion: number;
  canRevert: boolean;
  onAcceptAdaptation: () => void;
  onDeclineAdaptation: () => void;
  onRevert: () => void;
}

function computeWeeklyAverages(days: MealDay[]) {
  if (days.length === 0) return null;
  let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
  for (const day of days) {
    const t = day.daily_totals ?? {
      calories: day.meals.reduce((s, m) => s + (m.calories || 0), 0),
      protein_g: day.meals.reduce((s, m) => s + (m.protein_g || 0), 0),
      carbs_g: day.meals.reduce((s, m) => s + (m.carbs_g || 0), 0),
      fat_g: day.meals.reduce((s, m) => s + (m.fat_g || 0), 0),
    };
    totalCal += t.calories;
    totalP += t.protein_g;
    totalC += t.carbs_g;
    totalF += t.fat_g;
  }
  const n = days.length;
  return {
    calories: Math.round(totalCal / n),
    protein_g: Math.round(totalP / n),
    carbs_g: Math.round(totalC / n),
    fat_g: Math.round(totalF / n),
  };
}

function describeSignal(signal: AdaptationSignal): string {
  switch (signal.metric) {
    case "appetite":
      return `Your appetite has been low for ${signal.consecutiveCount} week${signal.consecutiveCount !== 1 ? "s" : ""}`;
    case "gi":
      return `Digestive comfort has been challenging for ${signal.consecutiveCount} week${signal.consecutiveCount !== 1 ? "s" : ""}`;
    case "weight":
      return "Significant weight change was noted";
    default:
      return "";
  }
}

export default function NutritionPlanTab({
  plan,
  questionnaire,
  onRegenerate,
  regenerating,
  adaptationState,
  pendingAdaptation,
  adaptationError,
  planVersion,
  canRevert,
  onAcceptAdaptation,
  onDeclineAdaptation,
  onRevert,
}: Props) {
  const averages = computeWeeklyAverages(plan.meal_plan);

  const [lastCheckIn, setLastCheckIn] = useState<NutritionCheckIn | null>(null);
  const [daysSince, setDaysSince] = useState<number | null>(null);
  const [showTransient, setShowTransient] = useState(true);

  useEffect(() => {
    setLastCheckIn(getLastNutritionCheckIn());
    setDaysSince(daysSinceLastNutritionCheckIn());
  }, []);

  // Auto-clear success/error after 8 seconds
  useEffect(() => {
    if (adaptationState === "success" || adaptationState === "error") {
      setShowTransient(true);
      const timer = setTimeout(() => setShowTransient(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [adaptationState]);

  // Soft advisory: appetite <= 2 OR gi <= 2 OR weightTrend === "significantly_down"
  const showAdvisory = lastCheckIn && (
    lastCheckIn.appetite <= 2 ||
    lastCheckIn.gi <= 2 ||
    lastCheckIn.weightTrend === "significantly_down"
  );

  const hasProgramInfo = questionnaire && (
    questionnaire.treatment_phase ||
    questionnaire.favorite_cuisines.length > 0 ||
    questionnaire.cooking_skill
  );

  return (
    <div className="space-y-12">
      {/* Program Overview */}
      {hasProgramInfo && questionnaire && (
        <div className="bg-surface-panel rounded-xl p-8 space-y-4">
          <h2 className="text-xl font-semibold">Program Overview</h2>
          <div className="flex flex-wrap gap-8">
            {questionnaire.treatment_phase && (
              <div>
                <p className="text-base text-muted-foreground">Treatment Phase</p>
                <p className="text-lg font-semibold capitalize">
                  {questionnaire.treatment_phase.replace(/_/g, " ")}
                </p>
              </div>
            )}
            {questionnaire.favorite_cuisines.length > 0 && (
              <div>
                <p className="text-base text-muted-foreground">Cuisine Preferences</p>
                <p className="text-lg font-semibold capitalize">
                  {questionnaire.favorite_cuisines.join(", ")}
                </p>
              </div>
            )}
            {questionnaire.cooking_skill && (
              <div>
                <p className="text-base text-muted-foreground">Cooking Level</p>
                <p className="text-lg font-semibold capitalize">
                  {questionnaire.cooking_skill.replace(/_/g, " ")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Fueling */}
      <div className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Weekly Fueling</h2>
          {daysSince !== null && (
            <p className="text-sm text-muted-foreground">
              Last Fueling Reflection: {daysSince === 0 ? "today" : `${daysSince} day${daysSince !== 1 ? "s" : ""} ago`}
            </p>
          )}
        </div>

        {/* Tier 2 Proposal */}
        {adaptationState === "awaiting_confirmation" && pendingAdaptation && (
          <div className="border-l-2 border-surface-border/40 pl-4 space-y-3">
            <p className="text-base font-medium">
              Based on your recent fueling reflections, your plan could be adjusted
            </p>
            <div className="space-y-1">
              {pendingAdaptation.signals.map((signal, i) => (
                <p key={i} className="text-base text-muted-foreground">
                  {describeSignal(signal)}
                </p>
              ))}
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                onClick={onAcceptAdaptation}
                className="bg-brand text-brand-foreground hover:brightness-110"
              >
                Adapt Plan
              </Button>
              <Button variant="ghost" onClick={onDeclineAdaptation}>
                Not Now
              </Button>
            </div>
          </div>
        )}

        {/* Adapting indicator */}
        {adaptationState === "adapting" && (
          <div className="border-l-2 border-surface-border/40 pl-4 flex items-center gap-3">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <p className="text-base text-muted-foreground">Adapting your plan...</p>
          </div>
        )}

        {/* Success attribution */}
        {adaptationState === "success" && showTransient && (
          <div className="border-l-2 border-surface-border/40 pl-4">
            <p className="text-base text-muted-foreground">
              Your plan has been gently adjusted based on your recent reflections
            </p>
          </div>
        )}

        {/* Error message */}
        {adaptationState === "error" && showTransient && adaptationError && (
          <div className="border-l-2 border-surface-border/40 pl-4">
            <p className="text-base text-muted-foreground">{adaptationError}</p>
          </div>
        )}

        {/* Soft advisory — only when recent reflection flags concern */}
        {showAdvisory && adaptationState !== "awaiting_confirmation" && adaptationState !== "adapting" && (
          <div className="border-l-2 border-surface-border/40 pl-4 space-y-2">
            <p className="text-sm text-muted-foreground">Based on your recent fueling reflection:</p>
            <p className="text-base font-medium">Your body may need extra support this week</p>
            <p className="text-base text-muted-foreground">
              {lastCheckIn!.appetite <= 2 && "Your appetite has been low — smaller, nutrient-dense meals may help. "}
              {lastCheckIn!.gi <= 2 && "Digestive comfort has been challenging — consider gentler preparation methods. "}
              {lastCheckIn!.weightTrend === "significantly_down" && "Significant weight change noted — calorie-dense options and your care team can help."}
            </p>
          </div>
        )}

        {/* Weekly Averages */}
        {averages && (
          <div className="bg-surface-card rounded-lg p-6">
            <p className="text-base text-muted-foreground mb-4">Daily Averages (across {plan.meal_plan.length} days)</p>
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-base text-muted-foreground">Calories</p>
                <p className="text-2xl font-bold">{averages.calories}</p>
              </div>
              <div>
                <p className="text-base text-muted-foreground">Protein</p>
                <p className="text-2xl font-bold">{averages.protein_g}g</p>
              </div>
              <div>
                <p className="text-base text-muted-foreground">Carbs</p>
                <p className="text-2xl font-bold">{averages.carbs_g}g</p>
              </div>
              <div>
                <p className="text-base text-muted-foreground">Fat</p>
                <p className="text-2xl font-bold">{averages.fat_g}g</p>
              </div>
            </div>
          </div>
        )}

        {/* Snack Suggestions */}
        {plan.snack_suggestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Snack Suggestions</h3>
            <div className="space-y-3">
              {plan.snack_suggestions.map((snack, i) => (
                <SnackCard key={i} snack={snack} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grocery & Logistics */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Grocery &amp; Logistics</h2>

        <GroceryListCard categories={plan.grocery_list} />

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={regenerating || adaptationState === "adapting"}
            className="gap-2"
          >
            {regenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {regenerating ? "Generating..." : "Regenerate Plan"}
          </Button>

          {canRevert && (
            <Button
              variant="ghost"
              onClick={onRevert}
              disabled={adaptationState === "adapting"}
              className="gap-2 text-muted-foreground"
            >
              <Undo2 className="size-4" />
              Revert to Previous
            </Button>
          )}

          {planVersion > 1 && (
            <span className="text-sm text-muted-foreground">
              Updated plan &middot; v{planVersion}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
