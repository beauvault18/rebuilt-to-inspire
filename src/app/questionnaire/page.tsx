"use client";

import QuestionnaireShell from "@/components/questionnaire/QuestionnaireShell";
import SiteHeader from "@/components/shared/SiteHeader";

export default function QuestionnairePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 px-6 pt-4 pb-2">
        <QuestionnaireShell />
      </div>
    </div>
  );
}
