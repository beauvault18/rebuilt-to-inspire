"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Undo2 } from "lucide-react";
import type { PlanResponse } from "@/types/plan";
import type { WorkoutLogEntry } from "@/types/workout";
import type {
  AdaptationState,
  FitnessAdaptationSignal,
  FitnessPendingAdaptation,
} from "@/types/fitness-adaptation";

interface Props {
  response: PlanResponse;
  workoutLog: WorkoutLogEntry[];
  adaptationState: AdaptationState;
  pendingAdaptation: FitnessPendingAdaptation | null;
  adaptationError: string | null;
  planVersion: number;
  canRevert: boolean;
  onAcceptAdaptation: () => void;
  onDeclineAdaptation: () => void;
  onRevert: () => void;
}

function describeSignal(signal: FitnessAdaptationSignal): string {
  switch (signal.metric) {
    case "pain":
      return `Elevated pain has been noted across ${signal.consecutiveCount} session${signal.consecutiveCount !== 1 ? "s" : ""}`;
    case "fatigue":
      return `Your fatigue levels have been high for ${signal.consecutiveCount} session${signal.consecutiveCount !== 1 ? "s" : ""}`;
    case "energy":
      return `Your energy has been consistently low for ${signal.consecutiveCount} session${signal.consecutiveCount !== 1 ? "s" : ""}`;
    default:
      return "";
  }
}

export default function ProgramTab({
  response,
  workoutLog,
  adaptationState,
  pendingAdaptation,
  adaptationError,
  planVersion,
  canRevert,
  onAcceptAdaptation,
  onDeclineAdaptation,
  onRevert,
}: Props) {
  const {
    plan,
    fitt_baseline,
    progression_stage,
    progression_context,
    knowledge_objects_used,
    knowledge_version,
    knowledge_last_updated,
    validation_warnings,
    primary_track,
    secondary_emphasis,
    identity_level,
    adaptation_decision,
    age_adaptive_notes,
  } = response;

  const ctx = progression_context;

  const [showTransient, setShowTransient] = useState(true);

  // Auto-clear success/error after 8 seconds
  useEffect(() => {
    if (adaptationState === "success" || adaptationState === "error") {
      setShowTransient(true);
      const timer = setTimeout(() => setShowTransient(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [adaptationState]);

  // Soft advisory: most recent check-in has concerning signals
  const lastWithCheckIn = [...workoutLog]
    .filter((e) => e.checkIn)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const showAdvisory = lastWithCheckIn?.checkIn && (
    lastWithCheckIn.checkIn.pain >= 4 ||
    lastWithCheckIn.checkIn.fatigue >= 4 ||
    lastWithCheckIn.checkIn.energy <= 2
  );

  const hasOverview =
    plan.summary ||
    primary_track ||
    identity_level ||
    (age_adaptive_notes && age_adaptive_notes.length > 0) ||
    (validation_warnings && validation_warnings.length > 0);

  const hasFramework =
    fitt_baseline ||
    (plan.progression_rules && plan.progression_rules.length > 0);

  return (
    <div className="space-y-12">
      {/* Stage Card — Tier 1 anchor */}
      {ctx && (
        <div className="bg-surface-panel rounded-xl p-8 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xl font-semibold">
              Stage {ctx.number}: {ctx.name}
            </p>
            <Badge className="bg-brand-muted text-brand border-0 rounded-full text-xs tracking-[0.08em] px-3 py-1">
              {progression_stage?.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-base text-muted-foreground">{ctx.goal}</p>
          <div>
            <p className="text-base font-semibold text-muted-foreground mb-1">
              Focus Areas
            </p>
            <ul className="list-disc list-inside text-base space-y-0.5">
              {ctx.focus?.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="flex gap-6 text-base text-muted-foreground">
            <span>Intensity: {ctx.intensity_range}</span>
            <span>Duration: {ctx.typical_duration_weeks} weeks</span>
          </div>
          {ctx.advancement_criteria &&
            ctx.advancement_criteria.length > 0 && (
              <div>
                <p className="text-base font-semibold text-muted-foreground mb-1">
                  Advancement Criteria
                </p>
                <ul className="list-disc list-inside text-base space-y-0.5">
                  {ctx.advancement_criteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Adaptation surfaces — between Stage Card and Program Overview */}
      <div className="space-y-6">
        {/* Tier 2 Proposal */}
        {adaptationState === "awaiting_confirmation" && pendingAdaptation && (
          <div className="border-l-2 border-surface-border/40 pl-4 space-y-3">
            <p className="text-base font-medium">
              Based on your recent check-ins, your plan could be adjusted
            </p>
            <div className="space-y-1">
              {pendingAdaptation.signals.map((signal, i) => (
                <p key={i} className="text-base text-muted-foreground">
                  {describeSignal(signal)}
                </p>
              ))}
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                onClick={onAcceptAdaptation}
                className="bg-brand text-brand-foreground hover:brightness-110"
              >
                Adapt Plan
              </Button>
              <Button variant="ghost" onClick={onDeclineAdaptation}>
                Not Now
              </Button>
            </div>
          </div>
        )}

        {/* Adapting indicator */}
        {adaptationState === "adapting" && (
          <div className="border-l-2 border-surface-border/40 pl-4 flex items-center gap-3">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <p className="text-base text-muted-foreground">Adjusting your plan...</p>
          </div>
        )}

        {/* Success attribution */}
        {adaptationState === "success" && showTransient && (
          <div className="border-l-2 border-surface-border/40 pl-4">
            <p className="text-base text-muted-foreground">
              Your plan has been gently adjusted based on your recent check-ins
            </p>
          </div>
        )}

        {/* Error message */}
        {adaptationState === "error" && showTransient && adaptationError && (
          <div className="border-l-2 border-surface-border/40 pl-4">
            <p className="text-base text-muted-foreground">{adaptationError}</p>
          </div>
        )}

        {/* Soft advisory — only when recent check-in flags concern */}
        {showAdvisory && adaptationState !== "awaiting_confirmation" && adaptationState !== "adapting" && lastWithCheckIn?.checkIn && (
          <div className="border-l-2 border-surface-border/40 pl-4 space-y-2">
            <p className="text-sm text-muted-foreground">Based on your recent check-in:</p>
            <p className="text-base font-medium">Your body may need extra support this week</p>
            <p className="text-base text-muted-foreground">
              {lastWithCheckIn.checkIn.pain >= 4 && "Elevated pain was noted — consider lighter intensity or modified movements. "}
              {lastWithCheckIn.checkIn.fatigue >= 4 && "Fatigue has been high — extra recovery time between sessions may help. "}
              {lastWithCheckIn.checkIn.energy <= 2 && "Your energy has been low — shorter sessions with adequate rest can support recovery."}
            </p>
          </div>
        )}
      </div>

      {/* Program Overview — transparent group */}
      {hasOverview && (
        <div>
          <h3 className="text-lg font-semibold">Program Overview</h3>
          <div className="mt-5 divide-y divide-surface-border/20">
            {plan.summary && (
              <div className="py-5 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    Summary
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {knowledge_objects_used} knowledge sources
                    </Badge>
                    {knowledge_version && knowledge_version !== "none" && (
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs"
                      >
                        v{knowledge_version}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-base">{plan.summary}</p>
                {knowledge_last_updated &&
                  knowledge_last_updated !== "unknown" && (
                    <p className="text-sm text-muted-foreground">
                      Knowledge base updated:{" "}
                      {new Date(knowledge_last_updated).toLocaleDateString()}
                    </p>
                  )}
              </div>
            )}

            {primary_track && (
              <div className="py-5 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    Training Track
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {adaptation_decision?.replace(/_/g, " ") || "maintain"}
                  </Badge>
                </div>
                <p className="text-base">
                  <span className="font-semibold">Primary: </span>
                  {primary_track.replace(/_/g, " ")}
                </p>
                {secondary_emphasis && secondary_emphasis !== "none" && (
                  <p className="text-base">
                    <span className="font-semibold">Secondary: </span>
                    {secondary_emphasis.replace(/_/g, " ")}
                  </p>
                )}
              </div>
            )}

            {identity_level && (
              <div className="py-5 first:pt-0 last:pb-0">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  Coaching Identity
                </p>
                <p className="text-base capitalize mt-1">
                  {identity_level.replace(/_/g, " ")}
                </p>
              </div>
            )}

            {age_adaptive_notes && age_adaptive_notes.length > 0 && (
              <div className="py-5 first:pt-0 last:pb-0 space-y-2">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  Age-Adaptive Considerations
                </p>
                <ul className="list-disc list-inside text-base space-y-1 text-muted-foreground">
                  {age_adaptive_notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation_warnings && validation_warnings.length > 0 && (
              <div className="py-5 first:pt-0 last:pb-0 space-y-2">
                <p className="text-sm uppercase tracking-wide text-yellow-600 dark:text-yellow-400">
                  Validation Notes
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {validation_warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Training Framework — filled card */}
      {hasFramework && (
        <div className="bg-surface-card rounded-lg p-6">
          <h3 className="text-lg font-semibold">Training Framework</h3>
          <div className="mt-5 divide-y divide-surface-border/30">
            {fitt_baseline && (
              <div className="py-5 first:pt-0 last:pb-0 space-y-4">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  FITT Baseline
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
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
              </div>
            )}

            {plan.progression_rules && plan.progression_rules.length > 0 && (
              <div className="py-5 first:pt-0 last:pb-0 space-y-3">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  Progression Rules
                </p>
                <ol className="list-decimal list-inside text-base space-y-1">
                  {plan.progression_rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plan Actions */}
      <div className="flex items-center gap-4">
        {canRevert && (
          <Button
            variant="ghost"
            onClick={onRevert}
            disabled={adaptationState === "adapting"}
            className="gap-2 text-muted-foreground"
          >
            <Undo2 className="size-4" />
            Revert to Previous
          </Button>
        )}

        {planVersion > 1 && (
          <span className="text-sm text-muted-foreground">
            Updated plan &middot; v{planVersion}
          </span>
        )}
      </div>
    </div>
  );
}
