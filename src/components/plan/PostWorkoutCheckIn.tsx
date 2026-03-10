"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import type { PostWorkoutCheckIn as CheckInData } from "@/types/workout";
import { ENERGY_LABELS, PAIN_LABELS, FATIGUE_LABELS } from "@/types/workout";

interface Props {
  onSubmit: (checkIn: CheckInData) => void;
  onSkip: () => void;
}

export default function PostWorkoutCheckIn({ onSubmit, onSkip }: Props) {
  const [energy, setEnergy] = useState(3);
  const [pain, setPain] = useState(1);
  const [fatigue, setFatigue] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (submitting) return;
    setSubmitting(true);
    onSubmit({ energy, pain, fatigue });
  };

  return (
    <div className="max-w-lg mx-auto py-12 space-y-10">
      {/* Completion message */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Nice work today.</h2>
        <p className="text-base text-muted-foreground">
          Quick check — how does your body feel?
        </p>
      </div>

      {/* Sliders */}
      <div className="space-y-8">
        {/* Energy */}
        <div className="space-y-2">
          <div className="flex justify-between text-base">
            <span className="font-medium">Energy</span>
            <Badge variant="outline">{ENERGY_LABELS[energy]}</Badge>
          </div>
          <Slider
            value={[energy]}
            onValueChange={(v) => setEnergy(v[0])}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Exhausted</span>
            <span>High</span>
          </div>
        </div>

        {/* Pain */}
        <div className="space-y-2">
          <div className="flex justify-between text-base">
            <span className="font-medium">Pain</span>
            <Badge variant="outline">{PAIN_LABELS[pain]}</Badge>
          </div>
          <Slider
            value={[pain]}
            onValueChange={(v) => setPain(v[0])}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>None</span>
            <span>Severe</span>
          </div>
        </div>

        {/* Fatigue */}
        <div className="space-y-2">
          <div className="flex justify-between text-base">
            <span className="font-medium">Fatigue</span>
            <Badge variant="outline">{FATIGUE_LABELS[fatigue]}</Badge>
          </div>
          <Slider
            value={[fatigue]}
            onValueChange={(v) => setFatigue(v[0])}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>None</span>
            <span>Overwhelming</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 rounded-lg text-lg font-semibold bg-brand text-brand-foreground hover:brightness-110 transition-all duration-200 cursor-pointer disabled:opacity-50"
          style={{
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          Save & Continue
        </button>
        <button
          onClick={onSkip}
          className="w-full py-2 text-base text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer transition-colors"
        >
          Skip for now
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Takes about 30 seconds
        </p>
      </div>
    </div>
  );
}
