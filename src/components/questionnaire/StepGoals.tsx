"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PRIMARY_GOALS,
  SECONDARY_EMPHASES,
  LONG_TERM_AMBITIONS,
} from "@/lib/constants";
import type { QuestionnaireData } from "@/types/questionnaire";

interface Props {
  data: QuestionnaireData;
  setField: (field: keyof QuestionnaireData, value: unknown) => void;
}

export default function StepGoals({ data, setField }: Props) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Your Goals & Direction</h2>
      <p className="text-base text-muted-foreground">
        Help us understand what you want to achieve so we can build the right
        program for you.
      </p>

      {/* Primary Goal */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Primary Goal</Label>
        <p className="text-sm text-muted-foreground">
          What matters most to you right now?
        </p>
        <RadioGroup
          value={data.primary_goal}
          onValueChange={(v) => setField("primary_goal", v)}
          className="space-y-2"
        >
          {PRIMARY_GOALS.map((goal) => (
            <div
              key={goal.value}
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                data.primary_goal === goal.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80"
              }`}
              onClick={() => setField("primary_goal", goal.value)}
            >
              <RadioGroupItem
                value={goal.value}
                id={`goal-${goal.value}`}
              />
              <Label
                htmlFor={`goal-${goal.value}`}
                className="cursor-pointer flex-1"
              >
                <span className="text-base font-medium">{goal.label}</span>
                <span className="block text-sm text-muted-foreground">
                  {goal.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Secondary Emphasis */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Secondary Emphasis</Label>
        <p className="text-sm text-muted-foreground">
          Optional — add a secondary focus to complement your primary goal.
        </p>
        <RadioGroup
          value={data.secondary_emphasis}
          onValueChange={(v) => setField("secondary_emphasis", v)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {SECONDARY_EMPHASES.map((emphasis) => (
            <div key={emphasis.value} className="flex items-center gap-2">
              <RadioGroupItem
                value={emphasis.value}
                id={`emphasis-${emphasis.value}`}
              />
              <Label
                htmlFor={`emphasis-${emphasis.value}`}
                className="cursor-pointer text-base"
              >
                {emphasis.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Long Term Ambition */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Long-Term Ambition</Label>
        <p className="text-sm text-muted-foreground">
          Where do you see yourself heading over the coming months?
        </p>
        <RadioGroup
          value={data.long_term_ambition}
          onValueChange={(v) => setField("long_term_ambition", v)}
          className="space-y-2"
        >
          {LONG_TERM_AMBITIONS.map((ambition) => (
            <div
              key={ambition.value}
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                data.long_term_ambition === ambition.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80"
              }`}
              onClick={() => setField("long_term_ambition", ambition.value)}
            >
              <RadioGroupItem
                value={ambition.value}
                id={`ambition-${ambition.value}`}
              />
              <Label
                htmlFor={`ambition-${ambition.value}`}
                className="cursor-pointer flex-1"
              >
                <span className="text-base font-medium">{ambition.label}</span>
                <span className="block text-sm text-muted-foreground">
                  {ambition.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
