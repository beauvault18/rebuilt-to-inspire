"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  overrideCount: number;
  onAcceptDeload: () => void;
  onOverride: () => void;
}

const MESSAGES = [
  {
    heading: "Your body might benefit from a lighter week.",
    body: "Your recent check-ins suggest you\u2019ve been working through some discomfort. A recovery week isn\u2019t a step back \u2014 it\u2019s how your body consolidates the progress you\u2019ve made.",
  },
  {
    heading: "A recovery week could help you feel stronger.",
    body: "You\u2019ve been pushing through elevated pain or fatigue for a while now. Easing off for a few sessions gives your body the space to adapt and rebuild.",
  },
  {
    heading: "Your check-ins show a consistent pattern.",
    body: "Elevated pain and fatigue across multiple sessions is your body communicating clearly. A recovery week at this point typically leads to better performance in the weeks that follow.",
  },
];

export default function DeloadAdvisory({
  overrideCount,
  onAcceptDeload,
  onOverride,
}: Props) {
  const [acknowledged, setAcknowledged] = useState(false);

  const tier = Math.min(overrideCount, 2);
  const message = MESSAGES[tier];
  const requiresAck = overrideCount >= 2;

  return (
    <div className="bg-surface-card rounded-lg p-6 space-y-4">
      <div>
        <p className="text-base font-medium">{message.heading}</p>
        <p className="text-base text-muted-foreground mt-1">{message.body}</p>
      </div>

      {requiresAck && (
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 size-4 rounded border-surface-border accent-brand"
          />
          <span className="text-base text-muted-foreground">
            I\u2019ve noted this and want to continue at my current level.
          </span>
        </label>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onAcceptDeload}
          className="bg-brand text-brand-foreground hover:brightness-110"
        >
          Reduce Intensity This Week
        </Button>
        <Button
          variant="outline"
          onClick={onOverride}
          disabled={requiresAck && !acknowledged}
        >
          Continue As Planned
        </Button>
      </div>
    </div>
  );
}
