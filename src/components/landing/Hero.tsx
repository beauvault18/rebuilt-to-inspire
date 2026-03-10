"use client";

import { ArrowRight, Shield, BarChart3, Layers } from "lucide-react";

interface HeroProps {
  onStart: () => void;
}

const USE_CASES = [
  {
    title: "Recently Finished Treatment",
    description: "Rebuild from wherever you are — safely, methodically.",
  },
  {
    title: "Months Into Recovery",
    description: "Structure your next phase with stage-appropriate programming.",
  },
  {
    title: "Former Athlete Rebuilding",
    description: "Return to performance without skipping the foundation.",
  },
  {
    title: "Managing Ongoing Symptoms",
    description: "Fatigue, neuropathy, pain — your plan adapts to what you're feeling.",
  },
  {
    title: "On Active Hormone Therapy",
    description: "Counteract side effects with targeted exercise protocols.",
  },
  {
    title: "Multiple Cancer Types",
    description: "Breast, colorectal, prostate, lung, thyroid, testicular — all supported.",
  },
];

export default function Hero({ onStart }: HeroProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Section 1 — Hero */}
      <section className="min-h-[85vh] flex items-center justify-center px-6 py-24 border-b border-white/5">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-sm font-semibold tracking-widest uppercase text-brand">
                Cancer Recovery System
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Structured Recovery.{" "}
                <span className="text-brand">Measurable Strength.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Evidence-based exercise programming built from your cancer history,
                current symptoms, and recovery stage. Not generic fitness —
                structured rehabilitation.
              </p>
            </div>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2.5 bg-brand text-brand-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:brightness-110 hover:scale-[1.01] transition-all duration-200 cursor-pointer"
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              Build Your Recovery Profile
              <ArrowRight className="size-5" />
            </button>
          </div>

          {/* Right — Gradient Orb */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full bg-brand/25 blur-3xl" />
              <div className="absolute inset-4 rounded-full bg-brand/12 blur-2xl" />
              <div className="absolute inset-10 rounded-full bg-brand/35 blur-xl" />
              <div className="absolute inset-14 rounded-full border border-brand/20" />
              <div className="absolute inset-20 rounded-full border border-brand/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — How It Works */}
      <section className="border-t border-border px-6 py-24">
        <div className="max-w-5xl mx-auto space-y-16">
          <h2 className="text-3xl font-bold text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: 1,
                icon: Shield,
                title: "Recovery Profile",
                description:
                  "Answer questions about your cancer history, treatment timeline, current symptoms, and fitness background. Your data stays in your browser.",
              },
              {
                step: 2,
                icon: Layers,
                title: "Safety Structure",
                description:
                  "The system assigns your progression stage, applies safety gates for bone metastases, lymphedema, neuropathy, and treatment side effects.",
              },
              {
                step: 3,
                icon: BarChart3,
                title: "Stage-Based Rebuild",
                description:
                  "Receive a structured weekly plan with warm-ups, main exercises, cool-downs, and cancer-specific components — all matched to your stage.",
              },
            ].map((item) => (
              <div key={item.step} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-brand font-bold text-sm">
                    {item.step}
                  </div>
                  <item.icon className="size-5 text-brand/60" />
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Built from peer-reviewed exercise oncology research.
          </p>
        </div>
      </section>

      {/* Section 3 — Who This System Is For */}
      <section className="border-t border-border px-6 py-24">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="text-3xl font-bold text-center">
            Who This System Is For
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="border border-border bg-card/50 rounded-lg p-5 space-y-2"
              >
                <h3 className="font-semibold">{uc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {uc.description}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="flex justify-center pt-8">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2.5 bg-brand text-brand-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:brightness-110 hover:scale-[1.01] transition-all duration-200 cursor-pointer"
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              Build Your Recovery Profile
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
