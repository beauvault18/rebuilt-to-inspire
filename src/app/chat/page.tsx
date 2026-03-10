"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import type { ChatMessage } from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ChatPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [trainerName, setTrainerName] = useState("Coach");
  const [userName, setUserName] = useState("");
  const [cancerType, setCancerType] = useState("");

  // Load profile + conversation history
  useEffect(() => {
    try {
      const up = localStorage.getItem("rti_user_profile");
      if (up) {
        const parsed = JSON.parse(up);
        if (parsed.trainer_name) setTrainerName(parsed.trainer_name);
        if (parsed.first_name) setUserName(parsed.first_name);
        if (parsed.cancer_type) setCancerType(parsed.cancer_type);
      }
    } catch {}

    // Restore previous messages
    try {
      const saved = localStorage.getItem("rti_chat_messages");
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Persist messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("rti_chat_messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const hasFitness = !!sessionStorage.getItem("rti_plan");
      const hasNutrition = !!sessionStorage.getItem("rti_nutrition_plan");

      const history = messages.slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          trainer_name: trainerName,
          user_name: userName,
          cancer_type: cancerType,
          has_fitness_plan: hasFitness,
          has_nutrition_plan: hasNutrition,
          conversation_history: history,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-black shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="cursor-pointer"
        >
          <ArrowLeft className="size-4 mr-1" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold tracking-tight">
            Chat with {trainerName}
          </h1>
          <p className="text-xs text-muted-foreground">
            Your AI recovery companion
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="size-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto">
                <span className="text-2xl">💬</span>
              </div>
              <h2 className="text-xl font-semibold">
                Hey{userName ? ` ${userName}` : ""}, I&apos;m {trainerName}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                Ask me anything about your fitness plan, nutrition, recovery, or
                just check in. I&apos;m here to help you on your journey.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-4">
                {[
                  "What should I focus on this week?",
                  "Can I modify my workout today?",
                  "Tips for managing fatigue",
                  "How is my progress looking?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="text-sm px-4 py-2 rounded-full border border-surface-border bg-surface-card hover:bg-surface-elevated transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === "user"
                    ? "bg-brand text-white rounded-br-md"
                    : "bg-surface-card border border-surface-border rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" && (
                  <p className="text-xs font-semibold text-brand mb-1">
                    {trainerName}
                  </p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
                <p
                  className={`text-[10px] mt-1.5 ${
                    msg.role === "user"
                      ? "text-white/50"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-surface-card border border-surface-border rounded-2xl rounded-bl-md px-5 py-3">
                <p className="text-xs font-semibold text-brand mb-1">
                  {trainerName}
                </p>
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-black px-4 py-4 shrink-0">
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${trainerName}...`}
            rows={1}
            className="flex-1 resize-none rounded-xl bg-surface-card border border-surface-border px-4 py-3 text-sm focus:outline-none focus:border-brand/50 placeholder:text-muted-foreground/50"
            style={{ maxHeight: 120 }}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="h-11 w-11 rounded-xl bg-brand hover:bg-brand/90 cursor-pointer shrink-0"
            size="icon"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
