"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import FadeTransition from "@/components/shared/FadeTransition";
import StepNavigation from "@/components/shared/StepNavigation";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import StepWelcome from "./StepWelcome";
import StepClearance from "./StepClearance";
import StepCancerHistory from "./StepCancerHistory";
import StepSymptomsAndMedical from "./StepSymptomsAndMedical";
import StepGoals from "./StepGoals";
import StepExercisePrefs from "./StepExercisePrefs";
import StepPersonalInfo from "./StepPersonalInfo";
import { useQuestionnaireForm } from "@/hooks/useQuestionnaireForm";
import { generatePlan } from "@/lib/api";

const STEP_TITLES = [
  "Before We Begin",
  "Clinician Clearance",
  "Cancer History",
  "Your Recovery Status",
  "Your Goals",
  "Exercise Preferences",
  "Personal Information",
];

export default function QuestionnaireShell() {
  const router = useRouter();
  const { data, setField, toggleInList, addToList, removeFromList, getApiPayload } =
    useQuestionnaireForm();
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = STEP_TITLES.length;
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  const canProceed = useCallback(() => {
    switch (step) {
      case 0: // Before We Begin
        return true;
      case 1: // Clinician Clearance
        return data.clinician_clearance;
      case 2: // Cancer History
        return (
          data.cancer_types.length > 0 &&
          /^\d{4}-\d{2}$/.test(data.remissionDate)
        );
      case 3: // Recovery Status (Symptoms + Medical)
        return true;
      case 4: // Goals
        return data.primary_goal !== "";
      case 5: // Exercise Preferences
        return true;
      case 6: // Personal Information
        return (
          data.firstName.trim() !== "" &&
          data.lastName.trim() !== "" &&
          data.email.trim() !== "" &&
          data.age >= 18 &&
          data.heightFeet > 0 &&
          data.currentWeight > 0
        );
      default:
        return true;
    }
  }, [step, data]);

  const handleNext = useCallback(async () => {
    if (!canProceed()) return;

    if (isLast) {
      setIsSubmitting(true);
      setShow(false);
      setError("");
      try {
        const payload = getApiPayload();
        const response = await generatePlan({
          questionnaire: payload,
          top_k: 5,
        });
        sessionStorage.setItem("rti_plan", JSON.stringify(response));
        sessionStorage.setItem("rti_questionnaire", JSON.stringify({ questionnaire: payload, top_k: 5 }));
        sessionStorage.setItem(
          "rti_profile",
          JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
          }),
        );
        sessionStorage.removeItem("rti_stage_revealed");
        router.push("/plan");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate plan. Is the backend running?",
        );
        setIsSubmitting(false);
        setShow(true);
      }
      return;
    }

    setShow(false);
  }, [canProceed, isLast, getApiPayload, data.firstName, data.lastName]);

  const handleBack = useCallback(() => {
    if (isFirst) return;
    setShow(false);
  }, [isFirst]);

  const handleExited = useCallback(() => {
    if (isSubmitting) {
      router.push("/plan");
      return;
    }
    setShow(true);
  }, [isSubmitting, router]);

  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const handleNextWithDirection = useCallback(async () => {
    setDirection("forward");
    await handleNext();
  }, [handleNext]);

  const handleBackWithDirection = useCallback(() => {
    setDirection("back");
    setShow(false);
  }, []);

  const handleExitedWithDirection = useCallback(() => {
    if (isSubmitting) {
      router.push("/plan");
      return;
    }
    if (direction === "forward" && !isLast) {
      setStep((s) => s + 1);
    } else if (direction === "back" && !isFirst) {
      setStep((s) => s - 1);
    }
    setShow(true);
  }, [isSubmitting, router, direction, isLast, isFirst]);

  if (isSubmitting && !show) {
    return <LoadingSpinner />;
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepWelcome />;
      case 1:
        return (
          <StepClearance
            data={data}
            setField={setField}
            addToList={addToList}
            removeFromList={removeFromList}
          />
        );
      case 2:
        return (
          <StepCancerHistory
            data={data}
            setField={setField}
            toggleInList={toggleInList}
          />
        );
      case 3:
        return (
          <StepSymptomsAndMedical
            data={data}
            setField={setField}
            toggleInList={toggleInList}
          />
        );
      case 4:
        return <StepGoals data={data} setField={setField} />;
      case 5:
        return (
          <StepExercisePrefs
            data={data}
            setField={setField}
            toggleInList={toggleInList}
          />
        );
      case 6:
        return <StepPersonalInfo data={data} setField={setField} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-base text-muted-foreground mb-3">
          <span>
            Step {step + 1} of {totalSteps}
          </span>
          <span className="font-medium">{STEP_TITLES[step]}</span>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand transition-all duration-300 rounded-full"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-8">
          <FadeTransition
            show={show}
            duration={300}
            onExited={handleExitedWithDirection}
          >
            {renderStep()}
          </FadeTransition>

          {error && (
            <p className="text-sm text-destructive mt-4">{error}</p>
          )}

          <StepNavigation
            onBack={handleBackWithDirection}
            onNext={handleNextWithDirection}
            canProceed={canProceed()}
            isFirst={isFirst}
            isLast={isLast}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
