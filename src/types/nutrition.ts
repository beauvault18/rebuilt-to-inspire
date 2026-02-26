export interface WorkoutDaySummary {
  day: string;
  focus: string;
  estimated_duration_min: number;
  intensity: string;
}

export interface NutritionQuestionnaireData {
  // Treatment context
  treatment_phase: string;
  current_medications: string[];

  // Eating habits
  current_diet: string;
  meals_per_day: number;
  appetite_level: string;
  digestive_issues: string[];

  // Cuisine preferences
  favorite_cuisines: string[];

  // Allergies & restrictions
  allergies: string[];
  dietary_restrictions: string[];

  // Disliked foods
  disliked_foods: string[];

  // Snack preferences
  snack_preferences: string[];

  // Cooking & budget
  cooking_skill: string;
  budget_preference: string;
  meal_prep_time: string;
}

export const INITIAL_NUTRITION: NutritionQuestionnaireData = {
  treatment_phase: "",
  current_medications: [],
  current_diet: "",
  meals_per_day: 3,
  appetite_level: "normal",
  digestive_issues: [],
  favorite_cuisines: [],
  allergies: [],
  dietary_restrictions: [],
  disliked_foods: [],
  snack_preferences: [],
  cooking_skill: "intermediate",
  budget_preference: "moderate",
  meal_prep_time: "30_min",
};

export interface NutritionPlanResponse {
  meal_plan: MealDay[];
  grocery_list: GroceryCategory[];
  snack_suggestions: SnackSuggestion[];
  cancer_specific_notes: string[];
  hydration_tips: string[];
  supplement_guidance: string[];
  medication_timing: string[];
  side_effect_tips: Record<string, string[]>;
  disclaimers: string[];
}

export interface MealDay {
  day: string;
  meals: Meal[];
  daily_totals?: DailyTotals;
}

export interface DailyTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface Meal {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  description: string;
  prep_time_min: number;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  key_nutrients: string[];
  cancer_benefit?: string;
  side_effect_tip?: string;
  workout_note?: string;
}

export interface GroceryCategory {
  category: string;
  items: GroceryItem[];
}

export interface GroceryItem {
  name: string;
  quantity: string;
  notes?: string;
}

export interface SnackSuggestion {
  name: string;
  description: string;
  cancer_benefit: string;
  calories: number;
}

/** Build the API payload for the nutrition plan endpoint. */
export function toNutritionApiPayload(
  data: NutritionQuestionnaireData,
  cancerTypes: string[],
  workoutSchedule?: WorkoutDaySummary[],
) {
  return {
    ...data,
    cancer_types: cancerTypes,
    workout_schedule: workoutSchedule || [],
  };
}
