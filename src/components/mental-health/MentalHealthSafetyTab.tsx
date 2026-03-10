"use client";

export default function MentalHealthSafetyTab() {
  return (
    <div className="space-y-8">
      {/* When to Reach Out — transparent */}
      <div>
        <h3 className="text-lg font-semibold">When to Reach Out</h3>
        <div className="mt-4 space-y-4">
          <p className="text-base text-muted-foreground">
            Recovery is not linear. There may be days or weeks that feel harder
            than others. Consider reaching out to your care team or a mental
            health professional if:
          </p>
          <ul className="list-disc list-inside text-base text-muted-foreground space-y-1">
            <li>Low mood persists for more than two weeks</li>
            <li>
              You notice changes in sleep, appetite, or motivation that concern
              you
            </li>
            <li>Anxiety or fear of recurrence feels unmanageable</li>
            <li>
              You feel disconnected from activities or people you used to enjoy
            </li>
          </ul>
        </div>
      </div>

      {/* Emotional Fatigue Notes — card */}
      <div className="bg-surface-card rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">Emotional Fatigue</h3>
        <p className="text-base text-muted-foreground">
          Emotional fatigue is common among cancer survivors. It can manifest as
          feeling overwhelmed, having difficulty concentrating, or experiencing a
          general sense of heaviness that doesn&apos;t lift with rest.
        </p>
        <p className="text-base text-muted-foreground">
          Unlike physical fatigue, emotional fatigue often requires different
          strategies — connection, creative expression, time in nature, or
          simply permission to do less.
        </p>
      </div>

      {/* Professional Support Resources — transparent */}
      <div>
        <h3 className="text-lg font-semibold">
          Professional Support Resources
        </h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-1">
            <p className="text-base font-medium">
              988 Suicide & Crisis Lifeline
            </p>
            <p className="text-base text-muted-foreground">
              Call or text 988 — available 24/7
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">Crisis Text Line</p>
            <p className="text-base text-muted-foreground">
              Text HOME to 741741
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">Cancer Support Helpline</p>
            <p className="text-base text-muted-foreground">1-888-939-3333</p>
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">CancerCare Counseling</p>
            <p className="text-base text-muted-foreground">
              Free professional counseling for cancer patients and survivors
            </p>
          </div>
        </div>
      </div>

      {/* Fallback note — card */}
      <div className="bg-surface-card rounded-lg p-6">
        <p className="text-base text-muted-foreground">
          No additional safety considerations are associated with this phase.
        </p>
      </div>
    </div>
  );
}
