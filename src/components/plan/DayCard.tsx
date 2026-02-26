"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DayPlan } from "@/types/plan";

interface Props {
  day: DayPlan;
  defaultOpen?: boolean;
}

export default function DayCard({ day, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{day.day}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{day.focus}</Badge>
            <span className="text-xs text-muted-foreground">
              {open ? "Collapse" : "Expand"}
            </span>
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 pt-0">
          {/* Warmup */}
          {day.warmup && (
            <div>
              <h4 className="text-sm font-semibold mb-1">
                Warm-up ({day.warmup.duration_min} min)
              </h4>
              <ul className="text-sm space-y-1">
                {day.warmup.exercises?.map((ex, i) => (
                  <li key={i} className="text-muted-foreground">
                    {ex.name} — {ex.duration_or_reps}
                    {ex.notes && (
                      <span className="text-xs"> ({ex.notes})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main exercises */}
          {day.main && day.main.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Main Exercises</h4>
              <div className="space-y-2">
                {day.main.map((ex, i) => (
                  <div
                    key={i}
                    className="text-sm border rounded-md p-3 space-y-1"
                  >
                    <div className="font-medium">{ex.name}</div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                      {ex.sets && <span>Sets: {ex.sets}</span>}
                      <span>{ex.reps_or_duration}</span>
                      {ex.intensity && <span>Intensity: {ex.intensity}</span>}
                      {ex.equipment && <span>Equipment: {ex.equipment}</span>}
                    </div>
                    {ex.modification && (
                      <p className="text-xs text-blue-400">
                        Modification: {ex.modification}
                      </p>
                    )}
                    {ex.precaution && (
                      <p className="text-xs text-yellow-400">
                        Precaution: {ex.precaution}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cooldown */}
          {day.cooldown && (
            <div>
              <h4 className="text-sm font-semibold mb-1">
                Cool-down ({day.cooldown.duration_min} min)
              </h4>
              <ul className="text-sm space-y-1">
                {day.cooldown.exercises?.map((ex, i) => (
                  <li key={i} className="text-muted-foreground">
                    {ex.name} — {ex.duration_or_reps}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cancer-specific components */}
          {day.cancer_specific_components &&
            day.cancer_specific_components.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-1">
                  Cancer-Specific Components
                </h4>
                <ul className="text-sm space-y-1">
                  {day.cancer_specific_components.map((ex, i) => (
                    <li key={i} className="text-muted-foreground">
                      {ex.name} — {ex.duration_or_reps}
                      {ex.notes && (
                        <span className="text-xs"> ({ex.notes})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </CardContent>
      )}
    </Card>
  );
}
