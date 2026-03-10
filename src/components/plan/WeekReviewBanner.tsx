"use client";

import { Button } from "@/components/ui/button";

interface Props {
  missedCount: number;
  onDismiss: () => void;
}

export default function WeekReviewBanner({ missedCount, onDismiss }: Props) {
  return (
    <div className="bg-surface-card rounded-lg p-6 space-y-4">
      <div>
        <p className="text-base font-medium">
          It looks like last week was lighter than planned.
        </p>
        <p className="text-base text-muted-foreground mt-1">
          {missedCount} sessions were scheduled but not completed. How are you
          feeling? If your body needs more recovery time, that&apos;s part of the
          process.
        </p>
      </div>

      <Button variant="outline" onClick={onDismiss}>
        Got it
      </Button>
    </div>
  );
}
