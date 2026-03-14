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
      <p className="text-base font-medium">Daily Fueling Check-In</p>
      <p className="text-base text-muted-foreground">
        A quick check-in helps us tailor your plan — how are you feeling today?
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
