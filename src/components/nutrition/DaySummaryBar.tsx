"use client";

import { Flame } from "lucide-react";
import type { MealDay } from "@/types/nutrition";

interface Props {
  day: MealDay;
}

export default function DaySummaryBar({ day }: Props) {
  // Use daily_totals from AI if available, otherwise compute from meals
  const totals = day.daily_totals ?? {
    calories: day.meals.reduce((s, m) => s + (m.calories || 0), 0),
    protein_g: day.meals.reduce((s, m) => s + (m.protein_g || 0), 0),
    carbs_g: day.meals.reduce((s, m) => s + (m.carbs_g || 0), 0),
    fat_g: day.meals.reduce((s, m) => s + (m.fat_g || 0), 0),
    fiber_g: 0,
  };

  const macros = [
    { label: "Protein", value: totals.protein_g, unit: "g" },
    { label: "Carbs", value: totals.carbs_g, unit: "g" },
    { label: "Fat", value: totals.fat_g, unit: "g" },
  ];

  if (totals.fiber_g > 0) {
    macros.push({ label: "Fiber", value: totals.fiber_g, unit: "g" });
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Flame className="size-4 text-muted-foreground" />
        <span className="text-base font-semibold">{totals.calories}</span>
        <span className="text-base text-muted-foreground">cal total</span>
      </div>
      <div className="flex items-center gap-4">
        {macros.map((macro) => (
          <div key={macro.label} className="text-center">
            <p className="text-base font-semibold">
              {macro.value}{macro.unit}
            </p>
            <p className="text-base text-muted-foreground">{macro.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
