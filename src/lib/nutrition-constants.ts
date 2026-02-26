export const TREATMENT_PHASES = [
  {
    value: "active_chemo",
    label: "Currently on Chemotherapy",
    description: "Receiving chemotherapy treatment now",
  },
  {
    value: "active_radiation",
    label: "Currently on Radiation",
    description: "Receiving radiation therapy now",
  },
  {
    value: "active_immunotherapy",
    label: "Currently on Immunotherapy",
    description: "Receiving immunotherapy now",
  },
  {
    value: "active_hormone",
    label: "Currently on Hormone Therapy",
    description: "Taking hormone-blocking medications",
  },
  {
    value: "recently_completed",
    label: "Recently Completed Treatment",
    description: "Finished treatment within the last 6 months",
  },
  {
    value: "survivorship",
    label: "Survivorship (6+ months post-treatment)",
    description: "Completed treatment more than 6 months ago",
  },
  {
    value: "maintenance",
    label: "Maintenance / Monitoring",
    description: "On long-term maintenance or active surveillance",
  },
] as const;

export const CURRENT_MEDICATIONS = [
  { value: "levothyroxine", label: "Levothyroxine (Synthroid)" },
  { value: "tamoxifen", label: "Tamoxifen" },
  { value: "aromatase_inhibitor", label: "Aromatase Inhibitor (Letrozole, Anastrozole)" },
  { value: "adt", label: "ADT / Hormone Therapy (Lupron, Enzalutamide)" },
  { value: "steroids", label: "Steroids (Dexamethasone, Prednisone)" },
  { value: "blood_thinners", label: "Blood Thinners (Warfarin, Eliquis)" },
  { value: "anti_nausea", label: "Anti-Nausea Medication" },
  { value: "pain_medication", label: "Pain Medication" },
  { value: "immunosuppressants", label: "Immunosuppressants" },
  { value: "none", label: "None" },
] as const;

export const CURRENT_DIETS = [
  { value: "standard_american", label: "Standard American Diet" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "keto_low_carb", label: "Keto / Low-Carb" },
  { value: "gluten_free", label: "Gluten-Free" },
  { value: "no_specific", label: "No Specific Diet" },
] as const;

export const APPETITE_LEVELS = [
  { value: "poor", label: "Poor", description: "Rarely feel hungry, struggle to eat" },
  { value: "reduced", label: "Reduced", description: "Less appetite than usual" },
  { value: "normal", label: "Normal", description: "Typical appetite" },
  { value: "increased", label: "Increased", description: "Hungrier than usual" },
] as const;

export const DIGESTIVE_ISSUES = [
  { value: "nausea", label: "Nausea" },
  { value: "vomiting", label: "Vomiting" },
  { value: "diarrhea", label: "Diarrhea" },
  { value: "constipation", label: "Constipation" },
  { value: "mouth_sores", label: "Mouth Sores" },
  { value: "taste_changes", label: "Taste Changes" },
  { value: "difficulty_swallowing", label: "Difficulty Swallowing" },
  { value: "bloating", label: "Bloating / Gas" },
  { value: "acid_reflux", label: "Acid Reflux" },
  { value: "none", label: "None" },
] as const;

export const CUISINES = [
  { value: "american", label: "American" },
  { value: "mexican", label: "Mexican" },
  { value: "italian", label: "Italian" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
  { value: "indian", label: "Indian" },
  { value: "thai", label: "Thai" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "middle_eastern", label: "Middle Eastern" },
  { value: "soul_food", label: "Soul Food" },
  { value: "cajun_creole", label: "Cajun / Creole" },
  { value: "french", label: "French" },
  { value: "greek", label: "Greek" },
  { value: "caribbean", label: "Caribbean" },
  { value: "vietnamese", label: "Vietnamese" },
] as const;

export const ALLERGIES = [
  { value: "dairy", label: "Dairy" },
  { value: "eggs", label: "Eggs" },
  { value: "peanuts", label: "Peanuts" },
  { value: "tree_nuts", label: "Tree Nuts" },
  { value: "soy", label: "Soy" },
  { value: "wheat_gluten", label: "Wheat / Gluten" },
  { value: "fish", label: "Fish" },
  { value: "shellfish", label: "Shellfish" },
  { value: "sesame", label: "Sesame" },
  { value: "corn", label: "Corn" },
  { value: "none", label: "No Allergies" },
] as const;

export const DIETARY_RESTRICTIONS = [
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "low_sodium", label: "Low Sodium" },
  { value: "low_sugar", label: "Low Sugar / Diabetic-Friendly" },
  { value: "low_fat", label: "Low Fat" },
  { value: "high_protein", label: "High Protein" },
  { value: "high_fiber", label: "High Fiber" },
  { value: "anti_inflammatory", label: "Anti-Inflammatory" },
  { value: "low_iodine", label: "Low Iodine (Thyroid)" },
  { value: "none", label: "No Restrictions" },
] as const;

export const SNACK_PREFERENCES = [
  { value: "fresh_fruit", label: "Fresh Fruit" },
  { value: "nuts_seeds", label: "Nuts & Seeds" },
  { value: "yogurt", label: "Yogurt" },
  { value: "smoothies", label: "Smoothies" },
  { value: "protein_bars", label: "Protein Bars" },
  { value: "vegetables_hummus", label: "Vegetables & Hummus" },
  { value: "cheese_crackers", label: "Cheese & Crackers" },
  { value: "trail_mix", label: "Trail Mix" },
  { value: "dark_chocolate", label: "Dark Chocolate" },
  { value: "popcorn", label: "Popcorn" },
  { value: "energy_bites", label: "Energy Bites" },
  { value: "granola", label: "Granola" },
] as const;

export const COOKING_SKILLS = [
  { value: "beginner", label: "Beginner", description: "Can follow simple recipes" },
  { value: "intermediate", label: "Intermediate", description: "Comfortable with most recipes" },
  { value: "advanced", label: "Advanced", description: "Can cook most things from scratch" },
] as const;

export const BUDGET_PREFERENCES = [
  { value: "budget", label: "Budget-Friendly", description: "Keep costs low" },
  { value: "moderate", label: "Moderate", description: "Balance of cost and quality" },
  { value: "flexible", label: "Flexible", description: "Quality is the priority" },
] as const;

export const MEAL_PREP_TIMES = [
  { value: "15_min", label: "15 minutes or less" },
  { value: "30_min", label: "About 30 minutes" },
  { value: "45_min", label: "About 45 minutes" },
  { value: "60_plus", label: "60+ minutes is fine" },
] as const;
