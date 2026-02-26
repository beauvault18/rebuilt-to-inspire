"use client";

import QuestionnaireShell from "@/components/questionnaire/QuestionnaireShell";
import SiteHeader from "@/components/shared/SiteHeader";

export default function QuestionnairePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <QuestionnaireShell />
      </div>
    </div>
  );
}
