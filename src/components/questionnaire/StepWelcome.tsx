"use client";

import { Shield, Clock, Lock } from "lucide-react";

export default function StepWelcome() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Before We Begin</h2>
        <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
          This questionnaire builds your recovery profile — the foundation
          for structured, stage-appropriate exercise programming.
        </p>
      </div>

      <div className="rounded-lg border border-brand/20 bg-brand-muted/30 p-6 space-y-5">
        <div className="flex items-start gap-3">
          <Shield className="size-5 text-brand mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">What this system does</p>
            <p className="text-sm text-muted-foreground mt-1">
              Analyzes your cancer history, current symptoms, and fitness level
              to assign a progression stage and generate a safe, evidence-based
              exercise plan.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Lock className="size-5 text-brand mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Your data stays private</p>
            <p className="text-sm text-muted-foreground mt-1">
              All responses are stored locally in your browser. Nothing is saved
              to a server or shared with third parties.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="size-5 text-brand mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Estimated time: 3–5 minutes</p>
            <p className="text-sm text-muted-foreground mt-1">
              Seven sections covering your cancer history, medical details,
              symptoms, goals, and exercise preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
