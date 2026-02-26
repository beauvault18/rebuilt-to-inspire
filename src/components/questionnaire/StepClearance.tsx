"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { QuestionnaireData } from "@/types/questionnaire";

interface Props {
  data: QuestionnaireData;
  setField: (field: keyof QuestionnaireData, value: unknown) => void;
  addToList: (field: keyof QuestionnaireData, value: string) => void;
  removeFromList: (field: keyof QuestionnaireData, value: string) => void;
}

export default function StepClearance({
  data,
  setField,
  addToList,
  removeFromList,
}: Props) {
  const [restriction, setRestriction] = useState("");

  const handleAddRestriction = () => {
    const trimmed = restriction.trim();
    if (trimmed) {
      addToList("clinician_restrictions", trimmed);
      setRestriction("");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Clinician Clearance</h2>

      <div className="flex items-start gap-3 p-5 rounded-lg border bg-card">
        <Checkbox
          id="clearance"
          checked={data.clinician_clearance}
          onCheckedChange={(v) => setField("clinician_clearance", !!v)}
          className="size-5 mt-0.5"
        />
        <div>
          <Label htmlFor="clearance" className="cursor-pointer font-medium text-base">
            I have been cleared for exercise by my doctor or oncologist
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            This tool is designed for individuals who have received medical
            clearance to exercise. Please consult your care team before
            proceeding.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base">
          Clinician Restrictions{" "}
          <span className="text-muted-foreground text-sm">(optional)</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Add any specific restrictions from your doctor.
        </p>
        <div className="flex gap-2">
          <Input
            value={restriction}
            onChange={(e) => setRestriction(e.target.value)}
            placeholder="e.g. No overhead lifting"
            className="h-11 text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddRestriction();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddRestriction}
            disabled={!restriction.trim()}
          >
            Add
          </Button>
        </div>
        {data.clinician_restrictions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.clinician_restrictions.map((r) => (
              <Badge
                key={r}
                variant="secondary"
                className="cursor-pointer"
                onClick={() =>
                  removeFromList("clinician_restrictions", r)
                }
              >
                {r} &times;
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
