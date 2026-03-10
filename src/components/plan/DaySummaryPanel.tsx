"use client";

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
  const equipment = new Set<string>();
  day.main?.forEach((ex) => {
    if (ex.equipment && ex.equipment !== "—") equipment.add(ex.equipment);
  });

  const warmupMin = day.warmup?.duration_min || 0;
  const cooldownMin = day.cooldown?.duration_min || 0;
  const mainMin = (day.main?.length || 0) * 4;
  const totalMin = warmupMin + mainMin + cooldownMin;

  return (
    <div className="bg-surface-card rounded-lg p-5 space-y-4">
      {/* Focus */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-base font-semibold">Today&apos;s Focus</p>
          <Badge>{day.focus}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {getRationale(day.focus)}
        </p>
        {cancerTypeFocus && (
          <p className="text-xs text-muted-foreground mt-1">
            Tailored for:{" "}
            <span className="capitalize font-medium">{cancerTypeFocus}</span>{" "}
            cancer survivors
          </p>
        )}
      </div>

      {/* Stats + Equipment row */}
      <div className="flex items-center gap-6 pt-4 border-t border-surface-border/30">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Exercises
          </p>
          <p className="font-semibold text-lg">{day.main?.length || 0}</p>
        </div>
        {totalMin > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Duration
            </p>
            <p className="font-semibold text-lg">~{totalMin} min</p>
          </div>
        )}
        {equipment.size > 0 && (
          <div className="ml-auto flex flex-wrap gap-1.5">
            {Array.from(equipment).map((eq) => (
              <Badge key={eq} variant="outline" className="text-xs">
                {eq}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
