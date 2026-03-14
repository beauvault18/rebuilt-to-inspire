"use client";

import { Shield, Sparkles } from "lucide-react";

export default function StepWelcome() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15] whitespace-nowrap">
          The more you share, the safer you train.
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
          Answer a few questions about your treatment history, recovery, goals,
          and preferences to build a program designed specifically for your
          journey.
        </p>
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface-elevated/60 p-7 space-y-5">
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <Sparkles key={i} className="size-4 text-amber-400" />
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold">
            Built for recovery, not just fitness
          </p>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Every recommendation factors in your cancer type, treatment side
            effects, and current energy levels. This is not a generic plan — it
            respects where you are and progresses safely as you rebuild.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-1 border-t border-surface-border">
          <div className="size-10 rounded-full bg-brand/15 flex items-center justify-center">
            <Shield className="size-5 text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold">Evidence-Based Engine</p>
            <p className="text-xs text-muted-foreground">
              Powered by peer-reviewed exercise oncology research
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
