"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider"; // used by Session Duration
import {
  ACTIVITY_LEVELS,
  PRE_DIAGNOSIS_ACTIVITIES,
  EQUIPMENT_OPTIONS,
  PREFERRED_ACTIVITIES,
} from "@/lib/constants";
import type { QuestionnaireData } from "@/types/questionnaire";

interface Props {
  data: QuestionnaireData;
  setField: (field: keyof QuestionnaireData, value: unknown) => void;
  toggleInList: (field: keyof QuestionnaireData, value: string) => void;
}

export default function StepExercisePrefs({
  data,
  setField,
  toggleInList,
}: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Exercise Preferences</h2>

      {/* Pre-Diagnosis Activity Level */}
      <div className="space-y-3">
        <Label className="text-base">Activity Level Before Diagnosis</Label>
        <p className="text-sm text-muted-foreground">
          How active were you before your cancer diagnosis?
        </p>
        <RadioGroup
          value={data.pre_diagnosis_activity}
          onValueChange={(v) => setField("pre_diagnosis_activity", v)}
          className="space-y-2"
        >
          {PRE_DIAGNOSIS_ACTIVITIES.map((al) => (
            <div key={al.value} className="flex items-center gap-2">
              <RadioGroupItem
                value={al.value}
                id={`prediag-${al.value}`}
              />
              <Label
                htmlFor={`prediag-${al.value}`}
                className="cursor-pointer"
              >
                {al.label}{" "}
                <span className="text-xs text-muted-foreground">
                  — {al.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-base">Current Activity Level</Label>
        <RadioGroup
          value={data.current_activity_level}
          onValueChange={(v) => setField("current_activity_level", v)}
          className="space-y-2"
        >
          {ACTIVITY_LEVELS.map((al) => (
            <div key={al.value} className="flex items-center gap-2">
              <RadioGroupItem
                value={al.value}
                id={`activity-${al.value}`}
              />
              <Label
                htmlFor={`activity-${al.value}`}
                className="cursor-pointer"
              >
                {al.label}{" "}
                <span className="text-xs text-muted-foreground">
                  — {al.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label htmlFor="minsSession" className="text-base">Current Minutes of Exercise Per Session</Label>
        <Input
          id="minsSession"
          type="number"
          min={0}
          value={data.minutes_per_week_current || ""}
          onChange={(e) =>
            setField("minutes_per_week_current", parseInt(e.target.value) || 0)
          }
          placeholder="e.g. 30"
          className="h-11 text-base"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-base">Equipment Access (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-3">
          {EQUIPMENT_OPTIONS.map((eq) => (
            <div key={eq.value} className="flex items-center gap-2">
              <Checkbox
                id={`equip-${eq.value}`}
                checked={data.equipment_access.includes(eq.value)}
                onCheckedChange={() =>
                  toggleInList("equipment_access", eq.value)
                }
              />
              <Label
                htmlFor={`equip-${eq.value}`}
                className="text-base cursor-pointer"
              >
                {eq.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base">Preferred Activities (select all that interest you)</Label>
        <div className="grid grid-cols-2 gap-3">
          {PREFERRED_ACTIVITIES.map((activity) => (
            <div key={activity} className="flex items-center gap-2">
              <Checkbox
                id={`pref-${activity}`}
                checked={data.preferred_activities.includes(
                  activity.toLowerCase().replace(/ /g, "_"),
                )}
                onCheckedChange={() =>
                  toggleInList(
                    "preferred_activities",
                    activity.toLowerCase().replace(/ /g, "_"),
                  )
                }
              />
              <Label
                htmlFor={`pref-${activity}`}
                className="text-base cursor-pointer"
              >
                {activity}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base">Days Available Per Week</Label>
        <RadioGroup
          value={String(data.days_available)}
          onValueChange={(v) => setField("days_available", parseInt(v))}
          className="flex flex-wrap gap-3"
        >
          {[
            { value: "2", label: "1–2 days" },
            { value: "3", label: "2–3 days" },
            { value: "4", label: "3–4 days" },
            { value: "5", label: "4–5 days" },
            { value: "6", label: "5–6 days" },
            { value: "7", label: "6–7 days" },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center gap-1.5">
              <RadioGroupItem value={opt.value} id={`days-${opt.value}`} />
              <Label
                htmlFor={`days-${opt.value}`}
                className="text-base cursor-pointer"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-base">
          Session Duration:{" "}
          <span className="font-bold">{data.session_duration_preference} min</span>
        </Label>
        <Slider
          value={[data.session_duration_preference]}
          onValueChange={(v) => setField("session_duration_preference", v[0])}
          min={10}
          max={90}
          step={5}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>10 min</span>
          <span>90 min</span>
        </div>
      </div>
    </div>
  );
}
