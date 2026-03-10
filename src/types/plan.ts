export interface PlanRequest {
  questionnaire: Record<string, unknown>;
  top_k: number;
}

export interface PlanResponse {
  plan: ExercisePlan;
  safety_flags: string[];
  referral_triggers: string[];
  knowledge_objects_used: number;
  curated_object_ids_used: string[];
  fitt_baseline: FITTBaseline;
  progression_stage: string;
  progression_context: ProgressionContext;
  knowledge_version: string;
  knowledge_last_updated: string;
  validation_warnings: string[];
  primary_track: string;
  secondary_emphasis: string;
  identity_level: string;
  adaptation_decision: string;
  age_adaptive_notes: string[];
}

export interface ProgressionContext {
  current_stage: string;
  name: string;
  number: number;
  goal: string;
  typical_duration_weeks: string;
  intensity_range: string;
  focus: string[];
  advancement_criteria: string[];
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
