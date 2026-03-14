export interface QuestionnaireData {
  // Frontend-only user profile fields (NOT sent to backend API)
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  sex: "male" | "female";

  // Frontend-only date fields (used to compute months_since_treatment_completion)
  diagnosisDate: string; // YYYY-MM format
  remissionDate: string; // YYYY-MM format
  surgeryDate: string; // YYYY-MM format
  lastChemoDate: string; // YYYY-MM format

  // Frontend-only body/goal fields
  heightFeet: number;
  heightInches: number;
  currentWeight: number; // lbs
  goalWeight: number; // lbs
  goals: string[]; // e.g. ["get_back_in_shape", "build_muscle", "lose_weight"]

  // Fields mapping 1:1 to Pydantic Questionnaire model
  cancer_types: string[];
  cancer_stages: Record<string, string>; // e.g. { breast: "Stage II", lung: "Stage IV" }
  treatments_received: string[];
  treatment_dates: Record<string, string>; // e.g. { chemotherapy: "2025-06", radiation: "2025-09" }
  surgery_type: string;
  months_since_treatment_completion: number;
  fatigue: string;
  pain: string;
  neuropathy: string;
  balance_issues: string;
  dyspnea: string;
  urinary_incontinence: string;
  lymphedema_status: string;
  lymphedema_limb: string | null;
  has_ostomy: boolean;
  had_rplnd: boolean;
  on_hormone_therapy: boolean;
  bone_metastases: string;
  bone_metastases_locations: string[];
  heart_or_lung_disease: boolean;
  current_activity_level: string;
  minutes_per_week_current: number;
  equipment_access: string[];
  preferred_activities: string[];
  days_available: number;
  preferred_days: string[]; // e.g. ["monday","wednesday","friday"] or ["flexible"]
  session_duration_preference: number;

  // Goal and track selection (new — maps to backend enums)
  pre_diagnosis_activity: string;
  primary_goal: string;
  secondary_emphasis: string;
  long_term_ambition: string;

  clinician_clearance: boolean;
  clinician_restrictions: string[];

  // Sleep (recovery factor)
  sleep_hours: string;
}

export const INITIAL_QUESTIONNAIRE: QuestionnaireData = {
  firstName: "",
  lastName: "",
  email: "",
  age: 0,
  sex: "female",
  diagnosisDate: "",
  remissionDate: "",
  surgeryDate: "",
  lastChemoDate: "",
  heightFeet: 0,
  heightInches: 0,
  currentWeight: 0,
  goalWeight: 0,
  goals: [],
  cancer_types: [],
  cancer_stages: {},
  treatments_received: [],
  treatment_dates: {},
  surgery_type: "none",
  months_since_treatment_completion: 0,
  fatigue: "none",
  pain: "none",
  neuropathy: "none",
  balance_issues: "none",
  dyspnea: "none",
  urinary_incontinence: "none",
  lymphedema_status: "none",
  lymphedema_limb: null,
  has_ostomy: false,
  had_rplnd: false,
  on_hormone_therapy: false,
  bone_metastases: "no",
  bone_metastases_locations: [],
  heart_or_lung_disease: false,
  current_activity_level: "sedentary",
  minutes_per_week_current: 0,
  equipment_access: ["none"],
  preferred_activities: [],
  days_available: 3,
  preferred_days: [],
  session_duration_preference: 30,
  pre_diagnosis_activity: "moderately_active",
  primary_goal: "general_fitness",
  secondary_emphasis: "none",
  long_term_ambition: "maintenance",
  clinician_clearance: false,
  clinician_restrictions: [],
  sleep_hours: "7_to_8",
};

/** Compute months between remission date and now. */
function computeMonthsSinceRemission(remissionDate: string): number {
  if (!remissionDate) return 0;
  const [year, month] = remissionDate.split("-").map(Number);
  const now = new Date();
  const months =
    (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  return Math.max(0, months);
}

/** Strip frontend-only fields and return the API-compatible payload. */
export function toApiPayload(data: QuestionnaireData) {
  const {
    firstName: _fn,
    lastName: _ln,
    email: _em,
    age: _age,
    sex: _sex,
    diagnosisDate: _dd,
    remissionDate: _rd,
    surgeryDate: _sd,
    lastChemoDate: _lcd,
    heightFeet: _hf,
    heightInches: _hi,
    currentWeight: _cw,
    goalWeight: _gw,
    goals: _goals,
    ...apiFields
  } = data;
  // Auto-compute months_since_treatment_completion from remission date
  apiFields.months_since_treatment_completion =
    computeMonthsSinceRemission(data.remissionDate);
  // Send age to backend (null if not set or under 18)
  return { ...apiFields, age: data.age >= 18 ? data.age : null };
}
