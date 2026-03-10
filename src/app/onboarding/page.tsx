"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import { CANCER_TYPES } from "@/lib/constants";
import {
  Heart,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shuffle,
  User,
  Cake,
  Ribbon,
  CalendarDays,
} from "lucide-react";

const MALE_NAMES = [
  "Atlas", "Coach", "Phoenix", "Titan", "Rex", "Maverick",
  "Apollo", "Blaze", "Knox", "Ace", "Sterling", "Roman",
];
const FEMALE_NAMES = [
  "Sage", "Nova", "Luna", "Athena", "Ivy", "Aurora",
  "Ember", "Wren", "Zara", "Stella", "Freya", "Aria",
];

function pickRandom(list: string[]) {
  return list[Math.floor(Math.random() * list.length)];
}

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { profile } = useAuth();

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [birthday, setBirthday] = useState("");
  const [cancerType, setCancerType] = useState("");
  const [diagnosisDate, setDiagnosisDate] = useState("");
  const [remissionDate, setRemissionDate] = useState("");
  const [trainerName, setTrainerName] = useState("");
  const [saving, setSaving] = useState(false);

  const canAdvance = useCallback(() => {
    switch (step) {
      case 1:
        return firstName.trim() && lastName.trim();
      case 2:
        return birthday;
      case 3:
        return cancerType;
      case 4:
        return diagnosisDate;
      case 5:
        return true;
      default:
        return false;
    }
  }, [step, firstName, lastName, birthday, cancerType, diagnosisDate]);

  const next = () => {
    if (canAdvance() && step < TOTAL_STEPS) setStep(step + 1);
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    setSaving(true);

    const userProfile = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      birthday,
      cancer_type: cancerType,
      diagnosis_date: diagnosisDate,
      remission_date: remissionDate || null,
      trainer_name: trainerName.trim() || "Coach",
      completed_at: new Date().toISOString(),
    };

    localStorage.setItem("rti_user_profile", JSON.stringify(userProfile));
    localStorage.setItem("rti_onboarding_complete", "true");
    localStorage.setItem("rti_show_tour", "true");

    router.push("/dashboard");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canAdvance()) {
      e.preventDefault();
      if (step < TOTAL_STEPS) next();
      else handleFinish();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="px-8 py-5 border-b border-border">
        <span className="text-xl font-bold tracking-tight">
          Rebuilt To Inspire
        </span>
      </header>

      {/* Progress bar */}
      <div className="w-full bg-muted/30">
        <div
          className="h-1 bg-brand transition-all duration-500 ease-out"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl" onKeyDown={handleKeyDown}>
          {/* Step 1 — Name */}
          {step === 1 && (
            <StepShell
              icon={<User className="size-8 text-brand" />}
              title="What's your name?"
              subtitle="We'll use this to personalize your experience."
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    First Name
                  </label>
                  <Input
                    autoFocus
                    className="h-14 text-lg px-5"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <Input
                    className="h-14 text-lg px-5"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </StepShell>
          )}

          {/* Step 2 — Birthday */}
          {step === 2 && (
            <StepShell
              icon={<Cake className="size-8 text-brand" />}
              title={`Nice to meet you, ${firstName}.`}
              subtitle="When's your birthday?"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Date of Birth
                </label>
                <Input
                  autoFocus
                  type="date"
                  className="h-14 text-lg px-5"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </div>
            </StepShell>
          )}

          {/* Step 3 — Cancer Type */}
          {step === 3 && (
            <StepShell
              icon={<Ribbon className="size-8 text-brand" />}
              title="What type of cancer were you diagnosed with?"
              subtitle="This helps us tailor your recovery plan."
            >
              <div className="grid grid-cols-2 gap-3">
                {CANCER_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => setCancerType(ct.value)}
                    className={`
                      h-16 rounded-xl border-2 text-lg font-medium transition-all duration-200 cursor-pointer
                      ${
                        cancerType === ct.value
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-surface-border bg-surface-card hover:border-muted-foreground/30 hover:bg-surface-elevated text-foreground"
                      }
                    `}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </StepShell>
          )}

          {/* Step 4 — Timeline */}
          {step === 4 && (
            <StepShell
              icon={<CalendarDays className="size-8 text-brand" />}
              title="Your cancer timeline"
              subtitle="When were you diagnosed, and have you reached remission?"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Date Diagnosed
                  </label>
                  <Input
                    autoFocus
                    type="date"
                    className="h-14 text-lg px-5"
                    value={diagnosisDate}
                    onChange={(e) => setDiagnosisDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Date of Remission
                    <span className="text-muted-foreground/60 font-normal ml-2">
                      optional
                    </span>
                  </label>
                  <Input
                    type="date"
                    className="h-14 text-lg px-5"
                    value={remissionDate}
                    onChange={(e) => setRemissionDate(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Still in treatment? No problem — leave remission blank and
                  we&apos;ll adjust your plan accordingly.
                </p>
              </div>
            </StepShell>
          )}

          {/* Step 5 — Trainer Name */}
          {step === 5 && (
            <StepShell
              icon={<Sparkles className="size-8 text-brand" />}
              title="Name your AI trainer"
              subtitle="Give your recovery coach a name that motivates you."
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Trainer Name
                  </label>
                  <Input
                    autoFocus
                    className="h-14 text-lg px-5"
                    placeholder="Type a name or generate one below"
                    value={trainerName}
                    onChange={(e) => setTrainerName(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 text-base cursor-pointer"
                    onClick={() => setTrainerName(pickRandom(MALE_NAMES))}
                  >
                    <Shuffle className="size-4 mr-2" />
                    Generate Male
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 text-base cursor-pointer"
                    onClick={() => setTrainerName(pickRandom(FEMALE_NAMES))}
                  >
                    <Shuffle className="size-4 mr-2" />
                    Generate Female
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed text-center">
                  This is who&apos;ll guide your recovery journey. You can
                  always change it later.
                </p>
              </div>
            </StepShell>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                className="h-12 px-6 text-base cursor-pointer"
                onClick={back}
              >
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <Button
                type="button"
                className="h-12 px-8 text-base font-semibold cursor-pointer"
                disabled={!canAdvance()}
                onClick={next}
              >
                Continue
                <ArrowRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                className="h-12 px-8 text-base font-semibold cursor-pointer"
                disabled={saving}
                onClick={handleFinish}
              >
                {saving ? (
                  "Setting things up..."
                ) : (
                  <span className="flex items-center gap-2">
                    Finish
                    <Heart className="size-4" />
                  </span>
                )}
              </Button>
            )}
          </div>

          {/* Trust note */}
          <p className="text-center text-xs text-muted-foreground mt-10 leading-relaxed">
            Your information stays on your device and is only used to
            personalize your recovery plan.
          </p>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step Shell — consistent layout for each step                       */
/* ------------------------------------------------------------------ */

function StepShell({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-brand/10">
          {icon}
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto">{children}</div>
    </div>
  );
}
