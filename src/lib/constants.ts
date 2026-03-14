// Enum values mirroring survivorship_ai/planner/questionnaire.py exactly.

export const CANCER_STAGE_OPTIONS = [
  { value: "Stage I", label: "Stage I" },
  { value: "Stage II", label: "Stage II" },
  { value: "Stage III", label: "Stage III" },
  { value: "Stage IV", label: "Stage IV" },
] as const;

export const CANCER_TYPES = [
  { value: "breast", label: "Breast" },
  { value: "colorectal", label: "Colorectal" },
  { value: "prostate", label: "Prostate" },
  { value: "lung", label: "Lung" },
  { value: "thyroid", label: "Thyroid" },
  { value: "testicular", label: "Testicular" },
] as const;

export const TREATMENT_TYPES = [
  { value: "chemotherapy", label: "Chemotherapy" },
  { value: "radiation", label: "Radiation" },
  { value: "immunotherapy", label: "Immunotherapy" },
  { value: "hormone_therapy", label: "Hormone Therapy" },
  { value: "targeted_therapy", label: "Targeted Therapy" },
  { value: "stem_cell_transplant", label: "Stem Cell Transplant" },
  { value: "other", label: "Other" },
] as const;

export const SURGERY_TYPES = [
  // Breast
  { value: "mastectomy", label: "Mastectomy", cancerType: "breast" },
  { value: "double_mastectomy", label: "Double Mastectomy", cancerType: "breast" },
  { value: "lumpectomy", label: "Lumpectomy (Breast-Conserving)", cancerType: "breast" },
  { value: "breast_reconstruction", label: "Breast Reconstruction", cancerType: "breast" },
  { value: "sentinel_node_biopsy_breast", label: "Sentinel Lymph Node Biopsy", cancerType: "breast" },
  { value: "axillary_dissection", label: "Axillary Lymph Node Dissection", cancerType: "breast" },
  // Colorectal
  { value: "colectomy", label: "Colectomy (Partial or Total)", cancerType: "colorectal" },
  { value: "low_anterior_resection", label: "Low Anterior Resection (LAR)", cancerType: "colorectal" },
  { value: "abdominoperineal_resection", label: "Abdominoperineal Resection (APR)", cancerType: "colorectal" },
  { value: "colostomy", label: "Colostomy / Ileostomy", cancerType: "colorectal" },
  { value: "polypectomy", label: "Polypectomy", cancerType: "colorectal" },
  // Prostate
  { value: "prostatectomy", label: "Radical Prostatectomy", cancerType: "prostate" },
  { value: "robotic_prostatectomy", label: "Robotic-Assisted Prostatectomy", cancerType: "prostate" },
  { value: "turp", label: "TURP (Transurethral Resection)", cancerType: "prostate" },
  { value: "pelvic_lymph_dissection", label: "Pelvic Lymph Node Dissection", cancerType: "prostate" },
  // Lung
  { value: "lobectomy", label: "Lobectomy", cancerType: "lung" },
  { value: "pneumonectomy", label: "Pneumonectomy", cancerType: "lung" },
  { value: "wedge_resection", label: "Wedge Resection", cancerType: "lung" },
  { value: "sleeve_resection", label: "Sleeve Resection", cancerType: "lung" },
  { value: "vats", label: "VATS (Video-Assisted Thoracic Surgery)", cancerType: "lung" },
  // Thyroid
  { value: "total_thyroidectomy", label: "Total Thyroidectomy", cancerType: "thyroid" },
  { value: "partial_thyroidectomy", label: "Partial Thyroidectomy (Lobectomy)", cancerType: "thyroid" },
  { value: "thyroid_lymph_dissection", label: "Central Neck Dissection", cancerType: "thyroid" },
  // Testicular
  { value: "orchiectomy", label: "Orchiectomy", cancerType: "testicular" },
  { value: "rplnd", label: "RPLND (Retroperitoneal Lymph Node Dissection)", cancerType: "testicular" },
  // General (shown for all cancer types)
  { value: "port_placement", label: "Port / Mediport Placement", cancerType: null },
  { value: "other", label: "Other", cancerType: null },
  { value: "none", label: "None / Not Applicable", cancerType: null },
] as const;

export const SYMPTOM_SEVERITIES = [
  { value: "none", label: "None" },
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
] as const;

export const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", description: "Little to no exercise" },
  { value: "light", label: "Light", description: "Some walking, light activity" },
  { value: "moderate", label: "Moderate", description: "Regular activity" },
  { value: "active", label: "Active", description: "Frequent vigorous activity" },
] as const;

export const EQUIPMENT_OPTIONS = [
  { value: "none", label: "No Equipment" },
  { value: "resistance_bands", label: "Resistance Bands" },
  { value: "light_dumbbells", label: "Light Dumbbells" },
  { value: "full_gym", label: "Full Gym Access" },
  { value: "home_basic", label: "Home Basic (chair, mat, etc.)" },
  { value: "pool", label: "Pool / Water Access" },
] as const;

export const LYMPHEDEMA_STATUSES = [
  { value: "none", label: "None" },
  { value: "at_risk", label: "At Risk" },
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
] as const;

export const BONE_MET_OPTIONS = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
  { value: "unknown", label: "Unknown" },
] as const;

export const PREFERRED_ACTIVITIES = [
  "Walking",
  "Cycling",
  "Swimming",
  "Yoga",
  "Pilates",
  "Dancing",
  "Hiking",
  "Elliptical",
  "Stationary Bike",
  "Tai Chi",
  "Stretching",
  "Water Aerobics",
  "Strength Training",
  "Light Weight Lifting",
  "Calisthenics",
  "Running",
] as const;

export const BONE_MET_LOCATIONS = [
  "Spine",
  "Pelvis",
  "Femur",
  "Ribs",
  "Other",
] as const;

export const FITNESS_GOALS = [
  { value: "get_back_in_shape", label: "Get Back Into Shape" },
  { value: "build_muscle", label: "Build Muscle" },
  { value: "lose_weight", label: "Lose Weight" },
  { value: "improve_endurance", label: "Improve Endurance" },
  { value: "increase_flexibility", label: "Increase Flexibility" },
  { value: "improve_balance", label: "Improve Balance" },
  { value: "reduce_fatigue", label: "Reduce Fatigue" },
  { value: "manage_pain", label: "Manage Pain" },
] as const;

export const PRE_DIAGNOSIS_ACTIVITIES = [
  { value: "sedentary", label: "Sedentary", description: "Little to no regular exercise" },
  { value: "lightly_active", label: "Lightly Active", description: "Occasional walking or light activity" },
  { value: "moderately_active", label: "Moderately Active", description: "Regular moderate exercise" },
  { value: "very_active", label: "Very Active", description: "Frequent vigorous exercise" },
  { value: "athlete", label: "Athlete", description: "Competitive or high-level training" },
] as const;

export const PRIMARY_GOALS = [
  { value: "general_fitness", label: "General Fitness", description: "Balanced overall health and conditioning" },
  { value: "strength_rebuild", label: "Rebuild Strength", description: "Focus on rebuilding muscular strength" },
  { value: "endurance_rebuild", label: "Rebuild Endurance", description: "Focus on cardiovascular endurance" },
  { value: "weight_management", label: "Weight Management", description: "Healthy body composition goals" },
  { value: "flexibility_mobility", label: "Flexibility & Mobility", description: "Improve range of motion and flexibility" },
  { value: "fatigue_management", label: "Manage Fatigue", description: "Gentle, energy-conserving approach" },
  { value: "return_to_sport", label: "Return to Sport", description: "Progressive return to athletic activity" },
] as const;

export const SECONDARY_EMPHASES = [
  { value: "none", label: "No Secondary Focus" },
  { value: "core_stability", label: "Core Stability" },
  { value: "balance", label: "Balance Training" },
  { value: "bone_density", label: "Bone Density" },
  { value: "joint_health", label: "Joint Health" },
  { value: "cardiovascular", label: "Cardiovascular Health" },
  { value: "muscle_preservation", label: "Muscle Preservation" },
  { value: "pain_management", label: "Pain Management" },
] as const;

export const LONG_TERM_AMBITIONS = [
  { value: "maintenance", label: "Maintenance", description: "Sustain current fitness and health" },
  { value: "progressive_fitness", label: "Progressive Fitness", description: "Steadily improve over time" },
  { value: "sport_return", label: "Sport Return", description: "Return to a specific sport or activity" },
  { value: "peak_performance", label: "Peak Performance", description: "Reach highest possible fitness level" },
] as const;

export const SLEEP_OPTIONS = [
  { value: "less_than_6", label: "Less than 6 hours" },
  { value: "6_to_7", label: "6–7 hours" },
  { value: "7_to_8", label: "7–8 hours" },
  { value: "8_to_9", label: "8–9 hours" },
  { value: "9_plus", label: "9+ hours" },
] as const;

export const DAYS_OPTIONS = [
  { value: "2", label: "1–2 days" },
  { value: "3", label: "3 days" },
  { value: "4", label: "4 days" },
  { value: "5", label: "5 days" },
  { value: "6", label: "6+ days" },
] as const;

export const DURATION_OPTIONS = [
  { value: "20", label: "15–20 minutes" },
  { value: "30", label: "20–30 minutes" },
  { value: "40", label: "30–45 minutes" },
  { value: "50", label: "45–60 minutes" },
  { value: "75", label: "60–90 minutes" },
] as const;
