"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { NutritionQuestionnaireData } from "@/types/nutrition";

interface Props {
  data: NutritionQuestionnaireData;
  addToList: (field: keyof NutritionQuestionnaireData, value: string) => void;
  removeFromList: (field: keyof NutritionQuestionnaireData, value: string) => void;
}

export default function StepDislikedFoods({ data, addToList, removeFromList }: Props) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !data.disliked_foods.includes(trimmed)) {
      addToList("disliked_foods", trimmed);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Foods You Don&apos;t Like</h2>
      <p className="text-base text-muted-foreground">
        Type any foods you want to avoid and press Enter. We won&apos;t include them
        in your plan.
      </p>

      <div className="space-y-3">
        <Label htmlFor="disliked-input" className="text-base">
          Add foods you dislike
        </Label>
        <div className="flex gap-2">
          <Input
            id="disliked-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. broccoli, mushrooms, tofu..."
            className="h-11 text-base"
          />
          <Button type="button" variant="outline" onClick={handleAdd} className="h-11">
            Add
          </Button>
        </div>
      </div>

      {data.disliked_foods.length > 0 && (
        <div className="space-y-2">
          <Label className="text-base text-muted-foreground">
            Foods to avoid ({data.disliked_foods.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {data.disliked_foods.map((food) => (
              <Badge
                key={food}
                variant="secondary"
                className="text-sm py-1.5 px-3 gap-1.5"
              >
                {food}
                <button
                  type="button"
                  onClick={() => removeFromList("disliked_foods", food)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {data.disliked_foods.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No disliked foods added yet. Skip this step if you eat everything!
        </p>
      )}
    </div>
  );
}
