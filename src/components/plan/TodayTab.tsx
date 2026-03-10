"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Moon } from "lucide-react";
import GuidedWorkout from "./GuidedWorkout";
import PostWorkoutCheckIn from "./PostWorkoutCheckIn";
import MissedWorkoutBanner from "./MissedWorkoutBanner";
import WeekReviewBanner from "./WeekReviewBanner";
import DeloadAdvisory from "./DeloadAdvisory";
import CycleReview from "./CycleReview";
import { isRestDay, estimateDuration, getTodayISO, saveWorkoutLog, loadWorkoutLog, detectMissedYesterday, countMissedThisWeek, shouldRecommendDeload, savePlanTracking, markFitnessAdaptationPending } from "@/lib/workout-storage";
import { evaluateFitnessTrend } from "@/lib/fitness-adaptation";
import type { PostWorkoutCheckIn as CheckInData } from "@/types/workout";
import type { DayPlan, PlanResponse } from "@/types/plan";
import type { WorkoutLogEntry, PlanTracking } from "@/types/workout";

interface Props {
  day: DayPlan;
  dayIndex: number;
  response: PlanResponse;
  todayCompleted: boolean;
  workoutLog: WorkoutLogEntry[];
  planTracking: PlanTracking | null;
  weekNumber: number;
  onWorkoutLogged: (entry: WorkoutLogEntry) => void;
}

type WorkoutMode = "summary" | "guided" | "checkin" | "completed";

// Rationale text for each focus type
const FOCUS_RATIONALES: Record<string, string> = {
  resistance:
    "Resistance training helps rebuild muscle mass lost during treatment, improves bone density, and combats cancer-related fatigue.",
  aerobic:
    "Aerobic exercise improves cardiovascular fitness, reduces fatigue, and has been shown to improve quality of life in cancer survivors.",
  flexibility:
    "Flexibility exercises help restore range of motion after surgery, reduce stiffness from radiation fibrosis, and promote relaxation.",
  balance:
    "Balance training reduces fall risk, which is especially important for survivors on treatments that affect bone density or cause neuropathy.",
  rest: "Rest days are essential for recovery. Your muscles repair and grow stronger during rest periods. Light walking or gentle stretching is fine if desired.",
  recovery:
    "Active recovery promotes blood flow to aid muscle repair without adding training stress. Keep intensity very low.",
  cardio:
    "Cardiovascular training builds endurance, supports heart health, and helps manage treatment-related fatigue.",
};

function getRationale(focus: string): string {
  const lower = focus.toLowerCase();
  for (const [key, rationale] of Object.entries(FOCUS_RATIONALES)) {
    if (lower.includes(key)) return rationale;
  }
  return "This workout is designed based on evidence-based guidelines for cancer survivors, targeting your specific needs and fitness level.";
}

function getIntensityRange(day: DayPlan): string | null {
  const intensities = (day.main || [])
    .map((ex) => ex.intensity)
    .filter(Boolean) as string[];
  if (intensities.length === 0) return null;
  const unique = [...new Set(intensities)];
  return unique.join(" / ");
}

function getEquipmentList(day: DayPlan): string[] {
  const equipment = new Set<string>();
  day.main?.forEach((ex) => {
    if (ex.equipment && ex.equipment !== "—") equipment.add(ex.equipment);
  });
  return Array.from(equipment);
}

export default function TodayTab({
  day,
  dayIndex,
  response,
  todayCompleted,
  workoutLog,
  planTracking,
  weekNumber,
  onWorkoutLogged,
}: Props) {
  const [mode, setMode] = useState<WorkoutMode>(
    todayCompleted ? "completed" : "summary",
  );

  const rest = isRestDay(day);
  const duration = estimateDuration(day);
  const intensity = getIntensityRange(day);
  const equipment = getEquipmentList(day);
  const exerciseCount = day.main?.length || 0;

  const [pendingEntry, setPendingEntry] = useState<WorkoutLogEntry | null>(null);

  // Missed workout detection
  const weeklyPlan = response.plan.weekly_plan || [];
  const missedDay = detectMissedYesterday(workoutLog, weeklyPlan);
  const missedCount = countMissedThisWeek(workoutLog, weeklyPlan);
  const [missedDismissed, setMissedDismissed] = useState(false);
  const [weekReviewDismissed, setWeekReviewDismissed] = useState(false);
  const [overrideDay, setOverrideDay] = useState<DayPlan | null>(null);

  // Deload detection
  const deloadRecommended = shouldRecommendDeload(workoutLog);
  const [deloadDismissed, setDeloadDismissed] = useState(false);

  // Cycle review detection
  const typicalWeeks = parseInt(response.progression_context?.typical_duration_weeks || "0", 10);
  const cycleComplete = typicalWeeks > 0 && weekNumber > typicalWeeks;
  const [cycleReviewDismissed, setCycleReviewDismissed] = useState(false);

  // The active day for guided mode — yesterday's if overridden, otherwise today's
  const guidedDay = overrideDay || day;

  const handleGuidedComplete = (exercisesCompleted: string[]) => {
    const entry: WorkoutLogEntry = {
      date: getTodayISO(),
      dayIndex,
      dayName: day.day,
      mode: "guided",
      exercisesCompleted,
      totalExercises: exercisesCompleted.length,
    };
    setPendingEntry(entry);
    setMode("checkin");
  };

  const saveEntry = (entry: WorkoutLogEntry) => {
    const log = loadWorkoutLog();
    const updated = log.filter((e) => e.date !== entry.date);
    updated.push(entry);
    saveWorkoutLog(updated);
    onWorkoutLogged(entry);
    setMode("completed");
  };

  const handleCheckInSubmit = (checkIn: CheckInData) => {
    if (pendingEntry) {
      saveEntry({ ...pendingEntry, checkIn });
      // Evaluate trend after check-in — adaptation is deferred to Program tab
      const log = loadWorkoutLog();
      const trend = evaluateFitnessTrend(log);
      if (trend) {
        markFitnessAdaptationPending(trend);
      }
    }
  };

  const handleCheckInSkip = () => {
    if (pendingEntry) {
      saveEntry(pendingEntry);
    }
  };

  // Rest day view
  if (rest) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Moon className="size-16 text-muted-foreground/30 mb-6" />
        <p className="text-2xl font-bold">{day.focus || "Rest Day"}</p>
        <p className="text-base text-muted-foreground mt-3 max-w-md leading-relaxed">
          Recovery is when your body gets stronger. Light walking or gentle
          stretching is fine if desired.
        </p>
      </div>
    );
  }

  // Guided workout mode
  if (mode === "guided") {
    return (
      <GuidedWorkout
        day={guidedDay}
        onComplete={handleGuidedComplete}
        onExit={() => {
          setOverrideDay(null);
          setMode("summary");
        }}
      />
    );
  }

  // Post-workout check-in
  if (mode === "checkin") {
    return (
      <PostWorkoutCheckIn
        onSubmit={handleCheckInSubmit}
        onSkip={handleCheckInSkip}
      />
    );
  }

  // Summary / Completed mode
  const isCompleted = mode === "completed" || todayCompleted;

  const handleDoYesterday = () => {
    if (missedDay) {
      setOverrideDay(missedDay);
      setMissedDismissed(true);
      setMode("guided");
    }
  };

  // Priority gating — only one advisory surface at a time
  // Order: CycleReview > DeloadAdvisory > WeekReview > MissedYesterday
  const showCycleReview =
    cycleComplete && !cycleReviewDismissed && !!planTracking;
  const showDeload =
    !showCycleReview && !isCompleted && deloadRecommended && !deloadDismissed;
  const showWeekReview =
    !showCycleReview && !showDeload && !isCompleted && missedCount >= 3 && !weekReviewDismissed;
  const showMissed =
    !showCycleReview && !showDeload && !showWeekReview && !isCompleted && !!missedDay && !missedDismissed;

  return (
    <div className="space-y-8">
      {/* Single advisory surface — priority gated */}
      {showCycleReview && planTracking && (
        <CycleReview
          workoutLog={workoutLog}
          tracking={planTracking}
          progressionContext={response.progression_context}
          weekNumber={weekNumber}
          onDismiss={() => setCycleReviewDismissed(true)}
        />
      )}

      {showDeload && (
        <DeloadAdvisory
          overrideCount={planTracking?.deloadOverrideCount ?? 0}
          onAcceptDeload={() => setDeloadDismissed(true)}
          onOverride={() => {
            if (planTracking) {
              const updated = {
                ...planTracking,
                deloadOverrideCount: planTracking.deloadOverrideCount + 1,
              };
              savePlanTracking(updated);
            }
            setDeloadDismissed(true);
          }}
        />
      )}

      {showWeekReview && (
        <WeekReviewBanner
          missedCount={missedCount}
          onDismiss={() => setWeekReviewDismissed(true)}
        />
      )}

      {showMissed && missedDay && (
        <MissedWorkoutBanner
          missedDay={missedDay}
          onDoYesterday={handleDoYesterday}
          onContinueToday={() => setMissedDismissed(true)}
          onDismiss={() => setMissedDismissed(true)}
        />
      )}

      {/* Today's Focus */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold">Today&apos;s Focus</h2>
          <Badge>{day.focus}</Badge>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          {getRationale(day.focus)}
        </p>
        {response.plan.cancer_type_focus && (
          <p className="text-base text-muted-foreground mt-1">
            Tailored for{" "}
            <span className="capitalize font-medium">
              {response.plan.cancer_type_focus}
            </span>{" "}
            cancer survivors.
          </p>
        )}
      </div>

      {/* Session Summary */}
      <div className="bg-surface-card rounded-lg p-6">
        <div className="flex flex-wrap gap-8">
          {duration > 0 && (
            <div>
              <p className="text-base text-muted-foreground">Duration</p>
              <p className="text-2xl font-bold">~{duration} min</p>
            </div>
          )}
          <div>
            <p className="text-base text-muted-foreground">Exercises</p>
            <p className="text-2xl font-bold">{exerciseCount}</p>
          </div>
          {intensity && (
            <div>
              <p className="text-base text-muted-foreground">Intensity</p>
              <p className="text-lg font-semibold">{intensity}</p>
            </div>
          )}
          {equipment.length > 0 && (
            <div>
              <p className="text-base text-muted-foreground mb-1">Equipment</p>
              <div className="flex flex-wrap gap-1.5">
                {equipment.map((eq) => (
                  <Badge key={eq} variant="outline">
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary CTA */}
      <button
        onClick={() => setMode("guided")}
        disabled={isCompleted}
        className={`w-full py-4 rounded-lg text-lg font-semibold transition-all duration-200 cursor-pointer ${
          isCompleted
            ? "bg-surface-card text-muted-foreground cursor-default"
            : "bg-brand text-brand-foreground hover:brightness-110 hover:scale-[1.005]"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {isCompleted ? (
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="size-5" />
            Completed
          </span>
        ) : (
          "Start Workout"
        )}
      </button>

      {/* Exercise Preview */}
      <div className="space-y-3">
        {day.main?.map((ex, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-surface-border/20 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="size-7 rounded-full bg-surface-card flex items-center justify-center text-sm text-muted-foreground font-medium shrink-0">
                {i + 1}
              </span>
              <span className="text-lg">{ex.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {ex.sets != null && (
                <span className="text-base text-muted-foreground">
                  {ex.sets} &times; {ex.reps_or_duration}
                </span>
              )}
              {ex.equipment && ex.equipment !== "—" && (
                <Badge variant="outline" className="text-sm">
                  {ex.equipment}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
