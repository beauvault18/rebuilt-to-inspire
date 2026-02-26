"use client";

import { Flame } from "lucide-react";
import type { SnackSuggestion } from "@/types/nutrition";

interface Props {
  snack: SnackSuggestion;
}

export default function SnackCard({ snack }: Props) {
  return (
    <div className="p-4 rounded-lg border border-border/50 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">{snack.name}</h4>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Flame className="size-3" />
          {snack.calories} cal
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{snack.description}</p>
      <p className="text-xs text-orange-400/80 italic">{snack.cancer_benefit}</p>
    </div>
  );
}
