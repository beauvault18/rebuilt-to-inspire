export interface PlanRequest {
  questionnaire: Record<string, unknown>;
  top_k: number;
}

export interface PlanResponse {
  plan: ExercisePlan;
  safety_flags: string[];
  referral_triggers: string[];
  evidence_count: number;
  fitt_baseline: FITTBaseline;
}

export interface ExercisePlan {
  summary?: string;
  cancer_type_focus?: string;
  safety_flags?: string[];
  referral_triggers?: string[];
  disclaimers?: string[];
  weekly_plan?: DayPlan[];
  progression_rules?: string[];
  stop_rules?: string[];
  cancer_specific_notes?: string[];
  citations?: Citation[];
}

export interface DayPlan {
  day: string;
  focus: string;
  warmup?: { duration_min: number; exercises: Exercise[] };
  main?: MainExercise[];
  cooldown?: { duration_min: number; exercises: Exercise[] };
  cancer_specific_components?: Exercise[];
}

export interface Exercise {
  name: string;
  duration_or_reps: string;
  notes?: string;
}

export interface MainExercise {
  name: string;
  sets?: string | number;
  reps_or_duration: string;
  intensity?: string;
  equipment?: string;
  modification?: string;
  precaution?: string;
  citation_ids?: string[];
}

export interface Citation {
  snippet_id: string;
  rationale: string;
}

export interface FITTBaseline {
  aerobic?: {
    frequency: string;
    intensity: string;
    duration: string;
    type: string[];
  };
  resistance?: {
    frequency: string;
    intensity: string;
    sets: string;
    reps: string;
  };
}
