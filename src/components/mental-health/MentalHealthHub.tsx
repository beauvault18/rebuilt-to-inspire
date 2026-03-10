"use client";

/**
 * Adaptive Mental Health Intelligence
 *
 * Structural parity only.
 *
 * DO NOT:
 * - Auto-adjust journaling depth
 * - Increase check-in frequency automatically
 * - Escalate tone
 * - Infer psychological severity
 * - Suggest diagnosis
 * - Introduce urgency styling
 * - Create progress metrics
 *
 * Mental support must remain:
 * - Optional
 * - Additive
 * - Reversible
 * - Calm
 */

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone } from "lucide-react";
import SiteHeader from "@/components/shared/SiteHeader";
import MentalHealthDisplay from "./MentalHealthDisplay";

export default function MentalHealthHub() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Crisis Banner — always visible */}
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <Phone className="size-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">
              If you are in crisis, call or text{" "}
              <a
                href="tel:988"
                className="font-bold underline underline-offset-2"
              >
                988
              </a>{" "}
              (Suicide & Crisis Lifeline) or the Cancer Support Helpline at{" "}
              <a
                href="tel:1-888-939-3333"
                className="font-bold underline underline-offset-2"
              >
                1-888-939-3333
              </a>
              . This app is not a substitute for professional mental health
              care.
            </p>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Recovery & Resilience</h1>
            <div className="w-[120px]" />
          </div>

          {/* Main Display — 3-tab architecture */}
          <MentalHealthDisplay />
        </div>
      </div>
    </div>
  );
}
