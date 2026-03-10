"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import DayNavigator from "./DayNavigator";
import type { DayPlan, ProgressionContext } from "@/types/plan";

interface Props {
  userName?: string;
  progressionContext?: ProgressionContext;
  progressionStage?: string;
  weekNumber: number;
  days: DayPlan[];
  activeIndex: number;
  onSelectDay: (index: number) => void;
}

export default function PlanAnchor({
  userName,
  progressionContext,
  progressionStage,
  weekNumber,
  days,
  activeIndex,
  onSelectDay,
}: Props) {
  const router = useRouter();
  const ctx = progressionContext;

  const durationWeeks = ctx?.typical_duration_weeks
    ? parseInt(ctx.typical_duration_weeks, 10) || 4
    : 4;

  return (
    <div className="space-y-5">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="gap-2 -ml-2 mb-2"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Button>

        <h1 className="text-2xl font-bold">
          {userName ? `${userName}\u2019s Recovery Plan` : "Your Recovery Plan"}
        </h1>

        <div className="flex items-center gap-3 mt-2">
          {progressionStage && (
            <Badge className="bg-brand-muted text-brand border-0 rounded-full text-xs tracking-[0.08em] px-3 py-1 capitalize">
              {progressionStage.replace(/_/g, " ")}
            </Badge>
          )}
          <span className="text-base text-muted-foreground">
            Week {Math.min(weekNumber, durationWeeks)} of {durationWeeks}
          </span>
        </div>

        {ctx?.goal && (
          <p className="text-base text-muted-foreground mt-2 line-clamp-1">
            {ctx.goal}
          </p>
        )}
      </div>

      {days.length > 0 && (
        <DayNavigator
          days={days}
          activeIndex={activeIndex}
          onSelectDay={onSelectDay}
        />
      )}
    </div>
  );
}
