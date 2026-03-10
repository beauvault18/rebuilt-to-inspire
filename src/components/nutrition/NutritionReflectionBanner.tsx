"use client";

import { Button } from "@/components/ui/button";

interface Props {
  onCheckIn: () => void;
  onSnooze: () => void;
}

export default function NutritionReflectionBanner({
  onCheckIn,
  onSnooze,
}: Props) {
  return (
    <div className="bg-surface-card rounded-lg p-6 space-y-4">
      <p className="text-base font-medium">Fueling Reflection</p>
      <p className="text-base text-muted-foreground">
        Over the past week, how has your fueling been supporting your recovery?
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onCheckIn}
          className="bg-brand text-brand-foreground hover:brightness-110"
        >
          Check In
        </Button>
        <Button variant="ghost" onClick={onSnooze}>
          Remind Me Later
        </Button>
      </div>
    </div>
  );
}
