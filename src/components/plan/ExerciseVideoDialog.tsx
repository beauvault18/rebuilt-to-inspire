"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { youtubeSearchUrl } from "@/lib/youtube";

// Client-side cache shared across all instances
const videoCache = new Map<string, string>();

interface Props {
  exerciseName: string | null;
  onClose: () => void;
}

export default function ExerciseVideoDialog({ exerciseName, onClose }: Props) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!exerciseName) {
      setVideoId(null);
      setError(false);
      return;
    }

    const cached = videoCache.get(exerciseName);
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

    fetch(`/api/youtube-search?q=${encodeURIComponent(exerciseName)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        videoCache.set(exerciseName, data.videoId);
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
  }, [exerciseName]);

  return (
    <Dialog
      open={exerciseName !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-[90vw] w-[1400px]">
        <DialogHeader>
          <DialogTitle>{exerciseName}</DialogTitle>
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
                title={`${exerciseName} tutorial`}
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
          {exerciseName && (
            <a
              href={youtubeSearchUrl(exerciseName)}
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
  );
}
