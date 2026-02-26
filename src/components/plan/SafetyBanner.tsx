"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { ExercisePlan } from "@/types/plan";

interface Props {
  plan: ExercisePlan;
  topLevelFlags: string[];
  topLevelTriggers: string[];
}

export default function SafetyBanner({
  plan,
  topLevelFlags,
  topLevelTriggers,
}: Props) {
  const [showDisclaimers, setShowDisclaimers] = useState(true);

  const referralTriggers = [
    ...new Set([
      ...(plan.referral_triggers || []),
      ...topLevelTriggers,
    ]),
  ];
  const safetyFlags = [
    ...new Set([...(plan.safety_flags || []), ...topLevelFlags]),
  ];
  const disclaimers = plan.disclaimers || [];

  return (
    <div className="space-y-3">
      {referralTriggers.length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-destructive mb-2">
              Referral Recommended
            </h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {referralTriggers.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {safetyFlags.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
              Safety Considerations
            </h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {safetyFlags.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {disclaimers.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <button
              onClick={() => setShowDisclaimers(!showDisclaimers)}
              className="font-semibold text-sm w-full text-left flex justify-between items-center cursor-pointer"
            >
              Important Disclaimers
              <span className="text-xs">{showDisclaimers ? "Hide" : "Show"}</span>
            </button>
            {showDisclaimers && (
              <ul className="list-disc list-inside text-xs text-muted-foreground mt-2 space-y-1">
                {disclaimers.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
