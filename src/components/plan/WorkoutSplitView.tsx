"use client";

import { useState } from "react";
import DayNavigator from "./DayNavigator";
import WorkoutTable from "./WorkoutTable";
import DaySummaryPanel from "./DaySummaryPanel";
import type { DayPlan } from "@/types/plan";

interface Props {
  days: DayPlan[];
  cancerTypeFocus?: string;
}

export default function WorkoutSplitView({ days, cancerTypeFocus }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDay = days[activeIndex];

  if (!activeDay) return null;

  return (
    <div className="space-y-4">
      <DayNavigator
        days={days}
        activeIndex={activeIndex}
        onSelectDay={setActiveIndex}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        <div className="min-w-0">
          <WorkoutTable day={activeDay} />
        </div>
        <div className="min-w-0">
          <DaySummaryPanel day={activeDay} cancerTypeFocus={cancerTypeFocus} />
        </div>
      </div>
    </div>
  );
}
