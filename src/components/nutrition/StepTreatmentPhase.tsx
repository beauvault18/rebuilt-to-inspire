"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TREATMENT_PHASES, CURRENT_MEDICATIONS } from "@/lib/nutrition-constants";
import type { NutritionQuestionnaireData } from "@/types/nutrition";

interface Props {
  data: NutritionQuestionnaireData;
  setField: (field: keyof NutritionQuestionnaireData, value: unknown) => void;
  toggleInList: (field: keyof NutritionQuestionnaireData, value: string) => void;
}

export default function StepTreatmentPhase({ data, setField, toggleInList }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Treatment Status</h2>
      <p className="text-base text-muted-foreground">
        Your treatment phase significantly affects your nutritional needs. This helps
        us tailor recommendations to where you are right now.
      </p>

      <div className="space-y-3">
        <Label className="text-base">Where are you in your treatment journey?</Label>
        <RadioGroup
          value={data.treatment_phase}
          onValueChange={(v) => setField("treatment_phase", v)}
          className="space-y-2"
        >
          {TREATMENT_PHASES.map((phase) => (
            <div
              key={phase.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                data.treatment_phase === phase.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80"
              }`}
              onClick={() => setField("treatment_phase", phase.value)}
            >
              <RadioGroupItem value={phase.value} id={`phase-${phase.value}`} />
              <Label htmlFor={`phase-${phase.value}`} className="cursor-pointer">
                {phase.label}{" "}
                <span className="text-xs text-muted-foreground">
                  — {phase.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-base">
          Current medications (select all that apply)
        </Label>
        <p className="text-xs text-muted-foreground">
          Some medications interact with certain foods. We&apos;ll account for timing and
          interactions in your meal plan.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CURRENT_MEDICATIONS.map((med) => (
            <div
              key={med.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                data.current_medications.includes(med.value)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80"
              }`}
              onClick={() => toggleInList("current_medications", med.value)}
            >
              <Checkbox
                id={`med-${med.value}`}
                checked={data.current_medications.includes(med.value)}
                onCheckedChange={() => toggleInList("current_medications", med.value)}
              />
              <Label
                htmlFor={`med-${med.value}`}
                className="text-sm cursor-pointer"
              >
                {med.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
