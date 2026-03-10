"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Play,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ExerciseVideoDialog from "./ExerciseVideoDialog";
import type { DayPlan } from "@/types/plan";

interface Props {
  day: DayPlan;
  onComplete: (exercisesCompleted: string[]) => void;
  onExit: () => void;
}

interface FlatExercise {
  name: string;
  section: string;
  sectionIndex: number;
  sectionTotal: number;
  sets?: string | number;
  repsOrDuration: string;
  intensity?: string;
  equipment?: string;
  modification?: string;
  precaution?: string;
  notes?: string;
}

function flattenExercises(day: DayPlan): FlatExercise[] {
  const exercises: FlatExercise[] = [];

  if (day.warmup?.exercises) {
    const total = day.warmup.exercises.length;
    day.warmup.exercises.forEach((ex, i) => {
      exercises.push({
        name: ex.name,
        section: "Warm-up",
        sectionIndex: i + 1,
        sectionTotal: total,
        repsOrDuration: ex.duration_or_reps,
        notes: ex.notes,
      });
    });
  }

  if (day.main) {
    const total = day.main.length;
    day.main.forEach((ex, i) => {
      exercises.push({
        name: ex.name,
        section: "Main",
        sectionIndex: i + 1,
        sectionTotal: total,
        sets: ex.sets,
        repsOrDuration: ex.reps_or_duration,
        intensity: ex.intensity,
        equipment: ex.equipment,
        modification: ex.modification,
        precaution: ex.precaution,
      });
    });
  }

  if (day.cancer_specific_components) {
    const total = day.cancer_specific_components.length;
    day.cancer_specific_components.forEach((ex, i) => {
      exercises.push({
        name: ex.name,
        section: "Cancer-Specific",
        sectionIndex: i + 1,
        sectionTotal: total,
        repsOrDuration: ex.duration_or_reps,
        notes: ex.notes,
      });
    });
  }

  if (day.cooldown?.exercises) {
    const total = day.cooldown.exercises.length;
    day.cooldown.exercises.forEach((ex, i) => {
      exercises.push({
        name: ex.name,
        section: "Cool-down",
        sectionIndex: i + 1,
        sectionTotal: total,
        repsOrDuration: ex.duration_or_reps,
        notes: ex.notes,
      });
    });
  }

  return exercises;
}

export default function GuidedWorkout({ day, onComplete, onExit }: Props) {
  const exercises = flattenExercises(day);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [videoExercise, setVideoExercise] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const current = exercises[currentIndex];
  const isCurrentCompleted = completed.has(currentIndex);
  const allCompleted = completed.size === exercises.length;
  const progress = ((completed.size) / exercises.length) * 100;

  const handleMarkComplete = () => {
    const next = new Set(completed);
    next.add(currentIndex);
    setCompleted(next);

    if (next.size === exercises.length) {
      onComplete(exercises.map((e) => e.name));
    } else if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowDetails(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowDetails(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowDetails(false);
    }
  };

  if (!current) return null;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-base text-muted-foreground">
            {completed.size} of {exercises.length} exercises
          </span>
          <Button variant="ghost" size="sm" onClick={onExit} className="gap-1">
            <X className="size-4" />
            Exit
          </Button>
        </div>
        <div className="h-1 bg-surface-card rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
      </div>

      {/* Exercise Panel */}
      <div className="bg-surface-panel rounded-xl p-8 space-y-6">
        {/* Section badge */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-base px-3 py-1">
            {current.section} {current.sectionIndex} of {current.sectionTotal}
          </Badge>
          {isCurrentCompleted && (
            <span className="inline-flex items-center gap-1.5 text-brand text-base">
              <CheckCircle2 className="size-5" />
              Done
            </span>
          )}
        </div>

        {/* Exercise name */}
        <h2 className="text-2xl font-bold">{current.name}</h2>

        {/* Sets / Reps / Duration */}
        <div className="flex flex-wrap gap-6">
          {current.sets != null && (
            <div>
              <p className="text-base text-muted-foreground">Sets</p>
              <p className="text-xl font-semibold">{current.sets}</p>
            </div>
          )}
          <div>
            <p className="text-base text-muted-foreground">
              {current.sets != null ? "Reps / Duration" : "Duration"}
            </p>
            <p className="text-xl font-semibold">{current.repsOrDuration}</p>
          </div>
          {current.intensity && (
            <div>
              <p className="text-base text-muted-foreground">Intensity</p>
              <p className="text-lg font-medium">{current.intensity}</p>
            </div>
          )}
        </div>

        {/* Equipment */}
        {current.equipment && current.equipment !== "—" && (
          <div className="flex items-center gap-2">
            <span className="text-base text-muted-foreground">Equipment:</span>
            <Badge variant="outline">{current.equipment}</Badge>
          </div>
        )}

        {/* Notes */}
        {current.notes && (
          <p className="text-base text-muted-foreground">{current.notes}</p>
        )}

        {/* Modification / Precaution toggle */}
        {(current.modification || current.precaution) && (
          <div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showDetails ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
              Modifications & Notes
            </button>
            {showDetails && (
              <div className="mt-3 space-y-2 pl-6">
                {current.modification && (
                  <p className="text-base text-blue-600 dark:text-blue-400">
                    {current.modification}
                  </p>
                )}
                {current.precaution && (
                  <p className="text-base text-yellow-600 dark:text-yellow-400">
                    {current.precaution}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Video + Mark Complete */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setVideoExercise(current.name)}
          >
            <Play className="size-4" />
            Watch Demo
          </Button>
          <button
            onClick={handleMarkComplete}
            disabled={isCurrentCompleted}
            className={`flex-1 py-3 rounded-lg text-lg font-semibold transition-all duration-200 cursor-pointer ${
              isCurrentCompleted
                ? "bg-surface-card text-muted-foreground cursor-default"
                : "bg-brand text-brand-foreground hover:brightness-110"
            }`}
            style={{
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {isCurrentCompleted ? (
              <span className="inline-flex items-center justify-center gap-2">
                <CheckCircle2 className="size-5" />
                Completed
              </span>
            ) : (
              "Mark Complete"
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="text-base text-muted-foreground">
          {currentIndex + 1} / {exercises.length}
        </span>
        <Button
          variant="ghost"
          onClick={handleNext}
          disabled={currentIndex === exercises.length - 1}
          className="gap-1"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Video Dialog */}
      <ExerciseVideoDialog
        exerciseName={videoExercise}
        onClose={() => setVideoExercise(null)}
      />
    </div>
  );
}
