"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CURRENT_DIETS,
  APPETITE_LEVELS,
  DIGESTIVE_ISSUES,
} from "@/lib/nutrition-constants";
import type { NutritionQuestionnaireData } from "@/types/nutrition";

interface Props {
  data: NutritionQuestionnaireData;
  setField: (field: keyof NutritionQuestionnaireData, value: unknown) => void;
  toggleInList: (field: keyof NutritionQuestionnaireData, value: string) => void;
}

export default function StepEatingHabits({ data, setField, toggleInList }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Your Eating Habits</h2>
      <p className="text-base text-muted-foreground">
        Tell us about your current eating patterns so we can build the right plan for you.
      </p>

      <div className="space-y-3">
        <Label className="text-base">How would you describe your current diet?</Label>
        <RadioGroup
          value={data.current_diet}
          onValueChange={(v) => setField("current_diet", v)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {CURRENT_DIETS.map((diet) => (
            <div
              key={diet.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                data.current_diet === diet.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80"
              }`}
              onClick={() => setField("current_diet", diet.value)}
            >
              <RadioGroupItem value={diet.value} id={`diet-${diet.value}`} />
              <Label htmlFor={`diet-${diet.value}`} className="cursor-pointer text-base">
                {diet.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-base">How many meals do you eat per day?</Label>
        <RadioGroup
          value={String(data.meals_per_day)}
          onValueChange={(v) => setField("meals_per_day", parseInt(v))}
          className="flex flex-wrap gap-3"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="flex items-center gap-1.5">
              <RadioGroupItem value={String(n)} id={`meals-${n}`} />
              <Label htmlFor={`meals-${n}`} className="text-base cursor-pointer">
                {n}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-base">How is your appetite right now?</Label>
        <RadioGroup
          value={data.appetite_level}
          onValueChange={(v) => setField("appetite_level", v)}
          className="space-y-2"
        >
          {APPETITE_LEVELS.map((level) => (
            <div key={level.value} className="flex items-center gap-2">
              <RadioGroupItem value={level.value} id={`appetite-${level.value}`} />
              <Label htmlFor={`appetite-${level.value}`} className="cursor-pointer">
                {level.label}{" "}
                <span className="text-xs text-muted-foreground">
                  — {level.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-base">
          Any digestive issues? (select all that apply)
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DIGESTIVE_ISSUES.map((issue) => (
            <div key={issue.value} className="flex items-center gap-2">
              <Checkbox
                id={`digest-${issue.value}`}
                checked={data.digestive_issues.includes(issue.value)}
                onCheckedChange={() => toggleInList("digestive_issues", issue.value)}
              />
              <Label
                htmlFor={`digest-${issue.value}`}
                className="text-base cursor-pointer"
              >
                {issue.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
