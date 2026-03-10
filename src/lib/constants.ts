// Enum values mirroring survivorship_ai/planner/questionnaire.py exactly.

export const CANCER_TYPES = [
  { value: "breast", label: "Breast" },
  { value: "colorectal", label: "Colorectal" },
  { value: "prostate", label: "Prostate" },
  { value: "lung", label: "Lung" },
  { value: "thyroid", label: "Thyroid" },
  { value: "testicular", label: "Testicular" },
] as const;

export const TREATMENT_TYPES = [
  { value: "surgery", label: "Surgery" },
  { value: "chemotherapy", label: "Chemotherapy" },
  { value: "radiation", label: "Radiation" },
  { value: "immunotherapy", label: "Immunotherapy" },
  { value: "hormone_therapy", label: "Hormone Therapy" },
  { value: "targeted_therapy", label: "Targeted Therapy" },
  { value: "stem_cell_transplant", label: "Stem Cell Transplant" },
  { value: "other", label: "Other" },
] as const;

export const SURGERY_TYPES = [
  { value: "mastectomy", label: "Mastectomy", cancerType: "breast" },
  { value: "lumpectomy", label: "Lumpectomy", cancerType: "breast" },
  { value: "prostatectomy", label: "Prostatectomy", cancerType: "prostate" },
  { value: "colectomy", label: "Colectomy", cancerType: "colorectal" },
  { value: "lobectomy", label: "Lobectomy", cancerType: "lung" },
  { value: "pneumonectomy", label: "Pneumonectomy", cancerType: "lung" },
  { value: "wedge_resection", label: "Wedge Resection", cancerType: "lung" },
  { value: "thyroidectomy", label: "Thyroidectomy", cancerType: "thyroid" },
  { value: "orchiectomy", label: "Orchiectomy", cancerType: "testicular" },
  { value: "rplnd", label: "RPLND (Lymph Node Dissection)", cancerType: "testicular" },
  { value: "lymph_node_dissection", label: "Lymph Node Dissection", cancerType: null },
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
