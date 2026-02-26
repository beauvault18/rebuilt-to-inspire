"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ALLERGIES, DIETARY_RESTRICTIONS } from "@/lib/nutrition-constants";
import type { NutritionQuestionnaireData } from "@/types/nutrition";

interface Props {
  data: NutritionQuestionnaireData;
  toggleInList: (field: keyof NutritionQuestionnaireData, value: string) => void;
}

export default function StepAllergies({ data, toggleInList }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Allergies & Restrictions</h2>
      <p className="text-base text-muted-foreground">
        We&apos;ll make sure your meal plan avoids anything you can&apos;t or don&apos;t want to eat.
      </p>

      <div className="space-y-3">
        <Label className="text-base font-medium">Food Allergies</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALLERGIES.map((allergy) => (
            <div
              key={allergy.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                data.allergies.includes(allergy.value)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80"
              }`}
              onClick={() => toggleInList("allergies", allergy.value)}
            >
              <Checkbox
                id={`allergy-${allergy.value}`}
                checked={data.allergies.includes(allergy.value)}
                onCheckedChange={() => toggleInList("allergies", allergy.value)}
              />
              <Label
                htmlFor={`allergy-${allergy.value}`}
                className="text-base cursor-pointer"
              >
                {allergy.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium">Dietary Restrictions</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DIETARY_RESTRICTIONS.map((restriction) => (
            <div
              key={restriction.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                data.dietary_restrictions.includes(restriction.value)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80"
              }`}
              onClick={() => toggleInList("dietary_restrictions", restriction.value)}
            >
              <Checkbox
                id={`restriction-${restriction.value}`}
                checked={data.dietary_restrictions.includes(restriction.value)}
                onCheckedChange={() =>
                  toggleInList("dietary_restrictions", restriction.value)
                }
              />
              <Label
                htmlFor={`restriction-${restriction.value}`}
                className="text-base cursor-pointer"
              >
                {restriction.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
