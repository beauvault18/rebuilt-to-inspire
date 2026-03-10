"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  X,
  Sparkles,
  Dumbbell,
  UtensilsCrossed,
  Brain,
  MessageCircle,
} from "lucide-react";

interface TourStep {
  targetId: string | null;
  icon: React.ReactNode;
  title: string;
  body: string;
  dimIds: string[];
}

const ALL_CARD_IDS = ["tour-fitness", "tour-nutrition", "tour-mental-health", "tour-chat"];

function buildSteps(trainerName: string, firstName: string): TourStep[] {
  return [
    {
      targetId: null,
      icon: <Sparkles className="size-10 text-brand" />,
      title: `Hey ${firstName}, welcome to Rebuilt To Inspire`,
      body: `My name is ${trainerName}, and I'll be your AI companion on your rebuilding journey. I'm here to guide you through personalized fitness, nutrition, and mental wellness, all built around your recovery. Let me show you how everything works.`,
      dimIds: [],
    },
    {
      targetId: "tour-fitness",
      icon: <Dumbbell className="size-10 text-brand" />,
      title: "Your Fitness Plan",
      body: "This is where your exercise programming lives. You'll start by filling out a short questionnaire about your treatment history, current fitness level, and goals. From there, I'll build a stage appropriate workout plan that progresses safely with your recovery.",
      dimIds: ["tour-nutrition", "tour-mental-health", "tour-chat"],
    },
    {
      targetId: "tour-nutrition",
      icon: <UtensilsCrossed className="size-10 text-brand" />,
      title: "Your Nutrition Plan",
      body: "Fueling your recovery matters just as much as movement. Answer a few questions about your dietary needs, side effects, and preferences, and I'll create a structured meal plan designed to support your energy, healing, and overall health.",
      dimIds: ["tour-fitness", "tour-mental-health", "tour-chat"],
    },
    {
      targetId: "tour-mental-health",
      icon: <Brain className="size-10 text-purple-400" />,
      title: "Recovery and Resilience",
      body: "Recovery is not just physical, it is mental too. This is your space to track your mood, write journal entries, practice guided breathwork, and build coping strategies. Small daily check ins make a big difference over time.",
      dimIds: ["tour-fitness", "tour-nutrition", "tour-chat"],
    },
    {
      targetId: "tour-chat",
      icon: <MessageCircle className="size-10 text-sky-400" />,
      title: `Chat with ${trainerName}`,
      body: `Have a question about your workout? Not sure what to eat today? Just want to check in? You can talk to me anytime right here. I know your plan, your recovery history, and your goals, so every answer is built around you.`,
      dimIds: ["tour-fitness", "tour-nutrition", "tour-mental-health"],
    },
  ];
}

export default function DashboardTour({
  trainerName,
  firstName,
  onComplete,
}: {
  trainerName: string;
  firstName: string;
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetBox, setTargetBox] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const steps = buildSteps(trainerName, firstName);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const measure = useCallback(() => {
    if (!step.targetId) {
      setTargetBox(null);
      return;
    }
    const el = document.getElementById(step.targetId);
    if (el) {
      const r = el.getBoundingClientRect();
      setTargetBox({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [step.targetId]);

  // Dim/undim cards based on current step
  useEffect(() => {
    // Reset all cards first
    ALL_CARD_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.transition = "opacity 0.4s ease, filter 0.4s ease";
        if (step.dimIds.includes(id)) {
          el.style.opacity = "0.15";
          el.style.filter = "blur(1px)";
        } else {
          el.style.opacity = "1";
          el.style.filter = "none";
        }
      }
    });

    return () => {
      // Restore all on unmount
      ALL_CARD_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.style.opacity = "1";
          el.style.filter = "none";
        }
      });
    };
  }, [step.dimIds]);

  useEffect(() => {
    const t = setTimeout(measure, 300);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure]);

  const next = () => {
    if (isLast) onComplete();
    else setCurrentStep((s) => s + 1);
  };

  const isCentered = !targetBox;

  return (
    <>
      {/* Light scrim for welcome step only, no backdrop for card steps */}
      {isCentered && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50000,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        />
      )}

      {/* Highlight ring on active card */}
      {targetBox && (
        <div
          style={{
            position: "fixed",
            zIndex: 50001,
            top: targetBox.top - 16,
            left: targetBox.left - 16,
            width: targetBox.width + 32,
            height: targetBox.height + 32,
            borderRadius: 20,
            border: "2px solid #34d399",
            boxShadow: "0 0 40px rgba(52,211,153,0.12)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tour Card */}
      <div
        style={{
          position: "fixed",
          zIndex: 50002,
          ...(isCentered
            ? {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }
            : {
                top: Math.min(
                  targetBox!.top + targetBox!.height + 32,
                  window.innerHeight - 380
                ),
                left: "50%",
                transform: "translateX(-50%)",
              }),
          width: isCentered ? 580 : 540,
        }}
      >
        <div
          style={{
            background: "linear-gradient(145deg, #1e293b 0%, #1a2332 100%)",
            border: "1px solid rgba(52,211,153,0.25)",
            borderRadius: 20,
            padding: isCentered ? 48 : 40,
            color: "#f1f5f9",
            boxShadow:
              "0 0 80px rgba(52,211,153,0.08), 0 32px 64px rgba(0,0,0,0.4)",
          }}
        >
          {/* Close */}
          <button
            onClick={onComplete}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              background: "none",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X className="size-5" />
          </button>

          {/* Icon */}
          <div
            style={{
              width: isCentered ? 76 : 68,
              height: isCentered ? 76 : 68,
              borderRadius: 18,
              background: "rgba(52,211,153,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: isCentered ? 28 : 24,
            }}
          >
            {step.icon}
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: isCentered ? 30 : 26,
              fontWeight: 700,
              lineHeight: 1.25,
              color: "#ffffff",
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}
          >
            {step.title}
          </h2>

          {/* Step indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: isCentered ? 28 : 24,
            }}
          >
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentStep ? 28 : 8,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor:
                    i === currentStep
                      ? "#34d399"
                      : i < currentStep
                        ? "rgba(52,211,153,0.4)"
                        : "rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Body */}
          <p
            style={{
              fontSize: isCentered ? 18 : 17,
              lineHeight: 1.75,
              color: "#94a3b8",
              margin: "0 0 36px",
            }}
          >
            {step.body}
          </p>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={onComplete}
              style={{
                background: "none",
                border: "none",
                color: "#475569",
                fontSize: 14,
                cursor: "pointer",
                padding: "8px 0",
              }}
            >
              Skip tour
            </button>
            <Button
              onClick={next}
              className="h-12 px-8 text-sm font-semibold cursor-pointer bg-brand hover:bg-brand/90"
            >
              {isLast ? (
                "Get Started"
              ) : (
                <span className="flex items-center gap-2">
                  Next <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
