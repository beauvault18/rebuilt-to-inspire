"use client";

import { Button } from "@/components/ui/button";
import type { DayPlan } from "@/types/plan";

interface Props {
  missedDay: DayPlan;
  onDoYesterday: () => void;
  onContinueToday: () => void;
  onDismiss: () => void;
}

export default function MissedWorkoutBanner({
  missedDay,
  onDoYesterday,
  onContinueToday,
  onDismiss,
}: Props) {
  return (
    <div className="bg-surface-card rounded-lg p-6 space-y-4">
      <div>
        <p className="text-base font-medium">
          You had a session scheduled yesterday.
        </p>
        <p className="text-base text-muted-foreground mt-1">
          That&apos;s okay — recovery isn&apos;t linear.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onDoYesterday}>
          Do Yesterday&apos;s Session
        </Button>
        <Button
          onClick={onContinueToday}
          className="bg-brand text-brand-foreground hover:brightness-110"
        >
          Continue With Today
        </Button>
        <Button variant="ghost" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
