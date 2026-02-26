"use client";

import DayCard from "./DayCard";
import type { DayPlan } from "@/types/plan";

interface Props {
  days: DayPlan[];
}

export default function WeeklySchedule({ days }: Props) {
  if (!days || days.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No weekly schedule available.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Weekly Schedule</h3>
      {days.map((day, i) => (
        <DayCard key={i} day={day} defaultOpen={i < 3} />
      ))}
    </div>
  );
}
