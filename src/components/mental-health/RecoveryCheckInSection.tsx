"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, AlertTriangle, Wind } from "lucide-react";
import type {
  RecoveryCheckIn,
  TodayINeedTag,
  MoodEntry,
} from "@/types/mental-health";
import {
  ENERGY_LABELS,
  NSL_LABELS,
  CONFIDENCE_LABELS,
  TODAY_I_NEED_OPTIONS,
} from "@/types/mental-health";

const STORAGE_KEY = "rti_recovery_checkins";
const MOOD_STORAGE_KEY = "rti_mood_entries";

function loadCheckIns(): RecoveryCheckIn[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCheckIns(entries: RecoveryCheckIn[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function loadMoodEntries(): MoodEntry[] {
  try {
    const stored = localStorage.getItem(MOOD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function RecoveryCheckInSection() {
  const [checkIns, setCheckIns] = useState<RecoveryCheckIn[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [energy, setEnergy] = useState(3);
  const [nsl, setNsl] = useState(3);
  const [confidence, setConfidence] = useState(3);
  const [todayINeed, setTodayINeed] = useState<TodayINeedTag | null>(null);
  const [saved, setSaved] = useState(false);
  const [patternDismissed, setPatternDismissed] = useState(false);
  const [fcrDismissed, setFcrDismissed] = useState(false);

  useEffect(() => {
    const loaded = loadCheckIns();
    setCheckIns(loaded);
    setMoodEntries(loadMoodEntries());

    // Pre-fill if today's entry exists
    const todayISO = new Date().toISOString().split("T")[0];
    const todayEntry = loaded.find((e) => e.date === todayISO);
    if (todayEntry) {
      setEnergy(todayEntry.energy);
      setNsl(todayEntry.nervous_system_load);
      setConfidence(todayEntry.confidence_in_body);
      setTodayINeed(todayEntry.today_i_need || null);
      setSaved(true);
    }
  }, []);

  // Pattern detection: 5 of last 7 check-ins with energy <= 2 AND NSL >= 4
  const patternAlert = useMemo(() => {
    if (checkIns.length < 5) return false;
    const recent = checkIns.slice(-7);
    const flagged = recent.filter(
      (c) => c.energy <= 2 && c.nervous_system_load >= 4,
    );
    return flagged.length >= 5;
  }, [checkIns]);

  // FCR alert: 3 consecutive mood entries with fear_of_recurrence >= 3
  const fcrAlert = useMemo(() => {
    if (moodEntries.length < 3) return false;
    const sorted = [...moodEntries].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    const lastThree = sorted.slice(0, 3);
    return lastThree.every((e) => e.fear_of_recurrence >= 3);
  }, [moodEntries]);

  const handleSave = () => {
    const todayISO = new Date().toISOString().split("T")[0];
    const entry: RecoveryCheckIn = {
      id: `checkin-${todayISO}`,
      date: todayISO,
      energy,
      nervous_system_load: nsl,
      confidence_in_body: confidence,
      today_i_need: todayINeed || undefined,
    };

    const updated = checkIns.filter((c) => c.date !== todayISO);
    updated.push(entry);
    updated.sort((a, b) => a.date.localeCompare(b.date));
    setCheckIns(updated);
    saveCheckIns(updated);
    setSaved(true);
  };

  const recentCheckIns = checkIns.slice(-7).reverse();

  return (
    <div className="space-y-6">
      {/* Pattern Alert Banner */}
      {patternAlert && !patternDismissed && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-400 text-sm">
                    Recovery Pattern Detected
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We&apos;ve noticed your energy has been low and stress has
                    been high over the past week. Consider talking to your care
                    team about how you&apos;re feeling.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPatternDismissed(true)}
                className="shrink-0 text-xs"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FCR Alert */}
      {fcrAlert && !fcrDismissed && (
        <Card className="border-violet-500/50 bg-violet-500/10">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Wind className="size-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-violet-400 text-sm">
                    Fear of Recurrence
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your recent mood entries show elevated fear of recurrence.
                    This is completely normal. Would you like to try a grounding
                    breathwork session? Box Breathing can help calm your nervous
                    system.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFcrDismissed(true)}
                className="shrink-0 text-xs"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-In Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {saved ? "Today's Check-In" : "How are you feeling today?"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {saved && (
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <CheckCircle2 className="size-4" />
              <span className="text-sm">Saved for today</span>
            </div>
          )}

          {/* Energy */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Energy</span>
              <Badge variant="outline">{ENERGY_LABELS[energy]}</Badge>
            </div>
            <Slider
              value={[energy]}
              onValueChange={(v) => {
                setEnergy(v[0]);
                setSaved(false);
              }}
              min={1}
              max={5}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Exhausted</span>
              <span>High</span>
            </div>
          </div>

          {/* Nervous System Load */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Nervous System Load</span>
              <Badge variant="outline">{NSL_LABELS[nsl]}</Badge>
            </div>
            <Slider
              value={[nsl]}
              onValueChange={(v) => {
                setNsl(v[0]);
                setSaved(false);
              }}
              min={1}
              max={5}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Calm</span>
              <span>Overwhelmed</span>
            </div>
          </div>

          {/* Confidence in Body */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Confidence in Body</span>
              <Badge variant="outline">{CONFIDENCE_LABELS[confidence]}</Badge>
            </div>
            <Slider
              value={[confidence]}
              onValueChange={(v) => {
                setConfidence(v[0]);
                setSaved(false);
              }}
              min={1}
              max={5}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Low</span>
              <span>Strong</span>
            </div>
          </div>

          {/* Today I Need */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Today I Need{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {TODAY_I_NEED_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={todayINeed === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setTodayINeed(
                      todayINeed === opt.value ? null : opt.value,
                    );
                    setSaved(false);
                  }}
                  className="text-xs"
                  title={opt.description}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={saved}>
            {saved ? "Check-In Saved" : "Save Check-In"}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Check-Ins */}
      {recentCheckIns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Recent Check-Ins
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentCheckIns.map((c) => (
              <Card key={c.id} className="border-border/50">
                <CardContent className="pt-3 pb-3 px-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(c.date + "T12:00:00").toLocaleDateString(
                      undefined,
                      { weekday: "short", month: "short", day: "numeric" },
                    )}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-muted-foreground">Energy</p>
                      <p className="font-semibold">{ENERGY_LABELS[c.energy]}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">NSL</p>
                      <p className="font-semibold">
                        {NSL_LABELS[c.nervous_system_load]}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Confidence</p>
                      <p className="font-semibold">
                        {CONFIDENCE_LABELS[c.confidence_in_body]}
                      </p>
                    </div>
                  </div>
                  {c.today_i_need && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {c.today_i_need}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
