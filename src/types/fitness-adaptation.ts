import type { AdaptationTier, AdaptationState } from "./nutrition-adaptation";

export type { AdaptationTier, AdaptationState };

export interface FitnessAdaptationSignal {
  metric: "pain" | "fatigue" | "energy";
  value: number;
  consecutiveCount: number;
}

export interface FitnessAdaptationResult {
  tier: AdaptationTier;
  signals: FitnessAdaptationSignal[];
}

export interface FitnessPendingAdaptation {
  tier: AdaptationTier;
  signals: FitnessAdaptationSignal[];
  triggeredAt: string;
}
