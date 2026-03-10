"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  APPETITE_LABELS,
  ENERGY_LABELS,
  GI_LABELS,
} from "@/types/nutrition-checkin";
import type { NutritionCheckIn, WeightTrend } from "@/types/nutrition-checkin";

interface Props {
  open: boolean;
  onSubmit: (entry: NutritionCheckIn) => void;
  onClose: () => void;
}

const WEIGHT_OPTIONS: { id: WeightTrend; label: string }[] = [
  { id: "stable", label: "Stable" },
  { id: "slightly_down", label: "Slightly down" },
  { id: "significantly_down", label: "Significantly down" },
  { id: "up", label: "Up" },
];

export default function NutritionReflectionModal({
  open,
  onSubmit,
  onClose,
}: Props) {
  const [appetite, setAppetite] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [gi, setGi] = useState(3);
  const [weightTrend, setWeightTrend] = useState<WeightTrend | null>(null);
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (submitting) return;
    setSubmitting(true);
    const entry: NutritionCheckIn = {
      date: new Date().toISOString().split("T")[0],
      appetite,
      energy,
      gi,
      ...(weightTrend ? { weightTrend } : {}),
    };
    onSubmit(entry);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? "bg-black/50" : "bg-black/0"
      }`}
      style={{
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-surface-panel rounded-xl p-8 space-y-10 max-w-md w-full transition-all duration-300 ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div>
          <h2 className="text-xl font-semibold">Weekly Fueling Reflection</h2>
          <p className="text-base text-muted-foreground mt-1">
            How has your body been responding this week?
          </p>
        </div>

        {/* Sliders */}
        <div className="space-y-8">
          {/* Appetite */}
          <div className="space-y-2">
            <div className="flex justify-between text-base">
              <span className="font-medium">Appetite</span>
              <Badge variant="outline">{APPETITE_LABELS[appetite]}</Badge>
            </div>
            <Slider
              value={[appetite]}
              onValueChange={(v) => setAppetite(v[0])}
              min={1}
              max={5}
              step={1}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Low</span>
              <span>Strong</span>
            </div>
          </div>

          {/* Energy */}
          <div className="space-y-2">
            <div className="flex justify-between text-base">
              <span className="font-medium">Energy Levels</span>
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

          {/* Digestive Comfort */}
          <div className="space-y-2">
            <div className="flex justify-between text-base">
              <span className="font-medium">Digestive Comfort</span>
              <Badge variant="outline">{GI_LABELS[gi]}</Badge>
            </div>
            <Slider
              value={[gi]}
              onValueChange={(v) => setGi(v[0])}
              min={1}
              max={5}
              step={1}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Significant issues</span>
              <span>Comfortable</span>
            </div>
          </div>

          {/* Weight Trend — Optional */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium">Weight Trend</span>
              <span className="text-sm text-muted-foreground">(optional)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {WEIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setWeightTrend(weightTrend === opt.id ? null : opt.id)
                  }
                  className={`px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 cursor-pointer ${
                    weightTrend === opt.id
                      ? "bg-surface-card text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{
                    transitionTimingFunction:
                      "cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-brand text-brand-foreground hover:brightness-110 disabled:opacity-50"
          >
            Save Reflection
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
