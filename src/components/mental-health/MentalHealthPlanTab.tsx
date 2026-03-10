"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { MoodEntry, JournalEntry } from "@/types/mental-health";
import type { MentalSupportState } from "@/types/mental-adaptation";

const JOURNAL_STORAGE_KEY = "rti_journal_entries";

function loadJournalEntries(): JournalEntry[] {
  try {
    const stored = localStorage.getItem(JOURNAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getWeekCount(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = new Date(sorted[0].date + "T00:00:00");
  const now = new Date();
  return Math.floor(
    (now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
  );
}

function getRecoveryFocus(weekCount: number): {
  focus: string;
  bullets: string[];
} {
  if (weekCount < 2) {
    return {
      focus: "Stabilization",
      bullets: [
        "Building awareness of your emotional patterns",
        "Establishing a gentle check-in routine",
      ],
    };
  }
  if (weekCount < 6) {
    return {
      focus: "Reflection",
      bullets: [
        "Deepening self-awareness through regular reflection",
        "Recognizing patterns in mood and energy",
      ],
    };
  }
  return {
    focus: "Rebuilding",
    bullets: [
      "Strengthening emotional resilience through consistent practice",
      "Integrating recovery tools into your daily routine",
    ],
  };
}

function getMoodTrend(entries: MoodEntry[]): string {
  if (entries.length < 2) return "stable";
  const firstHalf = entries.slice(0, Math.ceil(entries.length / 2));
  const secondHalf = entries.slice(Math.ceil(entries.length / 2));
  const avgFirst =
    firstHalf.reduce((s, e) => s + e.mood, 0) / firstHalf.length;
  const avgSecond =
    secondHalf.reduce((s, e) => s + e.mood, 0) / secondHalf.length;
  if (avgSecond - avgFirst > 0.5) return "improving";
  if (avgSecond - avgFirst < -0.5) return "declining";
  return "stable";
}

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

interface Props {
  supportState: MentalSupportState;
  supportActive: boolean;
  moodEntries: MoodEntry[];
  onAcceptSupport: () => void;
  onDeclineSupport: () => void;
  onRemoveSupport: () => void;
}

export default function MentalHealthPlanTab({
  supportState,
  supportActive,
  moodEntries,
  onAcceptSupport,
  onDeclineSupport,
  onRemoveSupport,
}: Props) {
  const weekCount = getWeekCount(moodEntries);
  const { focus, bullets } = getRecoveryFocus(weekCount);
  const journalEntries = useMemo(() => loadJournalEntries(), []);

  const weekStart = getWeekStart();
  const weekMoods = moodEntries.filter((m) => m.date >= weekStart);
  const avgMood =
    weekMoods.length > 0
      ? Math.round(
          (weekMoods.reduce((s, e) => s + e.mood, 0) / weekMoods.length) * 10,
        ) / 10
      : null;
  const moodTrend = getMoodTrend(weekMoods);

  const lastJournal =
    journalEntries.length > 0
      ? journalEntries[journalEntries.length - 1]
      : null;

  return (
    <div className="space-y-8">
      {/* Program Overview Panel */}
      <div className="bg-surface-panel rounded-xl p-8 space-y-4">
        <h2 className="text-2xl font-bold">Emotional Recovery Plan</h2>
        <p className="text-base">
          Current Focus: <span className="font-semibold">{focus}</span>
        </p>
        <ul className="list-disc list-inside text-base space-y-1 text-muted-foreground">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>

      {/* Weekly Reflection */}
      <div className="bg-surface-card rounded-lg p-6 space-y-6">
        <h3 className="text-xl font-semibold">This Week</h3>

        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-base text-muted-foreground">Check-ins</p>
            <p className="text-2xl font-bold">{weekMoods.length}</p>
          </div>
          {avgMood !== null && (
            <div>
              <p className="text-base text-muted-foreground">Average Mood</p>
              <p className="text-2xl font-bold">{avgMood}</p>
            </div>
          )}
          <div>
            <p className="text-base text-muted-foreground">Trend</p>
            <p className="text-lg font-semibold capitalize">{moodTrend}</p>
          </div>
        </div>

        {lastJournal && (
          <p className="text-sm text-muted-foreground">
            Last journal entry:{" "}
            {new Date(lastJournal.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        )}

        {supportActive && (
          <p className="text-base text-muted-foreground">
            Additional support is integrated into your recovery plan this week.
          </p>
        )}
      </div>

      {/* Support Layer Management */}
      {supportState === "proposal_pending" && (
        <div className="border-l-2 border-surface-border/40 pl-4 space-y-3">
          <p className="text-base font-medium">
            You&apos;ve been navigating some difficult days. Would you like
            additional support integrated into your recovery plan?
          </p>
          <div className="flex gap-3 pt-1">
            <Button
              onClick={onAcceptSupport}
              className="bg-brand text-brand-foreground hover:brightness-110"
            >
              Add Support Layer
            </Button>
            <Button variant="ghost" onClick={onDeclineSupport}>
              Not Now
            </Button>
          </div>
        </div>
      )}

      {supportActive && (
        <div className="bg-surface-card rounded-lg p-6 space-y-4">
          <p className="text-base">
            Additional support is currently integrated.
          </p>
          <Button variant="ghost" onClick={onRemoveSupport}>
            Remove Additional Support
          </Button>
        </div>
      )}

      {/* Weekly Recovery Summary whisper */}
      {supportActive && moodTrend === "declining" && (
        <div className="border-l-2 border-surface-border/40 pl-4">
          <p className="text-base text-muted-foreground">
            Based on your recent entries, emotional fatigue may be present.
          </p>
        </div>
      )}
    </div>
  );
}
