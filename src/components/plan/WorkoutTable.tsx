"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ExerciseVideoDialog from "./ExerciseVideoDialog";
import type { DayPlan, Exercise, MainExercise } from "@/types/plan";

interface Props {
  day: DayPlan;
}


function ExerciseButton({
  name,
  onSelect,
}: {
  name: string;
  onSelect: (name: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(name)}
      className="text-primary hover:underline inline-flex items-center gap-1.5 font-medium cursor-pointer text-left"
    >
      {name}
      <Play className="size-3.5 shrink-0" />
    </button>
  );
}

function SectionHeader({
  title,
  duration,
  colSpan,
}: {
  title: string;
  duration?: number;
  colSpan: number;
}) {
  return (
    <tr className="bg-muted/50">
      <td colSpan={colSpan} className="px-5 py-3 text-base font-bold uppercase tracking-wide">
        {title}
        {duration != null && (
          <span className="text-muted-foreground font-normal ml-2">
            ({duration} min)
          </span>
        )}
      </td>
    </tr>
  );
}

function SimpleExerciseRows({
  exercises,
  onSelectExercise,
}: {
  exercises: Exercise[];
  onSelectExercise: (name: string) => void;
}) {
  return (
    <>
      <tr className="border-b border-border">
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          EXERCISE
        </th>
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          DURATION / REPS
        </th>
        <th colSpan={3} className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          NOTES
        </th>
      </tr>
      {exercises.map((ex, i) => (
        <tr key={i} className="border-b border-border/50">
          <td className="px-5 py-3 text-base whitespace-nowrap">
            <ExerciseButton name={ex.name} onSelect={onSelectExercise} />
          </td>
          <td className="px-5 py-3 text-base text-muted-foreground whitespace-nowrap">
            {ex.duration_or_reps}
          </td>
          <td colSpan={3} className="px-5 py-3 text-base text-muted-foreground">
            {ex.notes || "—"}
          </td>
        </tr>
      ))}
    </>
  );
}

function MainExerciseRows({
  exercises,
  onSelectExercise,
}: {
  exercises: MainExercise[];
  onSelectExercise: (name: string) => void;
}) {
  return (
    <>
      <tr className="border-b border-border">
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          EXERCISE
        </th>
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          SETS
        </th>
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          REPS / DURATION
        </th>
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          INTENSITY
        </th>
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          EQUIPMENT
        </th>
      </tr>
      {exercises.map((ex, i) => (
        <React.Fragment key={i}>
          <tr className="border-b border-border/50">
            <td className="px-5 py-3 text-base">
              <ExerciseButton name={ex.name} onSelect={onSelectExercise} />
            </td>
            <td className="px-5 py-3 text-base text-muted-foreground">
              {ex.sets != null ? String(ex.sets) : "—"}
            </td>
            <td className="px-5 py-3 text-base text-muted-foreground">
              {ex.reps_or_duration}
            </td>
            <td className="px-5 py-3 text-base text-muted-foreground">
              {ex.intensity || "—"}
            </td>
            <td className="px-5 py-3 text-base text-muted-foreground">
              {ex.equipment || "—"}
            </td>
          </tr>
          {(ex.modification || ex.precaution) && (
            <tr>
              <td colSpan={5} className="px-5 pb-3 pt-0">
                {ex.modification && (
                  <p className="text-sm text-blue-400">
                    Modification: {ex.modification}
                  </p>
                )}
                {ex.precaution && (
                  <p className="text-sm text-yellow-400">
                    Precaution: {ex.precaution}
                  </p>
                )}
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

export default function WorkoutTable({ day }: Props) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const isRestDay =
    !day.warmup && (!day.main || day.main.length === 0) && !day.cooldown;

  if (isRestDay) {
    return (
      <div className="bg-surface-panel rounded-xl py-16 text-center">
        <p className="text-2xl font-bold">{day.day}</p>
        <Badge variant="secondary" className="mt-3 text-base px-3 py-1">
          {day.focus || "Rest Day"}
        </Badge>
        <p className="text-base text-muted-foreground mt-4">
          Recovery is part of the program. Light walking or gentle stretching
          is fine if desired.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface-panel rounded-xl overflow-hidden">
        {/* Day header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border/30">
          <h3 className="text-xl font-bold">{day.day}</h3>
          <Badge variant="secondary" className="text-sm px-3 py-1">{day.focus}</Badge>
        </div>

        {/* Table */}
        <div>
          <table className="w-full text-left">
            <tbody>
              {/* Warm-up */}
              {day.warmup && day.warmup.exercises.length > 0 && (
                <>
                  <SectionHeader
                    title="Warm-up"
                    duration={day.warmup.duration_min}
                    colSpan={5}
                  />
                  <SimpleExerciseRows
                    exercises={day.warmup.exercises}
                    onSelectExercise={setSelectedExercise}
                  />
                </>
              )}

              {/* Main Exercises */}
              {day.main && day.main.length > 0 && (
                <>
                  <SectionHeader title="Main Exercises" colSpan={5} />
                  <MainExerciseRows
                    exercises={day.main}
                    onSelectExercise={setSelectedExercise}
                  />
                </>
              )}

              {/* Cool-down */}
              {day.cooldown && day.cooldown.exercises.length > 0 && (
                <>
                  <SectionHeader
                    title="Cool-down"
                    duration={day.cooldown.duration_min}
                    colSpan={5}
                  />
                  <SimpleExerciseRows
                    exercises={day.cooldown.exercises}
                    onSelectExercise={setSelectedExercise}
                  />
                </>
              )}

              {/* Cancer-specific components */}
              {day.cancer_specific_components &&
                day.cancer_specific_components.length > 0 && (
                  <>
                    <SectionHeader
                      title="Cancer-Specific Exercises"
                      colSpan={5}
                    />
                    <SimpleExerciseRows
                      exercises={day.cancer_specific_components}
                      onSelectExercise={setSelectedExercise}
                    />
                  </>
                )}
            </tbody>
          </table>
        </div>
      </div>

      <ExerciseVideoDialog
        exerciseName={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </>
  );
}
