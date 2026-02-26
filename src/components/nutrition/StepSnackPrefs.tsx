"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SNACK_PREFERENCES } from "@/lib/nutrition-constants";
import type { NutritionQuestionnaireData } from "@/types/nutrition";

interface Props {
  data: NutritionQuestionnaireData;
  toggleInList: (field: keyof NutritionQuestionnaireData, value: string) => void;
}

export default function StepSnackPrefs({ data, toggleInList }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Snack Preferences</h2>
      <p className="text-base text-muted-foreground">
        Select the types of snacks you enjoy. We&apos;ll include cancer-fighting snacks
        that match your taste.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SNACK_PREFERENCES.map((snack) => (
          <div
            key={snack.value}
            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              data.snack_preferences.includes(snack.value)
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border/80"
            }`}
            onClick={() => toggleInList("snack_preferences", snack.value)}
          >
            <Checkbox
              id={`snack-${snack.value}`}
              checked={data.snack_preferences.includes(snack.value)}
              onCheckedChange={() => toggleInList("snack_preferences", snack.value)}
              className="size-5"
            />
            <Label
              htmlFor={`snack-${snack.value}`}
              className="cursor-pointer text-base font-medium"
            >
              {snack.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
