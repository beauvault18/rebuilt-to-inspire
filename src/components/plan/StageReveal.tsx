"use client";

import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProgressionContext } from "@/types/plan";

interface Props {
  progressionContext: ProgressionContext;
  progressionStage: string;
  userName: string;
  onContinue: () => void;
}

export default function StageReveal({
  progressionContext,
  progressionStage,
  userName,
  onContinue,
}: Props) {
  const ctx = progressionContext;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-32">
      <div className="max-w-3xl w-full mx-auto text-center">
        {/* Stage badge */}
        <Badge className="bg-brand-muted text-brand border-0 rounded-full text-xs uppercase tracking-[0.08em] px-3 py-1">
          {progressionStage.replace(/_/g, " ")}
        </Badge>

        {/* Stage heading */}
        <div className="mt-8">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.05]">
            Stage {ctx.number}
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-brand mt-2 leading-[1.1]">
            {ctx.name}
          </h2>
          {userName && (
            <p className="text-lg text-muted-foreground mt-6">
              {userName}, here is your starting point.
            </p>
          )}
        </div>

        {/* Goal */}
        <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto mt-8">
          {ctx.goal}
        </p>

        {/* Progress track */}
        <div className="mt-16 max-w-md mx-auto">
          <div className="h-1 bg-surface-card rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-700"
              style={{
                width: `${Math.max((ctx.number / 5) * 100, 20)}%`,
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            <span>Reconditioning</span>
            <span>Advanced</span>
          </div>
        </div>

        {/* Details — surface panel, no border */}
        <div className="bg-surface-panel rounded-xl p-8 text-left mt-14 space-y-5">
          {/* Focus Areas */}
          {ctx.focus && ctx.focus.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Focus Areas
              </p>
              <div className="flex flex-wrap gap-2">
                {ctx.focus.map((f) => (
                  <Badge
                    key={f}
                    variant="secondary"
                    className="text-sm"
                  >
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-12">
            {/* Intensity Range */}
            {ctx.intensity_range && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Intensity
                </p>
                <p className="text-base">{ctx.intensity_range}</p>
              </div>
            )}

            {/* Typical Duration */}
            {ctx.typical_duration_weeks && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Duration
                </p>
                <p className="text-base">{ctx.typical_duration_weeks}</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14">
          <button
            onClick={onContinue}
            className="inline-flex items-center gap-2.5 bg-brand text-brand-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:brightness-110 hover:scale-[1.01] transition-all duration-200 cursor-pointer"
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            View Full Plan
            <ArrowRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
