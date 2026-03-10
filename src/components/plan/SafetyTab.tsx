"use client";

import type { PlanResponse, DayPlan } from "@/types/plan";

interface Props {
  response: PlanResponse;
  activeDay?: DayPlan;
}

/** Collect unique precautions & modifications from a day's exercises. */
function getDaySafetyNotes(day: DayPlan) {
  const precautions = new Set<string>();
  const modifications = new Set<string>();
  day.main?.forEach((ex) => {
    if (ex.precaution) precautions.add(ex.precaution);
    if (ex.modification) modifications.add(ex.modification);
  });
  return {
    precautions: Array.from(precautions),
    modifications: Array.from(modifications),
  };
}

export default function SafetyTab({ response, activeDay }: Props) {
  const { plan, safety_flags, referral_triggers } = response;

  // Merge plan + top-level flags
  const safetyFlags = [
    ...new Set([...(plan.safety_flags || []), ...safety_flags]),
  ];
  const referralTriggers = [
    ...new Set([...(plan.referral_triggers || []), ...referral_triggers]),
  ];

  const daySafety = activeDay ? getDaySafetyNotes(activeDay) : null;
  const hasDaySafety =
    daySafety &&
    (daySafety.precautions.length > 0 || daySafety.modifications.length > 0);

  const hasCancerNotes =
    plan.cancer_specific_notes && plan.cancer_specific_notes.length > 0;
  const hasStopRules = plan.stop_rules && plan.stop_rules.length > 0;
  const hasCitations = plan.citations && plan.citations.length > 0;
  const hasDisclaimers = plan.disclaimers && plan.disclaimers.length > 0;

  const hasContent =
    hasCancerNotes ||
    hasStopRules ||
    referralTriggers.length > 0 ||
    safetyFlags.length > 0 ||
    hasDaySafety ||
    hasCitations ||
    hasDisclaimers;

  if (!hasContent) {
    return (
      <div className="py-16 text-center">
        <p className="text-base text-muted-foreground">
          No safety information available for this plan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cancer-Specific Notes */}
      {hasCancerNotes && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Cancer-Specific Notes</h3>
          <ul className="list-disc list-inside text-base space-y-1">
            {plan.cancer_specific_notes!.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* When to Stop Exercising */}
      {hasStopRules && (
        <div className="bg-surface-card rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-semibold">When to Stop Exercising</h3>
          <ul className="list-disc list-inside text-base space-y-1">
            {plan.stop_rules!.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Referral Recommendations */}
      {referralTriggers.length > 0 && (
        <div className="bg-surface-card rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-semibold">Referral Recommended</h3>
          <p className="text-base text-muted-foreground">
            Consider consulting your care team about the following:
          </p>
          <ul className="list-disc list-inside text-base space-y-1">
            {referralTriggers.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety Considerations */}
      {safetyFlags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Safety Considerations</h3>
          <ul className="list-disc list-inside text-base space-y-1">
            {safetyFlags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Day-Specific Safety Notes */}
      {hasDaySafety && activeDay && (
        <div className="bg-surface-card rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-semibold">
            {activeDay.day} — Exercise Notes
          </h3>
          {daySafety!.precautions.map((p, i) => (
            <p key={`p-${i}`} className="text-base text-yellow-600 dark:text-yellow-400">
              {p}
            </p>
          ))}
          {daySafety!.modifications.map((m, i) => (
            <p key={`m-${i}`} className="text-base text-blue-600 dark:text-blue-400">
              {m}
            </p>
          ))}
        </div>
      )}

      {/* Evidence Citations */}
      {hasCitations && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Evidence Citations</h3>
          <div className="space-y-2 text-base">
            {plan.citations!.map((c, i) => (
              <div
                key={i}
                className="border-b border-surface-border/20 pb-2 last:border-0"
              >
                <span className="font-mono text-sm text-muted-foreground">
                  [{c.snippet_id}]
                </span>{" "}
                {c.rationale}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimers */}
      {hasDisclaimers && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-muted-foreground">
            Important Disclaimers
          </h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {plan.disclaimers!.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
