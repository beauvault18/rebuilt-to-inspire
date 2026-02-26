"use client";

import SymptomSelector from "./SymptomSelector";
import type { QuestionnaireData } from "@/types/questionnaire";

interface Props {
  data: QuestionnaireData;
  setField: (field: keyof QuestionnaireData, value: unknown) => void;
}

export default function StepSymptoms({ data, setField }: Props) {
  const hasLung = data.cancer_types.includes("lung");
  const hasProstate = data.cancer_types.includes("prostate");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Current Symptoms</h2>
      <p className="text-base text-muted-foreground">
        Rate any symptoms you are currently experiencing.
      </p>

      <SymptomSelector
        label="Fatigue"
        description="General tiredness or lack of energy"
        value={data.fatigue}
        onChange={(v) => setField("fatigue", v)}
      />
      <SymptomSelector
        label="Pain"
        description="Ongoing pain related to cancer or treatment"
        value={data.pain}
        onChange={(v) => setField("pain", v)}
      />
      <SymptomSelector
        label="Neuropathy"
        description="Tingling, numbness, or reduced sensation in hands/feet"
        value={data.neuropathy}
        onChange={(v) => setField("neuropathy", v)}
      />
      <SymptomSelector
        label="Balance Issues"
        description="Difficulty with balance or coordination"
        value={data.balance_issues}
        onChange={(v) => setField("balance_issues", v)}
      />

      {hasLung && (
        <SymptomSelector
          label="Shortness of Breath (Dyspnea)"
          description="Difficulty breathing during daily activities"
          value={data.dyspnea}
          onChange={(v) => setField("dyspnea", v)}
        />
      )}

      {hasProstate && (
        <SymptomSelector
          label="Urinary Incontinence"
          description="Bladder control difficulties"
          value={data.urinary_incontinence}
          onChange={(v) => setField("urinary_incontinence", v)}
        />
      )}
    </div>
  );
}
