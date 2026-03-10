"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2 } from "lucide-react";
import { MOOD_LABELS, JOURNAL_PROMPTS } from "@/types/mental-health";
import type { MoodEntry } from "@/types/mental-health";

const MOOD_STORAGE_KEY = "rti_mood_entries";
const JOURNAL_STORAGE_KEY = "rti_journal_entries";

const SUPPORT_PROMPTS = [
  "Lately, things have felt heavy. What would help you feel lighter?",
  "What's one small thing you could do today to be kind to yourself?",
  "Write about a moment recently when you felt even a little bit of peace.",
  "If you could ask for one thing right now, what would it be?",
];

function loadMoodEntries(): MoodEntry[] {
  try {
    const stored = localStorage.getItem(MOOD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMoodEntries(entries: MoodEntry[]) {
  localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(entries));
}

interface Props {
  supportActive: boolean;
  moodEntries: MoodEntry[];
  onMoodSaved: () => void;
}

export default function MentalHealthTodayTab({
  supportActive,
  moodEntries,
  onMoodSaved,
}: Props) {
  const todayISO = new Date().toISOString().split("T")[0];
  const todayEntry = moodEntries.find((e) => e.date === todayISO);

  const [mood, setMood] = useState(todayEntry?.mood ?? 5);
  const [notes, setNotes] = useState(todayEntry?.notes ?? "");
  const [saved, setSaved] = useState(!!todayEntry);

  // Compact journaling
  const allPrompts = supportActive
    ? [...JOURNAL_PROMPTS, ...SUPPORT_PROMPTS]
    : JOURNAL_PROMPTS;
  const [journalPrompt] = useState(
    () => allPrompts[Math.floor(Math.random() * allPrompts.length)],
  );
  const [journalText, setJournalText] = useState("");
  const [journalSaved, setJournalSaved] = useState(false);

  const handleSaveMood = () => {
    if (saved) return;

    const entry: MoodEntry = {
      id: todayEntry?.id || crypto.randomUUID(),
      date: todayISO,
      mood,
      anxiety: todayEntry?.anxiety ?? 5,
      energy: todayEntry?.energy ?? 3,
      sleep_quality: todayEntry?.sleep_quality ?? 3,
      fear_of_recurrence: todayEntry?.fear_of_recurrence ?? 1,
      notes,
    };

    const all = loadMoodEntries();
    const updated = all.filter((e) => e.date !== todayISO);
    updated.push(entry);
    updated.sort((a, b) => a.date.localeCompare(b.date));
    saveMoodEntries(updated);
    setSaved(true);
    onMoodSaved();
  };

  const handleSaveJournal = () => {
    if (journalSaved || journalText.trim().length < 10) return;

    try {
      const stored = localStorage.getItem(JOURNAL_STORAGE_KEY);
      const entries = stored ? JSON.parse(stored) : [];
      entries.push({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        prompt: journalPrompt,
        entry_text: journalText,
        ai_reflection: "",
        tags: [],
      });
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
      setJournalSaved(true);
    } catch {
      // Degrade silently
    }
  };

  return (
    <div className="space-y-8">
      {/* Whisper Advisory */}
      {supportActive && (
        <div className="border-l-2 border-surface-border/40 pl-4">
          <p className="text-base font-medium">
            Additional support is active for this phase of recovery.
          </p>
        </div>
      )}

      {/* Daily Mood Check-in */}
      <div className="bg-surface-card rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">How are you feeling today?</h2>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-base text-muted-foreground">Mood</span>
            <span className="text-base font-medium">
              {mood}/10 — {MOOD_LABELS[mood]}
            </span>
          </div>
          <Slider
            value={[mood]}
            onValueChange={([v]) => {
              setMood(v);
              if (saved && todayEntry) setSaved(false);
            }}
            min={1}
            max={10}
            step={1}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Very Low</span>
            <span>Excellent</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-base text-muted-foreground">
            Anything on your mind? (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (saved && todayEntry) setSaved(false);
            }}
            className="w-full h-20 rounded-md border border-border bg-background px-3 py-2 text-base resize-none focus:outline-none focus:ring-2 focus:ring-brand/50"
            placeholder="How was your day? Any thoughts or observations..."
          />
        </div>

        <button
          onClick={handleSaveMood}
          disabled={saved}
          className={`w-full py-3 rounded-lg text-base font-semibold transition-all duration-200 cursor-pointer ${
            saved
              ? "bg-surface-card text-muted-foreground cursor-default"
              : "bg-brand text-brand-foreground hover:brightness-110"
          }`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {saved ? (
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-5" />
              Check-in Saved
            </span>
          ) : todayEntry ? (
            "Update Check-in"
          ) : (
            "Save Check-in"
          )}
        </button>
      </div>

      {/* Grounding Exercise (conditional) */}
      {supportActive && (
        <div className="bg-surface-card rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium">Grounding Exercise</h3>
          <p className="text-base text-muted-foreground">
            Box Breathing — Breathe in for 4 counts. Hold for 4 counts. Breathe
            out for 4 counts. Rest for 4 counts. Repeat 3 times.
          </p>
          <p className="text-base text-muted-foreground">
            Take a moment to notice where you are. What can you hear? What can
            you feel beneath your hands?
          </p>
        </div>
      )}

      {/* Compact Journaling */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Reflect</h3>
        <p className="text-base text-muted-foreground italic">
          {journalPrompt}
        </p>
        <textarea
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          className="w-full h-32 rounded-lg border border-border bg-background px-4 py-3 text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand/50"
          placeholder="Start writing here..."
          disabled={journalSaved}
        />
        {journalText.trim().length > 0 && (
          <button
            onClick={handleSaveJournal}
            disabled={journalSaved || journalText.trim().length < 10}
            className={`px-5 py-2.5 rounded-lg text-base font-medium transition-all duration-200 cursor-pointer ${
              journalSaved
                ? "bg-surface-card text-muted-foreground cursor-default"
                : "text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {journalSaved ? "Saved" : "Save Entry"}
          </button>
        )}
      </div>
    </div>
  );
}
