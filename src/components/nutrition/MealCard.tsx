"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, Flame, Info, Dumbbell } from "lucide-react";
import type { Meal } from "@/types/nutrition";

interface Props {
  meal: Meal;
}

const TYPE_COLORS: Record<string, string> = {
  breakfast: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  lunch: "bg-green-500/10 text-green-400 border-green-500/30",
  dinner: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  snack: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

export default function MealCard({ meal }: Props) {
  return (
    <div className="p-4 rounded-lg border border-border/50 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-base">{meal.name}</h4>
        <Badge
          variant="outline"
          className={`text-xs capitalize ${TYPE_COLORS[meal.type] || ""}`}
        >
          {meal.type}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{meal.description}</p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {meal.prep_time_min} min
        </span>
        <span className="flex items-center gap-1">
          <Flame className="size-3.5" />
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

      {meal.key_nutrients.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {meal.key_nutrients.map((nutrient) => (
            <Badge key={nutrient} variant="secondary" className="text-xs">
              {nutrient}
            </Badge>
          ))}
        </div>
      )}

      {meal.cancer_benefit && (
        <p className="text-xs text-orange-400/80 italic">
          {meal.cancer_benefit}
        </p>
      )}

      {meal.workout_note && (
        <div className="flex gap-2 p-2.5 rounded-md bg-emerald-500/5 border border-emerald-500/20">
          <Dumbbell className="size-3.5 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-300/80">{meal.workout_note}</p>
        </div>
      )}

      {meal.side_effect_tip && (
        <div className="flex gap-2 p-2.5 rounded-md bg-cyan-500/5 border border-cyan-500/20">
          <Info className="size-3.5 text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-xs text-cyan-300/80">{meal.side_effect_tip}</p>
        </div>
      )}
    </div>
  );
}
