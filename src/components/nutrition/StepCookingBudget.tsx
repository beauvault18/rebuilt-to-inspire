"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  COOKING_SKILLS,
  BUDGET_PREFERENCES,
  MEAL_PREP_TIMES,
} from "@/lib/nutrition-constants";
import type { NutritionQuestionnaireData } from "@/types/nutrition";

interface Props {
  data: NutritionQuestionnaireData;
  setField: (field: keyof NutritionQuestionnaireData, value: unknown) => void;
}

export default function StepCookingBudget({ data, setField }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Cooking & Budget</h2>
      <p className="text-base text-muted-foreground">
        This helps us match recipes to your skill level and budget.
      </p>

      <div className="space-y-3">
        <Label className="text-base">Cooking Skill Level</Label>
        <RadioGroup
          value={data.cooking_skill}
          onValueChange={(v) => setField("cooking_skill", v)}
          className="space-y-2"
        >
          {COOKING_SKILLS.map((skill) => (
            <div
              key={skill.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                data.cooking_skill === skill.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80"
              }`}
              onClick={() => setField("cooking_skill", skill.value)}
            >
              <RadioGroupItem value={skill.value} id={`skill-${skill.value}`} />
              <Label htmlFor={`skill-${skill.value}`} className="cursor-pointer">
                {skill.label}{" "}
                <span className="text-xs text-muted-foreground">
                  — {skill.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-base">Budget Preference</Label>
        <RadioGroup
          value={data.budget_preference}
          onValueChange={(v) => setField("budget_preference", v)}
          className="space-y-2"
        >
          {BUDGET_PREFERENCES.map((budget) => (
            <div
              key={budget.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                data.budget_preference === budget.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80"
              }`}
              onClick={() => setField("budget_preference", budget.value)}
            >
              <RadioGroupItem value={budget.value} id={`budget-${budget.value}`} />
              <Label htmlFor={`budget-${budget.value}`} className="cursor-pointer">
                {budget.label}{" "}
                <span className="text-xs text-muted-foreground">
                  — {budget.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-base">How much time can you spend on meal prep?</Label>
        <RadioGroup
          value={data.meal_prep_time}
          onValueChange={(v) => setField("meal_prep_time", v)}
          className="space-y-2"
        >
          {MEAL_PREP_TIMES.map((time) => (
            <div
              key={time.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                data.meal_prep_time === time.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80"
              }`}
              onClick={() => setField("meal_prep_time", time.value)}
            >
              <RadioGroupItem value={time.value} id={`time-${time.value}`} />
              <Label htmlFor={`time-${time.value}`} className="cursor-pointer text-base">
                {time.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
