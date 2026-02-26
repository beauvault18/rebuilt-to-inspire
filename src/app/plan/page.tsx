"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PlanDisplay from "@/components/plan/PlanDisplay";
import SiteHeader from "@/components/shared/SiteHeader";
import type { PlanResponse } from "@/types/plan";

export default function PlanPage() {
  const router = useRouter();
  const [response, setResponse] = useState<PlanResponse | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const stored = sessionStorage.getItem("rti_plan");
    if (!stored) {
      router.push("/questionnaire");
      return;
    }
    setResponse(JSON.parse(stored));

    const profile = sessionStorage.getItem("rti_profile");
    if (profile) {
      const { firstName } = JSON.parse(profile);
      setUserName(firstName);
    }
  }, [router]);

  if (!response) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 py-12 px-8">
        <PlanDisplay response={response} userName={userName} />
      </div>
    </div>
  );
}
