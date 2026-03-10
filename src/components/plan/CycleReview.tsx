"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WorkoutLogEntry, PlanTracking } from "@/types/workout";
import type { ProgressionContext } from "@/types/plan";

interface Props {
  workoutLog: WorkoutLogEntry[];
  tracking: PlanTracking;
  progressionContext: ProgressionContext;
  weekNumber: number;
  onDismiss: () => void;
}

type Decision = "progress" | "repeat" | "maintain" | null;

function computeStats(log: WorkoutLogEntry[]) {
  const total = log.length;
  const withCheckIn = log.filter((e) => e.checkIn);
  if (withCheckIn.length === 0) {
    return { total, avgEnergy: 0, avgPain: 0, avgFatigue: 0 };
  }
  const avgEnergy =
    withCheckIn.reduce((s, e) => s + (e.checkIn?.energy || 0), 0) /
    withCheckIn.length;
  const avgPain =
    withCheckIn.reduce((s, e) => s + (e.checkIn?.pain || 0), 0) /
    withCheckIn.length;
  const avgFatigue =
    withCheckIn.reduce((s, e) => s + (e.checkIn?.fatigue || 0), 0) /
    withCheckIn.length;
  return { total, avgEnergy, avgPain, avgFatigue };
}

function meetsAdvancementCriteria(stats: ReturnType<typeof computeStats>): boolean {
  return stats.avgPain < 3 && stats.avgFatigue < 3.5 && stats.avgEnergy >= 3;
}

export default function CycleReview({
  workoutLog,
  tracking,
  progressionContext,
  weekNumber,
  onDismiss,
}: Props) {
  const [decision, setDecision] = useState<Decision>(null);

  const stats = computeStats(workoutLog);
  const eligible = meetsAdvancementCriteria(stats);

  const OPTIONS: { id: Decision; label: string; description: string }[] = [
    {
      id: "progress",
      label: "I\u2019m ready for the next stage",
      description: eligible
        ? "Your body has been responding well. Moving forward feels right."
        : "Your recent check-ins suggest your body is still adapting. You can still progress \u2014 just listen to how you feel.",
    },
    {
      id: "repeat",
      label: "Let me build on this a bit longer",
      description:
        "Repeating a stage isn\u2019t going backwards. It\u2019s deepening your foundation.",
    },
    {
      id: "maintain",
      label: "Stay where I am for now",
      description:
        "Consistency at this level is valuable. There\u2019s no rush to advance.",
    },
  ];

  return (
    <div className="bg-surface-panel rounded-xl p-8 space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">
          Milestone
        </Badge>
        <h2 className="text-2xl font-bold">
          {weekNumber} weeks. That&apos;s real.
        </h2>
        <p className="text-base text-muted-foreground mt-2 leading-relaxed">
          You&apos;ve completed {weekNumber} structured weeks in the{" "}
          {progressionContext.name} stage. Every session you showed up for
          — even the ones that felt hard — built something.
          Take a moment to look at how far you&apos;ve come.
        </p>
      </div>

      {/* Stats */}
      <div className="bg-surface-card rounded-lg p-6">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-base text-muted-foreground">Workouts Logged</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          {stats.avgEnergy > 0 && (
            <>
              <div>
                <p className="text-base text-muted-foreground">Avg Energy</p>
                <p className="text-2xl font-bold">
                  {stats.avgEnergy.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-base text-muted-foreground">Avg Pain</p>
                <p className="text-2xl font-bold">
                  {stats.avgPain.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-base text-muted-foreground">Avg Fatigue</p>
                <p className="text-2xl font-bold">
                  {stats.avgFatigue.toFixed(1)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <p className="text-base font-medium">What feels right for you?</p>
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setDecision(opt.id)}
            className={`w-full text-left rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
              decision === opt.id
                ? "border-brand bg-brand/5"
                : "border-surface-border/20 hover:border-surface-border/40"
            }`}
            style={{
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <p className="text-base font-medium">{opt.label}</p>
            <p className="text-base text-muted-foreground mt-1">
              {opt.description}
            </p>
          </button>
        ))}
      </div>

      {/* Confirm */}
      <div className="flex gap-3">
        <Button
          onClick={onDismiss}
          disabled={!decision}
          className="bg-brand text-brand-foreground hover:brightness-110"
        >
          Confirm
        </Button>
        <Button variant="ghost" onClick={onDismiss}>
          Decide Later
        </Button>
      </div>

      {decision === "progress" && !eligible && (
        <p className="text-base text-muted-foreground">
          Your body, your call. Just pay extra attention to how you feel
          in the first week — and know you can always step back.
        </p>
      )}
    </div>
  );
}
