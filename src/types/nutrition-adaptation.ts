export type AdaptationTier = 1 | 2;

export interface AdaptationSignal {
  metric: "appetite" | "gi" | "weight";
  value: number | string;
  consecutiveCount: number;
}

export interface AdaptationResult {
  tier: AdaptationTier;
  signals: AdaptationSignal[];
}

export interface PendingAdaptation {
  tier: AdaptationTier;
  signals: AdaptationSignal[];
  triggeredAt: string;
}

export type AdaptationState =
  | "idle"
  | "pending"
  | "adapting"
  | "awaiting_confirmation"
  | "success"
  | "error"
  | "declined";
