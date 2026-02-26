"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import DayNavigator from "./DayNavigator";
import WorkoutTable from "./WorkoutTable";
import DaySummaryPanel from "./DaySummaryPanel";
import type { PlanResponse, DayPlan } from "@/types/plan";

interface Props {
  response: PlanResponse;
  userName?: string;
}

/** Collect unique precautions & modifications from a day's exercises. */
function getDaySafetyNotes(day: DayPlan) {
  const precautions = new Set<string>();
  const modifications = new Set<string>();
  day.main?.forEach((ex) => {
    if (ex.precaution) precautions.add(ex.precaution);
    if (ex.modification) modifications.add(ex.modification);
  });
  return { precautions: Array.from(precautions), modifications: Array.from(modifications) };
}

export default function PlanDisplay({ response, userName }: Props) {
  const router = useRouter();
  const { plan, safety_flags, referral_triggers, evidence_count, fitt_baseline } =
    response;

  const days = plan.weekly_plan || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDay = days[activeIndex];

  const safetyNotes = activeDay ? getDaySafetyNotes(activeDay) : null;
  const hasSafetyNotes =
    safetyNotes &&
    (safetyNotes.precautions.length > 0 || safetyNotes.modifications.length > 0);

  // Merge referral triggers from plan + top-level
  const referralTriggers = [
    ...new Set([...(plan.referral_triggers || []), ...referral_triggers]),
  ];

  // Merge safety flags from plan + top-level
  const safetyFlags = [
    ...new Set([...(plan.safety_flags || []), ...safety_flags]),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2 -ml-2 mb-2"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Button>
          <h1 className="text-3xl font-bold">
            {userName ? `${userName}'s Exercise Plan` : "Your Exercise Plan"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized, evidence-based program
          </p>
        </div>
      </div>

      {/* Day Navigation */}
      {days.length > 0 && (
        <DayNavigator
          days={days}
          activeIndex={activeIndex}
          onSelectDay={setActiveIndex}
        />
      )}

      {/* Two-column split */}
      <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-6">
        {/* LEFT — Workout Table + Safety Notes + Referral */}
        <div className="min-w-0 space-y-4">
          {activeDay ? (
            <WorkoutTable day={activeDay} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No workout data available.</p>
              </CardContent>
            </Card>
          )}

          {/* Safety Notes (from this day's exercises) */}
          {hasSafetyNotes && (
            <Card className="border-yellow-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Safety Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {safetyNotes.precautions.map((p, i) => (
                  <p key={i} className="text-sm text-yellow-400">
                    {p}
                  </p>
                ))}
                {safetyNotes.modifications.map((m, i) => (
                  <p key={i} className="text-sm text-blue-400">
                    {m}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Referral Recommendations */}
          {referralTriggers.length > 0 && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-destructive mb-2">
                  Referral Recommended
                </h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {referralTriggers.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Stop Rules */}
          {plan.stop_rules && plan.stop_rules.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-destructive">
                  When to Stop Exercising
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {plan.stop_rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Safety Considerations */}
          {safetyFlags.length > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-500/10">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                  Safety Considerations
                </h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {safetyFlags.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Important Disclaimers */}
          {plan.disclaimers && plan.disclaimers.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <p className="font-semibold text-sm mb-2">Important Disclaimers</p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  {plan.disclaimers.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT — Everything else */}
        <div className="min-w-0 space-y-4">
          {/* Plan Summary */}
          {plan.summary && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Plan Summary</CardTitle>
                  <Badge variant="outline">
                    {evidence_count} evidence sources
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{plan.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Day focus & summary */}
          {activeDay && (
            <DaySummaryPanel
              day={activeDay}
              cancerTypeFocus={plan.cancer_type_focus}
            />
          )}

          {/* FITT Baseline */}
          {fitt_baseline && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">FITT Baseline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  {fitt_baseline.aerobic && (
                    <div className="space-y-1">
                      <h4 className="font-semibold">Aerobic</h4>
                      <p>Frequency: {fitt_baseline.aerobic.frequency}</p>
                      <p>Intensity: {fitt_baseline.aerobic.intensity}</p>
                      <p>Duration: {fitt_baseline.aerobic.duration}</p>
                      <p>
                        Type:{" "}
                        {Array.isArray(fitt_baseline.aerobic.type)
                          ? fitt_baseline.aerobic.type.join(", ")
                          : fitt_baseline.aerobic.type}
                      </p>
                    </div>
                  )}
                  {fitt_baseline.resistance && (
                    <div className="space-y-1">
                      <h4 className="font-semibold">Resistance</h4>
                      <p>Frequency: {fitt_baseline.resistance.frequency}</p>
                      <p>Intensity: {fitt_baseline.resistance.intensity}</p>
                      <p>Sets: {fitt_baseline.resistance.sets}</p>
                      <p>Reps: {fitt_baseline.resistance.reps}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progression Rules */}
          {plan.progression_rules && plan.progression_rules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progression Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  {plan.progression_rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Cancer-specific notes */}
          {plan.cancer_specific_notes && plan.cancer_specific_notes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cancer-Specific Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {plan.cancer_specific_notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Citations */}
          {plan.citations && plan.citations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evidence Citations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {plan.citations.map((c, i) => (
                    <div key={i} className="border-b pb-2 last:border-0">
                      <span className="font-mono text-xs text-muted-foreground">
                        [{c.snippet_id}]
                      </span>{" "}
                      {c.rationale}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
