"use client";

import { Button } from "@/components/ui/button";
import type { DayPlan } from "@/types/plan";

interface Props {
  days: DayPlan[];
  activeIndex: number;
  onSelectDay: (index: number) => void;
}

export default function DayNavigator({
  days,
  activeIndex,
  onSelectDay,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {days.map((day, i) => (
        <Button
          key={i}
          variant={i === activeIndex ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectDay(i)}
          className="shrink-0"
        >
          {day.day}
        </Button>
      ))}
    </div>
  );
}
