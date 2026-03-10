"use client";

import { AlertTriangle } from "lucide-react";
import type { NutritionPlanResponse } from "@/types/nutrition";

interface Props {
  plan: NutritionPlanResponse;
}

export default function NutritionSafetyTab({ plan }: Props) {
  const sideEffectTips = plan.side_effect_tips || {};
  const hasSideEffectTips = Object.keys(sideEffectTips).length > 0;

  return (
    <div className="space-y-8">
      {/* Cancer-Specific Notes */}
      {plan.cancer_specific_notes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Cancer-Specific Notes</h2>
          <ul className="space-y-2">
            {plan.cancer_specific_notes.map((note, i) => (
              <li key={i} className="text-base text-muted-foreground flex gap-2">
                <span className="text-muted-foreground/50 mt-0.5 shrink-0">&bull;</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Medication & Meal Timing */}
      {plan.medication_timing && plan.medication_timing.length > 0 && (
        <div className="bg-surface-card rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-semibold">Medication &amp; Meal Timing</h2>
          <ul className="space-y-2">
            {plan.medication_timing.map((tip, i) => (
              <li key={i} className="text-base text-muted-foreground flex gap-2">
                <span className="text-muted-foreground/50 mt-0.5 shrink-0">&bull;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Side Effect Management */}
      {hasSideEffectTips && (
        <div className="bg-surface-card rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Side Effect Management</h2>
          {Object.entries(sideEffectTips).map(([issue, tips]) => (
            <div key={issue} className="space-y-2">
              <h3 className="text-base font-medium capitalize">
                {issue.replace(/_/g, " ")}
              </h3>
              <ul className="space-y-1.5">
                {tips.map((tip, i) => (
                  <li key={i} className="text-base text-muted-foreground flex gap-2">
                    <span className="text-muted-foreground/50 mt-0.5 shrink-0">&bull;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Hydration Tips */}
      {plan.hydration_tips.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Hydration</h2>
          <ul className="space-y-2">
            {plan.hydration_tips.map((tip, i) => (
              <li key={i} className="text-base text-muted-foreground flex gap-2">
                <span className="text-muted-foreground/50 mt-0.5 shrink-0">&bull;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Supplement Guidance */}
      {plan.supplement_guidance.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Supplement Guidance</h2>
          <ul className="space-y-2">
            {plan.supplement_guidance.map((tip, i) => (
              <li key={i} className="text-base text-muted-foreground flex gap-2">
                <span className="text-muted-foreground/50 mt-0.5 shrink-0">&bull;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimers */}
      {plan.disclaimers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Disclaimers</h2>
          </div>
          <ul className="space-y-2">
            {plan.disclaimers.map((disclaimer, i) => (
              <li key={i} className="text-base text-muted-foreground flex gap-2">
                <span className="text-muted-foreground/50 mt-0.5 shrink-0">&bull;</span>
                {disclaimer}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state fallback */}
      {plan.cancer_specific_notes.length === 0 &&
        (!plan.medication_timing || plan.medication_timing.length === 0) &&
        !hasSideEffectTips &&
        plan.hydration_tips.length === 0 &&
        plan.supplement_guidance.length === 0 &&
        plan.disclaimers.length === 0 && (
          <p className="text-base text-muted-foreground">
            No additional safety considerations are associated with this plan.
          </p>
        )}
    </div>
  );
}
