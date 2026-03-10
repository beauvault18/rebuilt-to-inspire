/** Workout completion log entry — persisted in localStorage */
export interface WorkoutLogEntry {
  date: string; // ISO YYYY-MM-DD
  dayIndex: number; // Index into weekly_plan
  dayName: string; // "Monday", etc.
  mode: "summary" | "guided";
  exercisesCompleted: string[]; // Exercise names marked done
  totalExercises: number;
  checkIn?: PostWorkoutCheckIn;
}

/** Post-workout adaptive check-in (energy / pain / fatigue) */
export interface PostWorkoutCheckIn {
  energy: number; // 1-5
  pain: number; // 1-5
  fatigue: number; // 1-5
}

/** Plan tracking metadata — persisted in localStorage */
export interface PlanTracking {
  startDate: string; // ISO date when plan was generated
  planHash: string; // Detect plan regeneration
  deloadOverrideCount: number;
  preferredMode: "summary" | "guided";
}

export const ENERGY_LABELS: Record<number, string> = {
  1: "Exhausted",
  2: "Low",
  3: "Moderate",
  4: "Good",
  5: "High",
};

export const PAIN_LABELS: Record<number, string> = {
  1: "None",
  2: "Mild",
  3: "Moderate",
  4: "Significant",
  5: "Severe",
};

export const FATIGUE_LABELS: Record<number, string> = {
  1: "None",
  2: "Mild",
  3: "Moderate",
  4: "Heavy",
  5: "Overwhelming",
};
