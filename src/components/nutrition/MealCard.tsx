"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, Flame, Dumbbell, Info } from "lucide-react";
import type { Meal } from "@/types/nutrition";

interface Props {
  meal: Meal;
  compact?: boolean;
}

export default function MealCard({ meal, compact = false }: Props) {
  return (
    <div className="p-5 rounded-lg border border-surface-border/20 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-base">{meal.name}</h4>
        <Badge variant="outline" className="text-base capitalize">
          {meal.type}
        </Badge>
      </div>

      <p className="text-base text-muted-foreground">{meal.description}</p>

      <div className="flex items-center gap-4 text-base text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <Clock className="size-4" />
          {meal.prep_time_min} min
        </span>
        <span className="flex items-center gap-1">
          <Flame className="size-4" />
          {meal.calories} cal
        </span>
        {meal.protein_g != null && (
          <span>P: {meal.protein_g}g</span>
        )}
        {meal.carbs_g != null && (
          <span>C: {meal.carbs_g}g</span>
        )}
        {meal.fat_g != null && (
          <span>F: {meal.fat_g}g</span>
        )}
      </div>

      {!compact && meal.key_nutrients.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {meal.key_nutrients.map((nutrient) => (
            <Badge key={nutrient} variant="secondary" className="text-base">
              {nutrient}
            </Badge>
          ))}
        </div>
      )}

      {!compact && meal.cancer_benefit && (
        <p className="text-base text-muted-foreground italic">
          {meal.cancer_benefit}
        </p>
      )}

      {meal.workout_note && (
        <p className="text-base text-muted-foreground">
          <span className="font-medium">
            <Dumbbell className="size-4 inline mr-1.5 -mt-0.5" />
            Workout note:
          </span>{" "}
          {meal.workout_note}
        </p>
      )}

      {!compact && meal.side_effect_tip && (
        <p className="text-base text-muted-foreground">
          <span className="font-medium">
            <Info className="size-4 inline mr-1.5 -mt-0.5" />
            Side effect tip:
          </span>{" "}
          {meal.side_effect_tip}
        </p>
      )}
    </div>
  );
}
