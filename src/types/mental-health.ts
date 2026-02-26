// ── Mood Tracking ──

export interface MoodEntry {
  id: string;
  date: string; // ISO date
  mood: number; // 1-10
  anxiety: number; // 1-10
  energy: number; // 1-5
  sleep_quality: number; // 1-5
  fear_of_recurrence: number; // 1-5
  notes: string;
}

export const MOOD_LABELS: Record<number, string> = {
  1: "Very Low",
  2: "Low",
  3: "Below Average",
  4: "Slightly Low",
  5: "Neutral",
  6: "Okay",
  7: "Good",
  8: "Great",
  9: "Very Good",
  10: "Excellent",
};

// ── Journaling ──

export interface JournalEntry {
  id: string;
  date: string;
  prompt: string;
  entry_text: string;
  ai_reflection: string;
  tags: string[];
}

export const JOURNAL_PROMPTS = [
  "What are 3 things you're grateful for today?",
  "Write a letter to your body — what would you say?",
  "What does 'survivorship' mean to you right now?",
  "Describe a moment this week when you felt strong.",
  "What are you most afraid of? Write it without editing.",
  "What has changed about how you see yourself since diagnosis?",
  "Who has supported you most, and what did they do?",
  "If you could tell your pre-diagnosis self one thing, what would it be?",
  "What small victory can you celebrate today?",
  "Describe a place where you feel completely safe and at peace.",
  "What is one thing you want to let go of?",
  "Write about something that made you smile recently.",
];

export const JOURNAL_TAGS = [
  "gratitude",
  "fear",
  "hope",
  "grief",
  "strength",
  "anger",
  "peace",
  "growth",
  "love",
  "acceptance",
];

// ── Breathwork ──

export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  duration_seconds: number;
  pattern: BreathPhase[];
  cancer_benefit: string;
  best_for: string[];
}

export interface BreathPhase {
  action: "inhale" | "hold" | "exhale" | "rest";
  seconds: number;
}

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: "box",
    name: "Box Breathing",
    description:
      "Equal-length inhale, hold, exhale, hold. Used by Navy SEALs to calm the nervous system under stress.",
    duration_seconds: 240,
    pattern: [
      { action: "inhale", seconds: 4 },
      { action: "hold", seconds: 4 },
      { action: "exhale", seconds: 4 },
      { action: "rest", seconds: 4 },
    ],
    cancer_benefit:
      "Activates the parasympathetic nervous system, reducing cortisol — particularly helpful before scans or appointments.",
    best_for: ["scanxiety", "pre-appointment nerves", "general stress"],
  },
  {
    id: "478",
    name: "4-7-8 Relaxation",
    description:
      "Inhale for 4, hold for 7, exhale slowly for 8. A natural tranquilizer for the nervous system.",
    duration_seconds: 240,
    pattern: [
      { action: "inhale", seconds: 4 },
      { action: "hold", seconds: 7 },
      { action: "exhale", seconds: 8 },
    ],
    cancer_benefit:
      "The extended exhale triggers deep relaxation. Recommended for treatment-related insomnia and nighttime anxiety.",
    best_for: ["insomnia", "nighttime anxiety", "racing thoughts"],
  },
  {
    id: "diaphragmatic",
    name: "Diaphragmatic Breathing",
    description:
      "Deep belly breathing that engages the diaphragm. Slow, natural rhythm focused on expanding the abdomen.",
    duration_seconds: 300,
    pattern: [
      { action: "inhale", seconds: 5 },
      { action: "exhale", seconds: 5 },
    ],
    cancer_benefit:
      "Reduces fatigue and improves oxygen exchange. Especially beneficial for lung cancer survivors and those with treatment-related breathlessness.",
    best_for: ["fatigue", "breathlessness", "daily practice"],
  },
  {
    id: "coherent",
    name: "Coherent Breathing",
    description:
      "Simple 5-5 rhythm that synchronizes heart rate variability for optimal stress resilience.",
    duration_seconds: 300,
    pattern: [
      { action: "inhale", seconds: 5 },
      { action: "exhale", seconds: 5 },
    ],
    cancer_benefit:
      "Improves heart rate variability (HRV), which is often disrupted by chemotherapy. Builds long-term stress resilience.",
    best_for: ["daily practice", "stress resilience", "post-treatment recovery"],
  },
  {
    id: "quick-calm",
    name: "Quick Calm (1 Minute)",
    description:
      "A fast 3-3-6 pattern for immediate relief. Three quick cycles to regain composure anywhere.",
    duration_seconds: 60,
    pattern: [
      { action: "inhale", seconds: 3 },
      { action: "hold", seconds: 3 },
      { action: "exhale", seconds: 6 },
    ],
    cancer_benefit:
      "Designed for acute anxiety moments — waiting rooms, scan results, diagnosis anniversaries. Relief in 60 seconds.",
    best_for: ["panic moments", "waiting rooms", "quick relief"],
  },
];
