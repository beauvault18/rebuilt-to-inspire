"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { youtubeSearchUrl } from "@/lib/youtube";
import type { DayPlan, Exercise, MainExercise } from "@/types/plan";

interface Props {
  day: DayPlan;
}

// Client-side cache so repeat clicks don't re-fetch
const videoCache = new Map<string, string>();

function ExerciseButton({
  name,
  onSelect,
}: {
  name: string;
  onSelect: (name: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(name)}
      className="text-primary hover:underline inline-flex items-center gap-1.5 font-medium cursor-pointer text-left"
    >
      {name}
      <Play className="size-3.5 shrink-0" />
    </button>
  );
}

function SectionHeader({
  title,
  duration,
  colSpan,
}: {
  title: string;
  duration?: number;
  colSpan: number;
}) {
  return (
    <tr className="bg-muted/50">
      <td colSpan={colSpan} className="px-5 py-3 text-base font-bold uppercase tracking-wide">
        {title}
        {duration != null && (
          <span className="text-muted-foreground font-normal ml-2">
            ({duration} min)
          </span>
        )}
      </td>
    </tr>
  );
}

function SimpleExerciseRows({
  exercises,
  onSelectExercise,
}: {
  exercises: Exercise[];
  onSelectExercise: (name: string) => void;
}) {
  return (
    <>
      <tr className="border-b border-border">
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          EXERCISE
        </th>
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          DURATION / REPS
        </th>
        <th colSpan={3} className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          NOTES
        </th>
      </tr>
      {exercises.map((ex, i) => (
        <tr key={i} className="border-b border-border/50">
          <td className="px-5 py-3 text-base whitespace-nowrap">
            <ExerciseButton name={ex.name} onSelect={onSelectExercise} />
          </td>
          <td className="px-5 py-3 text-base text-muted-foreground whitespace-nowrap">
            {ex.duration_or_reps}
          </td>
          <td colSpan={3} className="px-5 py-3 text-base text-muted-foreground">
            {ex.notes || "—"}
          </td>
        </tr>
      ))}
    </>
  );
}

function MainExerciseRows({
  exercises,
  onSelectExercise,
}: {
  exercises: MainExercise[];
  onSelectExercise: (name: string) => void;
}) {
  return (
    <>
      <tr className="border-b border-border">
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          EXERCISE
        </th>
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          SETS
        </th>
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          REPS / DURATION
        </th>
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          INTENSITY
        </th>
        <th className="px-5 py-2 text-sm font-semibold text-muted-foreground text-left">
          EQUIPMENT
        </th>
      </tr>
      {exercises.map((ex, i) => (
        <React.Fragment key={i}>
          <tr className="border-b border-border/50">
            <td className="px-5 py-3 text-base">
              <ExerciseButton name={ex.name} onSelect={onSelectExercise} />
            </td>
            <td className="px-5 py-3 text-base text-muted-foreground">
              {ex.sets != null ? String(ex.sets) : "—"}
            </td>
            <td className="px-5 py-3 text-base text-muted-foreground">
              {ex.reps_or_duration}
            </td>
            <td className="px-5 py-3 text-base text-muted-foreground">
              {ex.intensity || "—"}
            </td>
            <td className="px-5 py-3 text-base text-muted-foreground">
              {ex.equipment || "—"}
            </td>
          </tr>
          {(ex.modification || ex.precaution) && (
            <tr>
              <td colSpan={5} className="px-5 pb-3 pt-0">
                {ex.modification && (
                  <p className="text-sm text-blue-400">
                    Modification: {ex.modification}
                  </p>
                )}
                {ex.precaution && (
                  <p className="text-sm text-yellow-400">
                    Precaution: {ex.precaution}
                  </p>
                )}
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

export default function WorkoutTable({ day }: Props) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch video when exercise is selected
  useEffect(() => {
    if (!selectedExercise) {
      setVideoId(null);
      setError(false);
      return;
    }

    // Check cache first
    const cached = videoCache.get(selectedExercise);
    if (cached) {
      setVideoId(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    setVideoId(null);

    const controller = new AbortController();
    abortRef.current = controller;

    fetch(`/api/youtube-search?q=${encodeURIComponent(selectedExercise)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        videoCache.set(selectedExercise, data.videoId);
        setVideoId(data.videoId);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(true);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedExercise]);

  const isRestDay =
    !day.warmup && (!day.main || day.main.length === 0) && !day.cooldown;

  if (isRestDay) {
    return (
      <Card className="border-2">
        <CardContent className="py-16 text-center">
          <p className="text-2xl font-bold">{day.day}</p>
          <Badge variant="secondary" className="mt-3 text-base px-3 py-1">
            {day.focus || "Rest Day"}
          </Badge>
          <p className="text-base text-muted-foreground mt-4">
            Recovery is part of the program. Light walking or gentle stretching
            is fine if desired.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2">
        <CardContent className="p-0">
          {/* Day header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-xl font-bold">{day.day}</h3>
            <Badge variant="secondary" className="text-sm px-3 py-1">{day.focus}</Badge>
          </div>

          {/* Table */}
          <div>
            <table className="w-full text-left">
              <tbody>
                {/* Warm-up */}
                {day.warmup && day.warmup.exercises.length > 0 && (
                  <>
                    <SectionHeader
                      title="Warm-up"
                      duration={day.warmup.duration_min}
                      colSpan={5}
                    />
                    <SimpleExerciseRows
                      exercises={day.warmup.exercises}
                      onSelectExercise={setSelectedExercise}
                    />
                  </>
                )}

                {/* Main Exercises */}
                {day.main && day.main.length > 0 && (
                  <>
                    <SectionHeader title="Main Exercises" colSpan={5} />
                    <MainExerciseRows
                      exercises={day.main}
                      onSelectExercise={setSelectedExercise}
                    />
                  </>
                )}

                {/* Cool-down */}
                {day.cooldown && day.cooldown.exercises.length > 0 && (
                  <>
                    <SectionHeader
                      title="Cool-down"
                      duration={day.cooldown.duration_min}
                      colSpan={5}
                    />
                    <SimpleExerciseRows
                      exercises={day.cooldown.exercises}
                      onSelectExercise={setSelectedExercise}
                    />
                  </>
                )}

                {/* Cancer-specific components */}
                {day.cancer_specific_components &&
                  day.cancer_specific_components.length > 0 && (
                    <>
                      <SectionHeader
                        title="Cancer-Specific Exercises"
                        colSpan={5}
                      />
                      <SimpleExerciseRows
                        exercises={day.cancer_specific_components}
                        onSelectExercise={setSelectedExercise}
                      />
                    </>
                  )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Video Dialog */}
      <Dialog
        open={selectedExercise !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedExercise(null);
        }}
      >
        <DialogContent className="max-w-[90vw] w-[1400px]">
          <DialogHeader>
            <DialogTitle>{selectedExercise}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              {loading && (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {videoId && !loading && (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title={`${selectedExercise} tutorial`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {error && !loading && (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <p>Could not load video</p>
                </div>
              )}
            </div>
            {selectedExercise && (
              <a
                href={youtubeSearchUrl(selectedExercise)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                Search on YouTube
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
