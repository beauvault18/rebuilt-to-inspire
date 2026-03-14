"use client";

import NutritionShell from "@/components/nutrition/NutritionShell";
import SiteHeader from "@/components/shared/SiteHeader";

export default function NutritionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 px-6 pt-4 pb-2">
        <NutritionShell />
      </div>
    </div>
  );
}
