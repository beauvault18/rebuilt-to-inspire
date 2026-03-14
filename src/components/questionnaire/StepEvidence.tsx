"use client";

import { Activity, Heart, Brain, Shield } from "lucide-react";

const OUTCOMES = [
  {
    label: "Fatigue",
    detail: "Strong evidence for reduction",
    Icon: Activity,
  },
  {
    label: "Physical Function",
    detail: "Large effect on strength recovery",
    Icon: Heart,
  },
  {
    label: "Mental Health",
    detail: "Strong evidence for anxiety & mood",
    Icon: Brain,
  },
  {
    label: "Mortality Risk",
    detail: "~24% lower with regular exercise",
    Icon: Shield,
  },
];

export default function StepEvidence() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15]">
          Exercise is medicine in oncology.
        </h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-md">
          International roundtable guidelines confirm that structured exercise
          during and after treatment improves outcomes across every domain of
          recovery.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {OUTCOMES.map(({ label, detail, Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-surface-border bg-surface-elevated/60 p-5 space-y-3"
          >
            <Icon className="size-5 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-[15px] font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground leading-snug">
                {detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground/60 space-y-1">
        <p>
          Campbell, K. L., et al. (2019). <em>Med & Sci in Sports & Exercise</em>, 51(11).
        </p>
        <p>
          Schmitz, K. H., et al. (2019). <em>CA: A Cancer Journal for Clinicians</em>, 69(6).
        </p>
      </div>
    </div>
  );
}
