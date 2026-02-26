"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DayPlan } from "@/types/plan";

interface Props {
  day: DayPlan;
  cancerTypeFocus?: string;
}

const FOCUS_RATIONALES: Record<string, string> = {
  resistance:
    "Resistance training helps rebuild muscle mass lost during treatment, improves bone density (especially important for patients on hormone therapy), and combats cancer-related fatigue.",
  aerobic:
    "Aerobic exercise improves cardiovascular fitness, reduces fatigue, and has been shown to improve quality of life in cancer survivors.",
  flexibility:
    "Flexibility exercises help restore range of motion after surgery, reduce stiffness from radiation fibrosis, and promote relaxation.",
  balance:
    "Balance training reduces fall risk, which is especially important for survivors on treatments that affect bone density or cause neuropathy.",
  rest:
    "Rest days are essential for recovery. Your muscles repair and grow stronger during rest periods. Light walking or gentle stretching is fine if desired.",
  recovery:
    "Active recovery promotes blood flow to aid muscle repair without adding training stress. Keep intensity very low.",
  cardio:
    "Cardiovascular training builds endurance, supports heart health, and helps manage treatment-related fatigue.",
};

function getRationale(focus: string): string {
  const lower = focus.toLowerCase();
  for (const [key, rationale] of Object.entries(FOCUS_RATIONALES)) {
    if (lower.includes(key)) return rationale;
  }
  return "This workout is designed based on evidence-based guidelines for cancer survivors, targeting your specific needs and fitness level.";
}

export default function DaySummaryPanel({ day, cancerTypeFocus }: Props) {
  // Collect unique equipment
  const equipment = new Set<string>();
  day.main?.forEach((ex) => {
    if (ex.equipment && ex.equipment !== "—") equipment.add(ex.equipment);
  });

  // Estimate duration
  const warmupMin = day.warmup?.duration_min || 0;
  const cooldownMin = day.cooldown?.duration_min || 0;
  const mainMin = (day.main?.length || 0) * 4; // ~4 min per exercise
  const totalMin = warmupMin + mainMin + cooldownMin;

  return (
    <div className="space-y-4">
      {/* Focus */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Today&apos;s Focus</CardTitle>
            <Badge>{day.focus}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {getRationale(day.focus)}
          </p>
          {cancerTypeFocus && (
            <p className="text-xs text-muted-foreground mt-2">
              Tailored for:{" "}
              <span className="capitalize font-medium">
                {cancerTypeFocus}
              </span>{" "}
              cancer survivors
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Exercises
              </p>
              <p className="font-semibold text-lg">
                {day.main?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Est. Duration
              </p>
              <p className="font-semibold text-lg">
                {totalMin > 0 ? `~${totalMin} min` : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment needed */}
      {equipment.size > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Equipment Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(equipment).map((eq) => (
                <Badge key={eq} variant="outline">
                  {eq}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
