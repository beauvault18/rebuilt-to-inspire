"use client";

import NutritionShell from "@/components/nutrition/NutritionShell";
import SiteHeader from "@/components/shared/SiteHeader";

export default function NutritionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <NutritionShell />
      </div>
    </div>
  );
}
