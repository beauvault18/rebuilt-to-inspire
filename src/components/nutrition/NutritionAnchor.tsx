"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import type { MealDay } from "@/types/nutrition";

interface Props {
  treatmentPhase?: string;
  days: MealDay[];
  activeIndex: number;
  onSelectDay: (index: number) => void;
}

export default function NutritionAnchor({
  treatmentPhase,
  days,
  activeIndex,
  onSelectDay,
}: Props) {
  const router = useRouter();

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

        <h1 className="text-2xl font-bold">Your Fueling Plan</h1>

        {treatmentPhase && (
          <div className="mt-2">
            <Badge className="bg-brand-muted text-brand border-0 rounded-full tracking-[0.08em] px-3 py-1 capitalize">
              {treatmentPhase.replace(/_/g, " ")}
            </Badge>
          </div>
        )}
      </div>

      {days.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {days.map((day, i) => (
            <button
              key={day.day}
              onClick={() => onSelectDay(i)}
              className={`px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 cursor-pointer ${
                i === activeIndex
                  ? "bg-surface-panel text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {day.day}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
