"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wind, BarChart3, BookHeart, Phone } from "lucide-react";
import SiteHeader from "@/components/shared/SiteHeader";
import BreathworkSection from "./BreathworkSection";
import MoodTrackerSection from "./MoodTrackerSection";
import JournalingSection from "./JournalingSection";

type Section = "hub" | "breathwork" | "mood" | "journal";

const SECTIONS = [
  {
    id: "breathwork" as Section,
    title: "Guided Breathwork",
    description:
      "Breathing exercises designed for cancer survivors — calm scanxiety, reduce stress, improve sleep",
    icon: Wind,
    color: "text-teal-400",
    borderColor: "border-teal-500/30 hover:border-teal-500/60",
    bgGlow: "bg-teal-500/5",
  },
  {
    id: "mood" as Section,
    title: "Mood Tracker",
    description:
      "Track your emotional well-being over time — mood, anxiety, energy, and fear of recurrence",
    icon: BarChart3,
    color: "text-blue-400",
    borderColor: "border-blue-500/30 hover:border-blue-500/60",
    bgGlow: "bg-blue-500/5",
  },
  {
    id: "journal" as Section,
    title: "Gratitude & Journaling",
    description:
      "Cancer-specific writing prompts with AI-powered gentle reflections to support your healing",
    icon: BookHeart,
    color: "text-purple-400",
    borderColor: "border-purple-500/30 hover:border-purple-500/60",
    bgGlow: "bg-purple-500/5",
  },
];

export default function MentalHealthHub() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("hub");

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Crisis Banner — always visible */}
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <Phone className="size-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">
            If you are in crisis, call or text{" "}
            <a
              href="tel:988"
              className="font-bold underline underline-offset-2"
            >
              988
            </a>{" "}
            (Suicide & Crisis Lifeline) or the Cancer Support Helpline at{" "}
            <a
              href="tel:1-888-939-3333"
              className="font-bold underline underline-offset-2"
            >
              1-888-939-3333
            </a>
            . This app is not a substitute for professional mental health care.
          </p>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => {
              if (activeSection === "hub") {
                router.push("/dashboard");
              } else {
                setActiveSection("hub");
              }
            }}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            {activeSection === "hub" ? "Dashboard" : "Back to Mental Health"}
          </Button>
          <h1 className="text-2xl font-bold">Mental Health</h1>
          <div className="w-[120px]" />
        </div>

        {/* Hub View — 3 Cards */}
        {activeSection === "hub" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SECTIONS.map((section) => (
              <Card
                key={section.id}
                className={`cursor-pointer transition-all border-2 ${section.borderColor} ${section.bgGlow}`}
                onClick={() => setActiveSection(section.id)}
              >
                <CardContent className="flex flex-col items-center text-center py-10 px-6">
                  <section.icon className={`size-14 ${section.color} mb-5`} />
                  <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Active Section */}
        {activeSection === "breathwork" && <BreathworkSection />}
        {activeSection === "mood" && <MoodTrackerSection />}
        {activeSection === "journal" && <JournalingSection />}
      </div>
      </div>
    </div>
  );
}
