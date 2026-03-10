"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  RecoveryCheckIn,
  MoodEntry,
  JournalEntry,
} from "@/types/mental-health";
import {
  ENERGY_LABELS,
  NSL_LABELS,
  CONFIDENCE_LABELS,
} from "@/types/mental-health";

function loadFromStorage<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function getMoodTrend(entries: MoodEntry[]): string {
  if (entries.length < 2) return "stable";
  const firstHalf = entries.slice(0, Math.ceil(entries.length / 2));
  const secondHalf = entries.slice(Math.ceil(entries.length / 2));
  const avgFirst = firstHalf.reduce((s, e) => s + e.mood, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, e) => s + e.mood, 0) / secondHalf.length;
  const diff = avgSecond - avgFirst;
  if (diff > 0.5) return "improving";
  if (diff < -0.5) return "declining";
  return "stable";
}

function getScoreColor(score: number, inverted = false): string {
  const val = inverted ? 6 - score : score;
  if (val >= 4) return "text-emerald-400";
  if (val >= 3) return "text-yellow-400";
  return "text-red-400";
}

interface WeeklyRecoverySummaryProps {
  supportActive?: boolean;
}

export default function WeeklyRecoverySummary({ supportActive = false }: WeeklyRecoverySummaryProps) {
  const [checkIns, setCheckIns] = useState<RecoveryCheckIn[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    setCheckIns(loadFromStorage<RecoveryCheckIn>("rti_recovery_checkins"));
    setMoodEntries(loadFromStorage<MoodEntry>("rti_mood_entries"));
    setJournalEntries(loadFromStorage<JournalEntry>("rti_journal_entries"));
  }, []);

  const weekStart = getWeekStart(new Date());

  const summary = useMemo(() => {
    const weekCheckIns = checkIns.filter((c) => c.date >= weekStart);
    const weekMoods = moodEntries.filter((m) => m.date >= weekStart);
    const weekJournals = journalEntries.filter((j) => j.date >= weekStart);

    if (weekCheckIns.length === 0 && weekMoods.length === 0) return null;

    const avgEnergy = weekCheckIns.length > 0
      ? weekCheckIns.reduce((s, c) => s + c.energy, 0) / weekCheckIns.length
      : 0;
    const avgNsl = weekCheckIns.length > 0
      ? weekCheckIns.reduce((s, c) => s + c.nervous_system_load, 0) / weekCheckIns.length
      : 0;
    const avgConfidence = weekCheckIns.length > 0
      ? weekCheckIns.reduce((s, c) => s + c.confidence_in_body, 0) / weekCheckIns.length
      : 0;

    const patternAlerts: string[] = [];

    // Check for sustained low energy
    if (weekCheckIns.length >= 3 && avgEnergy < 2.5) {
      patternAlerts.push("Energy has been consistently low this week");
    }

    // Check for high NSL
    if (weekCheckIns.length >= 3 && avgNsl > 3.5) {
      patternAlerts.push("Nervous system load has been elevated this week");
    }

    // Check for FCR in mood entries
    const highFcr = weekMoods.filter((m) => m.fear_of_recurrence >= 3);
    if (highFcr.length >= 3) {
      patternAlerts.push("Fear of recurrence has been elevated — consider a grounding practice");
    }

    return {
      week_start: weekStart,
      avg_energy: Math.round(avgEnergy * 10) / 10,
      avg_nsl: Math.round(avgNsl * 10) / 10,
      avg_confidence: Math.round(avgConfidence * 10) / 10,
      mood_trend: getMoodTrend(weekMoods),
      pattern_alerts: patternAlerts,
      check_in_count: weekCheckIns.length,
      journal_count: weekJournals.length,
      mood_count: weekMoods.length,
    };
  }, [checkIns, moodEntries, journalEntries, weekStart]);

  if (!summary) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No data for this week yet. Complete a daily check-in or mood entry to see your weekly summary.
          </p>
        </CardContent>
      </Card>
    );
  }

  const trendBadge = {
    improving: { label: "Improving", variant: "default" as const, className: "bg-emerald-600" },
    stable: { label: "Stable", variant: "secondary" as const, className: "" },
    declining: { label: "Needs Attention", variant: "destructive" as const, className: "" },
  }[summary.mood_trend] || { label: "Stable", variant: "secondary" as const, className: "" };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Week of{" "}
              {new Date(weekStart + "T12:00:00").toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
              })}
            </CardTitle>
            <Badge variant={trendBadge.variant} className={trendBadge.className}>
              {trendBadge.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Grid */}
          {summary.check_in_count > 0 && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg Energy</p>
                <p className={`text-2xl font-bold ${getScoreColor(summary.avg_energy)}`}>
                  {summary.avg_energy.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ENERGY_LABELS[Math.round(summary.avg_energy)] || ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg NSL</p>
                <p className={`text-2xl font-bold ${getScoreColor(summary.avg_nsl, true)}`}>
                  {summary.avg_nsl.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {NSL_LABELS[Math.round(summary.avg_nsl)] || ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg Confidence</p>
                <p className={`text-2xl font-bold ${getScoreColor(summary.avg_confidence)}`}>
                  {summary.avg_confidence.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {CONFIDENCE_LABELS[Math.round(summary.avg_confidence)] || ""}
                </p>
              </div>
            </div>
          )}

          {/* Activity Counts */}
          <div className="flex gap-4 justify-center text-sm text-muted-foreground">
            <span>{summary.check_in_count} check-in{summary.check_in_count !== 1 ? "s" : ""}</span>
            <span>{summary.mood_count} mood entr{summary.mood_count !== 1 ? "ies" : "y"}</span>
            <span>{summary.journal_count} journal entr{summary.journal_count !== 1 ? "ies" : "y"}</span>
          </div>

          {/* Pattern Alerts */}
          {summary.pattern_alerts.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-400">
                Patterns This Week
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {summary.pattern_alerts.map((alert, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">-</span>
                    {alert}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {supportActive && summary.mood_trend === "declining" && (
            <p className="text-sm text-muted-foreground pt-2 border-t border-surface-border/20">
              If things have felt harder lately, that&apos;s okay. The tools
              here are ready when you are.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
