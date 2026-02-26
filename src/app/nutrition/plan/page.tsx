"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NutritionPlanDisplay from "@/components/nutrition/NutritionPlanDisplay";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import SiteHeader from "@/components/shared/SiteHeader";
import type { NutritionPlanResponse } from "@/types/nutrition";

export default function NutritionPlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<NutritionPlanResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("rti_nutrition_plan");
    if (stored) {
      try {
        setPlan(JSON.parse(stored));
      } catch {
        router.push("/nutrition");
      }
    } else {
      router.push("/nutrition");
    }
  }, [router]);

  if (!plan) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1">
        <NutritionPlanDisplay plan={plan} onPlanUpdate={setPlan} />
      </div>
    </div>
  );
}
