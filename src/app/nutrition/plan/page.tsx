"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NutritionPlanDisplay from "@/components/nutrition/NutritionPlanDisplay";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import SiteHeader from "@/components/shared/SiteHeader";
import type { NutritionPlanResponse, NutritionQuestionnaireData, WorkoutDaySummary } from "@/types/nutrition";

type QuestionnairePayload = NutritionQuestionnaireData & {
  cancer_types: string[];
  workout_schedule: WorkoutDaySummary[];
};

export default function NutritionPlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<NutritionPlanResponse | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnairePayload | null>(null);

  useEffect(() => {
    const storedPlan = sessionStorage.getItem("rti_nutrition_plan");
    if (storedPlan) {
      try {
        setPlan(JSON.parse(storedPlan));
      } catch {
        router.push("/nutrition");
        return;
      }
    } else {
      router.push("/nutrition");
      return;
    }

    const storedQ = sessionStorage.getItem("rti_nutrition_questionnaire");
    if (storedQ) {
      try {
        setQuestionnaire(JSON.parse(storedQ));
      } catch {
        // Questionnaire is optional — proceed without it
      }
    }
  }, [router]);

  if (!plan) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-5xl mx-auto py-12 px-8 w-full">
        <NutritionPlanDisplay
          plan={plan}
          questionnaire={questionnaire}
          onPlanUpdate={setPlan}
        />
      </div>
    </div>
  );
}
