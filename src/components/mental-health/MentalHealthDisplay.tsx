"use client";

import { useState, useEffect } from "react";
import MentalHealthTodayTab from "./MentalHealthTodayTab";
import MentalHealthPlanTab from "./MentalHealthPlanTab";
import MentalHealthSafetyTab from "./MentalHealthSafetyTab";
import { evaluateMentalTrend } from "@/lib/mental-adaptation";
import {
  isMentalSupportActive,
  activateMentalSupport,
  deactivateMentalSupport,
  declineMentalSupport,
  isMentalSupportDeclined,
  wasMentalProposalRecentlyShown,
  markMentalProposalShown,
} from "@/lib/mental-support-storage";
import { hasAnyPillarAdaptedInLast7Days } from "@/lib/adaptive-throttle";
import type { MoodEntry } from "@/types/mental-health";
import type { MentalSupportState } from "@/types/mental-adaptation";

type TabId = "today" | "plan" | "safety";

const TABS: { id: TabId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "plan", label: "Plan" },
  { id: "safety", label: "Safety" },
];

function loadMoodEntries(): MoodEntry[] {
  try {
    const stored = localStorage.getItem("rti_mood_entries");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function MentalHealthDisplay() {
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [supportState, setSupportState] = useState<MentalSupportState>("idle");
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    const entries = loadMoodEntries();
    setMoodEntries(entries);

    if (isMentalSupportActive()) {
      setSupportState("support_active");
      return;
    }

    if (!evaluateMentalTrend(entries)) return;
    if (isMentalSupportDeclined()) return;
    if (hasAnyPillarAdaptedInLast7Days()) return;
    if (wasMentalProposalRecentlyShown()) return;

    setSupportState("proposal_pending");
  }, []);

  // Mark proposal as shown when it surfaces — starts 7-day quiet window
  useEffect(() => {
    if (supportState === "proposal_pending") {
      markMentalProposalShown();
    }
  }, [supportState]);

  const handleAcceptSupport = () => {
    activateMentalSupport();
    setSupportState("support_active");
  };

  const handleDeclineSupport = () => {
    declineMentalSupport();
    setSupportState("declined");
  };

  const handleRemoveSupport = () => {
    deactivateMentalSupport();
    setSupportState("declined");
  };

  const handleMoodSaved = () => {
    setMoodEntries(loadMoodEntries());
  };

  const supportActive = supportState === "support_active";

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-surface-card rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-5 py-2.5 text-base font-medium transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? "bg-surface-panel text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={{
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "today" && (
          <MentalHealthTodayTab
            supportActive={supportActive}
            moodEntries={moodEntries}
            onMoodSaved={handleMoodSaved}
          />
        )}

        {activeTab === "plan" && (
          <MentalHealthPlanTab
            supportState={supportState}
            supportActive={supportActive}
            moodEntries={moodEntries}
            onAcceptSupport={handleAcceptSupport}
            onDeclineSupport={handleDeclineSupport}
            onRemoveSupport={handleRemoveSupport}
          />
        )}

        {activeTab === "safety" && <MentalHealthSafetyTab />}
      </div>
    </div>
  );
}
