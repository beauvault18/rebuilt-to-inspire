"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RotateCcw } from "lucide-react";
import {
  BREATHING_EXERCISES,
  type BreathingExercise,
  type BreathPhase,
} from "@/types/mental-health";

export default function BreathworkSection() {
  const [selected, setSelected] = useState<BreathingExercise | null>(null);

  return (
    <div className="space-y-6">
      {!selected ? (
        <ExercisePicker onSelect={setSelected} />
      ) : (
        <BreathingTimer
          exercise={selected}
          onBack={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function ExercisePicker({
  onSelect,
}: {
  onSelect: (ex: BreathingExercise) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-lg text-muted-foreground">
        Choose a breathing exercise. Each one is designed for a specific
        situation cancer survivors commonly face.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BREATHING_EXERCISES.map((ex) => (
          <Card
            key={ex.id}
            className="cursor-pointer transition-all hover:border-teal-500/50 border-2 border-border/50"
            onClick={() => onSelect(ex)}
          >
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{ex.name}</h3>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {Math.round(ex.duration_seconds / 60)} min
                </Badge>
              </div>
              <p className="text-base text-muted-foreground">{ex.description}</p>
              <p className="text-sm text-teal-400/80 italic">
                {ex.cancer_benefit}
              </p>
              <div className="flex flex-wrap gap-2">
                {ex.best_for.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-sm capitalize px-3 py-1"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BreathingTimer({
  exercise,
  onBack,
}: {
  exercise: BreathingExercise;
  onBack: () => void;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhase: BreathPhase = exercise.pattern[phaseIndex];
  const isComplete = totalElapsed >= exercise.duration_seconds;

  const tick = useCallback(() => {
    setPhaseTimer((prev) => {
      const next = prev + 1;
      if (next >= exercise.pattern[phaseIndex].seconds) {
        // Move to next phase
        setPhaseIndex((pi) => {
          const nextPi = (pi + 1) % exercise.pattern.length;
          if (nextPi === 0) {
            setCycleCount((c) => c + 1);
          }
          return nextPi;
        });
        return 0;
      }
      return next;
    });
    setTotalElapsed((prev) => {
      const next = prev + 1;
      if (next >= exercise.duration_seconds) {
        // Done
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
      }
      return next;
    });
  }, [exercise, phaseIndex]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  const handleStart = () => {
    if (isComplete) {
      // Reset
      setPhaseIndex(0);
      setPhaseTimer(0);
      setTotalElapsed(0);
      setCycleCount(0);
    }
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhaseIndex(0);
    setPhaseTimer(0);
    setTotalElapsed(0);
    setCycleCount(0);
  };

  const progress = currentPhase
    ? (phaseTimer / currentPhase.seconds) * 100
    : 0;
  const overallProgress = (totalElapsed / exercise.duration_seconds) * 100;

  const phaseLabel =
    currentPhase?.action === "inhale"
      ? "Breathe In"
      : currentPhase?.action === "hold"
        ? "Hold"
        : currentPhase?.action === "exhale"
          ? "Breathe Out"
          : "Rest";

  const phaseColor =
    currentPhase?.action === "inhale"
      ? "text-teal-400"
      : currentPhase?.action === "hold"
        ? "text-amber-400"
        : currentPhase?.action === "exhale"
          ? "text-blue-400"
          : "text-purple-400";

  const ringColor =
    currentPhase?.action === "inhale"
      ? "stroke-teal-400"
      : currentPhase?.action === "hold"
        ? "stroke-amber-400"
        : currentPhase?.action === "exhale"
          ? "stroke-blue-400"
          : "stroke-purple-400";

  // Breathing circle scale: grows on inhale, shrinks on exhale
  const circleScale =
    currentPhase?.action === "inhale"
      ? 0.6 + 0.4 * (phaseTimer / currentPhase.seconds)
      : currentPhase?.action === "exhale"
        ? 1.0 - 0.4 * (phaseTimer / currentPhase.seconds)
        : currentPhase?.action === "hold"
          ? 1.0
          : 0.6;

  return (
    <div className="flex flex-col items-center space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{exercise.name}</h2>
        <p className="text-lg text-muted-foreground">{exercise.description}</p>
      </div>

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center w-96 h-96">
        {/* Background ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 384 384">
          <circle
            cx="192"
            cy="192"
            r="170"
            fill="none"
            stroke="currentColor"
            className="text-muted/20"
            strokeWidth="5"
          />
          {/* Phase progress ring */}
          {isRunning && (
            <circle
              cx="192"
              cy="192"
              r="170"
              fill="none"
              className={ringColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 170}`}
              strokeDashoffset={`${2 * Math.PI * 170 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 0.3s ease" }}
            />
          )}
        </svg>

        {/* Animated breathing circle */}
        <div
          className="rounded-full bg-teal-500/10 border-2 border-teal-500/30 flex items-center justify-center transition-transform duration-1000 ease-in-out"
          style={{
            width: "280px",
            height: "280px",
            transform: `scale(${isRunning ? circleScale : 0.6})`,
          }}
        >
          <div className="text-center">
            {isComplete ? (
              <div>
                <p className="text-2xl font-bold text-teal-400">Complete</p>
                <p className="text-lg text-muted-foreground">
                  {cycleCount} cycles
                </p>
              </div>
            ) : isRunning ? (
              <div>
                <p className={`text-4xl font-bold ${phaseColor}`}>
                  {phaseLabel}
                </p>
                <p className="text-5xl font-mono font-bold mt-2">
                  {currentPhase.seconds - phaseTimer}
                </p>
              </div>
            ) : (
              <p className="text-2xl text-muted-foreground">
                {totalElapsed > 0 ? "Paused" : "Ready"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="w-96 space-y-2">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-1000 rounded-full"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {Math.floor(totalElapsed / 60)}:
            {String(totalElapsed % 60).padStart(2, "0")}
          </span>
          <span>Cycle {cycleCount + (isRunning ? 1 : 0)}</span>
          <span>
            {Math.floor(exercise.duration_seconds / 60)}:
            {String(exercise.duration_seconds % 60).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        {isRunning ? (
          <Button
            size="lg"
            onClick={handleStop}
            className="gap-2 bg-red-600 hover:bg-red-700"
          >
            <Square className="size-5" />
            Pause
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleStart}
            className="gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Play className="size-5" />
            {isComplete ? "Restart" : totalElapsed > 0 ? "Resume" : "Start"}
          </Button>
        )}
        {totalElapsed > 0 && !isRunning && (
          <Button variant="outline" size="lg" onClick={handleReset}>
            <RotateCcw className="size-5" />
          </Button>
        )}
      </div>

      {/* Pattern info */}
      <div className="flex gap-4 text-base text-muted-foreground">
        {exercise.pattern.map((phase, i) => (
          <span
            key={i}
            className={
              isRunning && i === phaseIndex ? "text-teal-400 font-bold" : ""
            }
          >
            {phase.action === "inhale"
              ? "In"
              : phase.action === "hold"
                ? "Hold"
                : phase.action === "exhale"
                  ? "Out"
                  : "Rest"}{" "}
            {phase.seconds}s
          </span>
        ))}
      </div>
    </div>
  );
}
