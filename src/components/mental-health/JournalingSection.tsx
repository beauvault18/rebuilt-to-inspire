"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Loader2, Sparkles, BookOpen } from "lucide-react";
import { JOURNAL_PROMPTS, JOURNAL_TAGS, type JournalEntry } from "@/types/mental-health";
import { getJournalReflection } from "@/lib/api";

const STORAGE_KEY = "rti_journal_entries";

function loadEntries(): JournalEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getRandomPrompt(): string {
  return JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
}

export default function JournalingSection() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [view, setView] = useState<"write" | "past">("write");

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const handleSave = (entry: JournalEntry) => {
    const updated = [...entries, entry];
    setEntries(updated);
    saveEntries(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={view === "write" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("write")}
        >
          Write
        </Button>
        <Button
          variant={view === "past" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("past")}
        >
          Past Entries ({entries.length})
        </Button>
      </div>

      {view === "write" ? (
        <JournalWriter onSave={handleSave} />
      ) : (
        <PastEntries entries={entries} />
      )}
    </div>
  );
}

function JournalWriter({ onSave }: { onSave: (entry: JournalEntry) => void }) {
  const [prompt, setPrompt] = useState(getRandomPrompt);
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [isReflecting, setIsReflecting] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const shufflePrompt = () => {
    let next = getRandomPrompt();
    while (next === prompt) {
      next = getRandomPrompt();
    }
    setPrompt(next);
  };

  const handleReflect = async () => {
    if (text.trim().length < 20) return;
    setIsReflecting(true);
    try {
      const result = await getJournalReflection(prompt, text, tags);
      setReflection(result);
    } catch {
      setReflection(
        "I appreciate you sharing your thoughts. Writing is a powerful tool for processing your journey. Take a moment to reread what you wrote and notice how you feel.",
      );
    } finally {
      setIsReflecting(false);
    }
  };

  const handleSave = () => {
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      prompt,
      entry_text: text,
      ai_reflection: reflection,
      tags,
    };
    onSave(entry);
    setSaved(true);
    // Reset for next entry
    setTimeout(() => {
      setText("");
      setReflection("");
      setTags([]);
      setPrompt(getRandomPrompt());
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Prompt Card */}
      <Card className="border-purple-500/30 bg-purple-500/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs text-purple-400 uppercase tracking-wider font-medium">
                Today's Prompt
              </p>
              <p className="text-lg font-medium">{prompt}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={shufflePrompt}
              className="shrink-0 text-purple-400"
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Writing Area */}
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-48 rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          placeholder="Start writing here... There are no rules. Just let your thoughts flow."
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{text.length} characters</span>
          <span>
            {text.trim().length < 20
              ? "Write at least a few sentences to get an AI reflection"
              : "Ready for reflection"}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <p className="text-sm font-medium">
          How does this make you feel? (optional)
        </p>
        <div className="flex flex-wrap gap-2">
          {JOURNAL_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* AI Reflection */}
      {reflection && (
        <Card className="border-purple-500/30">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles className="size-4" />
              <p className="text-sm font-semibold">Gentle Reflection</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {reflection}
            </p>
            <p className="text-xs text-muted-foreground/60 italic mt-2">
              This is not therapy. If you're struggling, please reach out to a
              mental health professional.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!reflection && (
          <Button
            onClick={handleReflect}
            disabled={text.trim().length < 20 || isReflecting}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {isReflecting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Reflecting...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Get AI Reflection
              </>
            )}
          </Button>
        )}
        {text.trim().length > 0 && (
          <Button
            variant={saved ? "default" : "outline"}
            onClick={handleSave}
            disabled={saved}
            className="gap-2"
          >
            {saved ? "Saved!" : "Save Entry"}
          </Button>
        )}
      </div>
    </div>
  );
}

function PastEntries({ entries }: { entries: JournalEntry[] }) {
  if (entries.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-8 text-center text-muted-foreground">
          <BookOpen className="size-10 mx-auto mb-3 opacity-40" />
          <p>No journal entries yet. Start writing to build your collection.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {[...entries].reverse().map((entry) => (
        <Card key={entry.id} className="border-border/30">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {new Date(entry.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {entry.tags.length > 0 && (
                <div className="flex gap-1">
                  {entry.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-purple-400 italic">{entry.prompt}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {entry.entry_text}
            </p>
            {entry.ai_reflection && (
              <div className="p-3 rounded-md bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="size-3 text-purple-400" />
                  <p className="text-xs font-medium text-purple-400">
                    Reflection
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {entry.ai_reflection}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
