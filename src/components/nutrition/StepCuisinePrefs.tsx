"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CUISINES } from "@/lib/nutrition-constants";
import type { NutritionQuestionnaireData } from "@/types/nutrition";

interface Props {
  data: NutritionQuestionnaireData;
  toggleInList: (field: keyof NutritionQuestionnaireData, value: string) => void;
}

export default function StepCuisinePrefs({ data, toggleInList }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Cuisine Preferences</h2>
      <p className="text-base text-muted-foreground">
        Select the types of food you enjoy. We&apos;ll use this to make meals you
        actually want to eat.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CUISINES.map((cuisine) => (
          <div
            key={cuisine.value}
            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              data.favorite_cuisines.includes(cuisine.value)
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border/80"
            }`}
            onClick={() => toggleInList("favorite_cuisines", cuisine.value)}
          >
            <Checkbox
              id={`cuisine-${cuisine.value}`}
              checked={data.favorite_cuisines.includes(cuisine.value)}
              onCheckedChange={() => toggleInList("favorite_cuisines", cuisine.value)}
              className="size-5"
            />
            <Label
              htmlFor={`cuisine-${cuisine.value}`}
              className="cursor-pointer text-base font-medium"
            >
              {cuisine.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
