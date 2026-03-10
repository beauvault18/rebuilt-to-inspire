export type WeightTrend =
  | "stable"
  | "slightly_down"
  | "significantly_down"
  | "up";

export interface NutritionCheckIn {
  date: string;
  appetite: number;
  energy: number;
  gi: number;
  weightTrend?: WeightTrend;
}

export const APPETITE_LABELS: Record<number, string> = {
  1: "Very low",
  2: "Low",
  3: "Moderate",
  4: "Good",
  5: "Strong",
};

export const ENERGY_LABELS: Record<number, string> = {
  1: "Exhausted",
  2: "Low",
  3: "Moderate",
  4: "Good",
  5: "High",
};

export const GI_LABELS: Record<number, string> = {
  1: "Significant issues",
  2: "Uncomfortable",
  3: "Manageable",
  4: "Mostly comfortable",
  5: "Comfortable",
};
