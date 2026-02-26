"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2 } from "lucide-react";
import type { MoodEntry } from "@/types/mental-health";
import { MOOD_LABELS } from "@/types/mental-health";

const STORAGE_KEY = "rti_mood_entries";

function loadEntries(): MoodEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: MoodEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function MoodTrackerSection() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [view, setView] = useState<"checkin" | "history">("checkin");

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const todayISO = new Date().toISOString().split("T")[0];
  const todayEntry = entries.find((e) => e.date === todayISO);

  const handleSave = (entry: MoodEntry) => {
    const updated = entries.filter((e) => e.date !== entry.date);
    updated.push(entry);
    updated.sort((a, b) => a.date.localeCompare(b.date));
    setEntries(updated);
    saveEntries(updated);
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === "checkin" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("checkin")}
        >
          Daily Check-In
        </Button>
        <Button
          variant={view === "history" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("history")}
        >
          History ({entries.length})
        </Button>
      </div>

      {view === "checkin" ? (
        <MoodCheckIn
          existingEntry={todayEntry || null}
          onSave={handleSave}
        />
      ) : (
        <MoodHistory entries={entries} />
      )}
    </div>
  );
}

function MoodCheckIn({
  existingEntry,
  onSave,
}: {
  existingEntry: MoodEntry | null;
  onSave: (entry: MoodEntry) => void;
}) {
  const [mood, setMood] = useState(existingEntry?.mood ?? 5);
  const [anxiety, setAnxiety] = useState(existingEntry?.anxiety ?? 3);
  const [energy, setEnergy] = useState(existingEntry?.energy ?? 3);
  const [sleepQuality, setSleepQuality] = useState(
    existingEntry?.sleep_quality ?? 3,
  );
  const [fearOfRecurrence, setFearOfRecurrence] = useState(
    existingEntry?.fear_of_recurrence ?? 2,
  );
  const [notes, setNotes] = useState(existingEntry?.notes ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const entry: MoodEntry = {
      id: existingEntry?.id || crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      mood,
      anxiety,
      energy,
      sleep_quality: sleepQuality,
      fear_of_recurrence: fearOfRecurrence,
      notes,
    };
    onSave(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card className="border-blue-500/30">
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">How are you feeling today?</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This takes about 1 minute. Your data stays on this device.
          </p>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Overall Mood</label>
            <span className="text-sm text-blue-400">
              {mood}/10 — {MOOD_LABELS[mood]}
            </span>
          </div>
          <Slider
            value={[mood]}
            onValueChange={([v]) => setMood(v)}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Anxiety */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Anxiety Level</label>
            <span className="text-sm text-amber-400">{anxiety}/10</span>
          </div>
          <Slider
            value={[anxiety]}
            onValueChange={([v]) => setAnxiety(v)}
            min={1}
            max={10}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Calm</span>
            <span>Severe</span>
          </div>
        </div>

        {/* Energy */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Energy Level</label>
            <span className="text-sm text-green-400">{energy}/5</span>
          </div>
          <Slider
            value={[energy]}
            onValueChange={([v]) => setEnergy(v)}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Exhausted</span>
            <span>Energized</span>
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Sleep Quality</label>
            <span className="text-sm text-purple-400">{sleepQuality}/5</span>
          </div>
          <Slider
            value={[sleepQuality]}
            onValueChange={([v]) => setSleepQuality(v)}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Terrible</span>
            <span>Great</span>
          </div>
        </div>

        {/* Fear of Recurrence */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Fear of Recurrence</label>
            <span className="text-sm text-red-400">{fearOfRecurrence}/5</span>
          </div>
          <Slider
            value={[fearOfRecurrence]}
            onValueChange={([v]) => setFearOfRecurrence(v)}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Not at all</span>
            <span>Constantly</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Anything else on your mind? (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-20 rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="How was your day? Any triggers, wins, or thoughts..."
          />
        </div>

        <Button
          onClick={handleSave}
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {saved ? (
            <>
              <CheckCircle2 className="size-4" />
              Saved!
            </>
          ) : existingEntry ? (
            "Update Today's Check-In"
          ) : (
            "Save Check-In"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function MoodHistory({ entries }: { entries: MoodEntry[] }) {
  if (entries.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>No mood entries yet. Complete your first daily check-in!</p>
        </CardContent>
      </Card>
    );
  }

  // Show last 14 entries for the chart
  const recent = entries.slice(-14);

  // Simple SVG line chart
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 30;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  const moodPoints = recent.map((e, i) => ({
    x: padding + (i / Math.max(recent.length - 1, 1)) * innerWidth,
    y: padding + innerHeight - ((e.mood - 1) / 9) * innerHeight,
    entry: e,
  }));

  const anxietyPoints = recent.map((e, i) => ({
    x: padding + (i / Math.max(recent.length - 1, 1)) * innerWidth,
    y: padding + innerHeight - ((e.anxiety - 1) / 9) * innerHeight,
  }));

  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="space-y-4">
      {/* Chart */}
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold">Mood & Anxiety Trend</h3>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-400 rounded" />
              Mood
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 rounded" />
              Anxiety
            </span>
          </div>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full"
            style={{ maxHeight: "220px" }}
          >
            {/* Grid lines */}
            {[1, 3, 5, 7, 10].map((v) => {
              const y = padding + innerHeight - ((v - 1) / 9) * innerHeight;
              return (
                <g key={v}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="currentColor"
                    className="text-muted/20"
                    strokeWidth="1"
                  />
                  <text
                    x={padding - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-muted-foreground"
                    fontSize="10"
                  >
                    {v}
                  </text>
                </g>
              );
            })}

            {/* Mood line */}
            {moodPoints.length > 1 && (
              <path
                d={toPath(moodPoints)}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {moodPoints.map((p, i) => (
              <circle
                key={`mood-${i}`}
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#60a5fa"
              />
            ))}

            {/* Anxiety line */}
            {anxietyPoints.length > 1 && (
              <path
                d={toPath(anxietyPoints)}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 3"
              />
            )}
            {anxietyPoints.map((p, i) => (
              <circle
                key={`anx-${i}`}
                cx={p.x}
                cy={p.y}
                r="3"
                fill="#fbbf24"
              />
            ))}

            {/* Date labels */}
            {moodPoints.map((p, i) => {
              // Only show every few labels to avoid crowding
              if (recent.length > 7 && i % 2 !== 0 && i !== recent.length - 1) return null;
              const d = new Date(recent[i].date);
              const label = `${d.getMonth() + 1}/${d.getDate()}`;
              return (
                <text
                  key={`label-${i}`}
                  x={p.x}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize="9"
                >
                  {label}
                </text>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Recent entries list */}
      <div className="space-y-2">
        {[...entries].reverse().slice(0, 10).map((entry) => (
          <Card key={entry.id} className="border-border/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="text-center min-w-[50px]">
                <p className="text-2xl font-bold text-blue-400">{entry.mood}</p>
                <p className="text-xs text-muted-foreground">mood</p>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>Anxiety: {entry.anxiety}/10</span>
                  <span>Energy: {entry.energy}/5</span>
                  <span>Sleep: {entry.sleep_quality}/5</span>
                  {entry.fear_of_recurrence > 2 && (
                    <span className="text-red-400">
                      FCR: {entry.fear_of_recurrence}/5
                    </span>
                  )}
                </div>
                {entry.notes && (
                  <p className="text-xs text-muted-foreground italic mt-1 line-clamp-1">
                    {entry.notes}
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className={
                  entry.mood >= 7
                    ? "text-green-400 border-green-500/30"
                    : entry.mood >= 4
                      ? "text-blue-400 border-blue-500/30"
                      : "text-red-400 border-red-500/30"
                }
              >
                {MOOD_LABELS[entry.mood]}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
