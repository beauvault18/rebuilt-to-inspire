"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Pill,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2,
  BookOpen,
  Heart,
} from "lucide-react";
import MealCard from "./MealCard";
import DaySummaryBar from "./DaySummaryBar";
import GroceryListCard from "./GroceryListCard";
import SnackCard from "./SnackCard";
import { generateNutritionPlan } from "@/lib/api";
import type { NutritionPlanResponse } from "@/types/nutrition";

interface Props {
  plan: NutritionPlanResponse;
  onPlanUpdate?: (plan: NutritionPlanResponse) => void;
}

export default function NutritionPlanDisplay({ plan, onPlanUpdate }: Props) {
  const router = useRouter();
  const [dayIndex, setDayIndex] = useState(0);
  const [regenerating, setRegenerating] = useState(false);

  const currentDay = plan.meal_plan[dayIndex];
  const totalDays = plan.meal_plan.length;

  const handleRegenerate = async () => {
    const storedPayload = sessionStorage.getItem("rti_nutrition_questionnaire");
    if (!storedPayload) {
      router.push("/nutrition");
      return;
    }
    setRegenerating(true);
    try {
      const payload = JSON.parse(storedPayload);
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

  const sideEffectTips = plan.side_effect_tips || {};
  const hasSideEffectTips = Object.keys(sideEffectTips).length > 0;

  return (
    <div className="min-h-screen px-4 py-8 2xl:px-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Your Nutrition Plan</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="gap-2"
          >
            {regenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {regenerating ? "Generating..." : "Regenerate"}
          </Button>
        </div>

        {/* 3-Column Grid: Guidance | Meals | Grocery & Snacks */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] xl:grid-cols-[minmax(340px,1.5fr)_2fr_minmax(280px,1fr)] gap-5">
          {/* ============ LEFT COLUMN — Guidance & Info ============ */}
          <div className="space-y-4 order-2 lg:order-1">
            {/* Cancer-Specific Notes */}
            {plan.cancer_specific_notes.length > 0 && (
              <Card className="border-orange-500/30">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-orange-400">
                    <BookOpen className="size-4" />
                    Cancer-Specific Notes
                  </h3>
                  <ul className="space-y-2">
                    {plan.cancer_specific_notes.map((note, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-orange-400 mt-0.5 shrink-0">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Medication Timing */}
            {plan.medication_timing && plan.medication_timing.length > 0 && (
              <Card className="border-violet-500/30">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-violet-400">
                    <Clock className="size-4" />
                    Medication & Meal Timing
                  </h3>
                  <ul className="space-y-2">
                    {plan.medication_timing.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-violet-400 mt-0.5 shrink-0">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Side Effect Management Tips */}
            {hasSideEffectTips && (
              <Card className="border-cyan-500/30">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-cyan-400">
                    <Heart className="size-4" />
                    Side Effect Tips
                  </h3>
                  {Object.entries(sideEffectTips).map(([issue, tips]) => (
                    <div key={issue} className="space-y-1.5">
                      <h4 className="text-sm font-medium capitalize text-cyan-300/80">
                        {issue.replace(/_/g, " ")}
                      </h4>
                      <ul className="space-y-1.5">
                        {tips.map((tip, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-cyan-400 mt-0.5 shrink-0">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Hydration Tips */}
            {plan.hydration_tips.length > 0 && (
              <Card className="border-blue-500/30">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-blue-400">
                    <Droplets className="size-4" />
                    Hydration
                  </h3>
                  <ul className="space-y-2">
                    {plan.hydration_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Supplement Guidance */}
            {plan.supplement_guidance.length > 0 && (
              <Card className="border-green-500/30">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-green-400">
                    <Pill className="size-4" />
                    Supplements
                  </h3>
                  <ul className="space-y-2">
                    {plan.supplement_guidance.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-green-400 mt-0.5 shrink-0">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Disclaimers */}
            {plan.disclaimers.length > 0 && (
              <Card className="border-yellow-500/30">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="size-4" />
                    Disclaimers
                  </h3>
                  <ul className="space-y-2">
                    {plan.disclaimers.map((disclaimer, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-yellow-400 mt-0.5 shrink-0">•</span>
                        {disclaimer}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ============ CENTER COLUMN — Meals ============ */}
          <div className="space-y-5 order-1 lg:order-2">
            {/* Day Navigator */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDayIndex((i) => Math.max(0, i - 1))}
                disabled={dayIndex === 0}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <h2 className="text-xl font-semibold">{currentDay?.day}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDayIndex((i) => Math.min(totalDays - 1, i + 1))}
                disabled={dayIndex === totalDays - 1}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Day selector pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {plan.meal_plan.map((day, i) => (
                <Badge
                  key={day.day}
                  variant={i === dayIndex ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setDayIndex(i)}
                >
                  {day.day}
                </Badge>
              ))}
            </div>

            {/* Daily Calorie & Macro Summary */}
            {currentDay && <DaySummaryBar day={currentDay} />}

            {/* Meals for the day */}
            {currentDay && (
              <div className="space-y-4">
                {currentDay.meals.map((meal, i) => (
                  <MealCard key={`${meal.type}-${i}`} meal={meal} />
                ))}
              </div>
            )}

            {/* Snack Suggestions — below daily meals */}
            {plan.snack_suggestions.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold">Snack Suggestions</h3>
                  <div className="space-y-2">
                    {plan.snack_suggestions.map((snack, i) => (
                      <SnackCard key={i} snack={snack} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ============ RIGHT COLUMN — Grocery List ============ */}
          <div className="space-y-4 order-3">
            <GroceryListCard categories={plan.grocery_list} />
          </div>
        </div>
      </div>
    </div>
  );
}
