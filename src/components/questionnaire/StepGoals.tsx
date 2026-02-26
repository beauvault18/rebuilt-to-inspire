"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FITNESS_GOALS } from "@/lib/constants";
import type { QuestionnaireData } from "@/types/questionnaire";

interface Props {
  data: QuestionnaireData;
  toggleInList: (field: keyof QuestionnaireData, value: string) => void;
}

export default function StepGoals({ data, toggleInList }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">What Are You Looking For?</h2>
      <p className="text-base text-muted-foreground">
        Select all that apply to help us personalize your program.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FITNESS_GOALS.map((goal) => (
          <div
            key={goal.value}
            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              data.goals.includes(goal.value)
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border/80"
            }`}
            onClick={() => toggleInList("goals", goal.value)}
          >
            <Checkbox
              id={`goal-${goal.value}`}
              checked={data.goals.includes(goal.value)}
              onCheckedChange={() => toggleInList("goals", goal.value)}
              className="size-5"
            />
            <Label
              htmlFor={`goal-${goal.value}`}
              className="cursor-pointer text-base font-medium"
            >
              {goal.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
