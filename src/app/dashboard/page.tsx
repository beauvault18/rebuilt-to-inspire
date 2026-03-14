"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  UtensilsCrossed,
  Brain,
  LogOut,
  ArrowRight,
  Moon,
  BookOpen,
  BarChart3,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getWeekNumber } from "@/lib/workout-storage";
import {
  shouldShowNutritionReflection,
  saveNutritionCheckIn,
  snoozeNutritionReflection,
  getNutritionCheckIns,
  markAdaptationPending,
} from "@/lib/nutrition-checkin-storage";
import { evaluateNutritionTrend } from "@/lib/nutrition-adaptation";
import NutritionReflectionBanner from "@/components/nutrition/NutritionReflectionBanner";
import NutritionReflectionModal from "@/components/nutrition/NutritionReflectionModal";
import type { PlanResponse, DayPlan } from "@/types/plan";
import type { NutritionPlanResponse, MealDay } from "@/types/nutrition";
import type { MoodEntry, JournalEntry } from "@/types/mental-health";
import type { PlanTracking } from "@/types/workout";
import type { NutritionCheckIn } from "@/types/nutrition-checkin";
import { MOOD_LABELS } from "@/types/mental-health";
import DashboardTour from "@/components/dashboard/DashboardTour";

function getTodayIndex(planLength: number): number {
  return new Date().getDay() % planLength;
}

function isRestDay(day: DayPlan): boolean {
  const focus = day.focus.toLowerCase();
  return (
    focus.includes("rest") ||
    focus.includes("recovery") ||
    !day.main ||
    day.main.length === 0
  );
}

function estimateDuration(day: DayPlan): number {
  const warmup = day.warmup?.duration_min || 0;
  const cooldown = day.cooldown?.duration_min || 0;
  const main = (day.main?.length || 0) * 4;
  return warmup + main + cooldown;
}


export default function DashboardPage() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const [fitnessPlan, setFitnessPlan] = useState<PlanResponse | null>(null);
  const [nutritionPlan, setNutritionPlan] =
    useState<NutritionPlanResponse | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [treatmentPhase, setTreatmentPhase] = useState<string | null>(null);
  const [weekNumber, setWeekNumber] = useState(1);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [reflectionDismissed, setReflectionDismissed] = useState(false);
  const [trainerName, setTrainerName] = useState("Coach");
  const [userName, setUserName] = useState("");
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    try {
      const fp = sessionStorage.getItem("rti_plan");
      if (fp) setFitnessPlan(JSON.parse(fp));
    } catch {}
    try {
      const np = sessionStorage.getItem("rti_nutrition_plan");
      if (np) setNutritionPlan(JSON.parse(np));
    } catch {}
    try {
      const me = localStorage.getItem("rti_mood_entries");
      if (me) setMoodEntries(JSON.parse(me));
    } catch {}
    try {
      const je = localStorage.getItem("rti_journal_entries");
      if (je) setJournalEntries(JSON.parse(je));
    } catch {}
    try {
      const nq = sessionStorage.getItem("rti_nutrition_questionnaire");
      if (nq) {
        const parsed = JSON.parse(nq);
        if (parsed.treatment_phase) setTreatmentPhase(parsed.treatment_phase);
      }
    } catch {}
    try {
      const pt = localStorage.getItem("rti_plan_tracking");
      if (pt) {
        const parsed = JSON.parse(pt) as PlanTracking;
        setWeekNumber(getWeekNumber(parsed));
      }
    } catch {}
    try {
      const up = localStorage.getItem("rti_user_profile");
      if (up) {
        const parsed = JSON.parse(up);
        if (parsed.trainer_name) setTrainerName(parsed.trainer_name);
        if (parsed.first_name) setUserName(parsed.first_name);
      }
    } catch {}
    // Show tour if arriving from onboarding or ?tour param
    const tourFlag = localStorage.getItem("rti_show_tour");
    const urlTour = new URLSearchParams(window.location.search).has("tour");
    if (tourFlag || urlTour) {
      setShowTour(true);
      localStorage.removeItem("rti_show_tour");
    }
  }, []);

  // Keep userName in sync with auth profile when it loads
  useEffect(() => {
    if (profile?.first_name && !userName) {
      setUserName(profile.first_name);
    }
  }, [profile, userName]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth");
    router.refresh();
  };

  // Pull name from multiple sources — Supabase profile, localStorage, or auth email
  const displayName = (() => {
    if (profile?.first_name) return profile.first_name;
    if (userName) return userName;
    // Last resort: try to get from localStorage directly
    try {
      const up = localStorage.getItem("rti_user_profile");
      if (up) {
        const parsed = JSON.parse(up);
        if (parsed.first_name) return parsed.first_name;
      }
    } catch {}
    return "friend";
  })();

  const hasFitness = fitnessPlan?.plan?.weekly_plan?.length;
  const hasNutrition = nutritionPlan?.meal_plan?.length;
  const hasMentalHealth = moodEntries.length > 0 || journalEntries.length > 0;

  const todayFitness = hasFitness
    ? fitnessPlan!.plan.weekly_plan![
        getTodayIndex(fitnessPlan!.plan.weekly_plan!.length)
      ]
    : null;

  const todayNutrition = hasNutrition
    ? nutritionPlan!.meal_plan[getTodayIndex(nutritionPlan!.meal_plan.length)]
    : null;

  const ctx = fitnessPlan?.progression_context;

  // Nutrition reflection advisory — only when nutrition plan exists
  const showNutritionReflection =
    hasNutrition && !reflectionDismissed && shouldShowNutritionReflection();

  const handleReflectionSubmit = (entry: NutritionCheckIn) => {
    saveNutritionCheckIn(entry);
    // Evaluate trend after save — adaptation is deferred to Plan tab
    const allCheckIns = getNutritionCheckIns();
    const trend = evaluateNutritionTrend(allCheckIns);
    if (trend) {
      markAdaptationPending(trend);
    }
    setReflectionOpen(false);
    setReflectionDismissed(true);
  };

  const handleReflectionSnooze = () => {
    snoozeNutritionReflection();
    setReflectionDismissed(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-border bg-black">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Rebuilt To Inspire
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Welcome back, {displayName} — {trainerName} is ready for you
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="size-4 mr-2" />
          Sign Out
        </Button>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-8 sm:py-12">
        <div className="max-w-[1200px] mx-auto space-y-6 w-full">
          {/* Heading */}
          <div className="text-center py-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Your Recovery Dashboard
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mt-3">
              Structured programming, built from your recovery profile.
            </p>
          </div>

          {/* Advisory Surface — Nutrition Reflection */}
          {showNutritionReflection && (
            <NutritionReflectionBanner
              onCheckIn={() => setReflectionOpen(true)}
              onSnooze={handleReflectionSnooze}
            />
          )}

          {/* All Four Pillars — 2x2 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Fitness */}
            <div id="tour-fitness" className="h-full">
              {todayFitness ? (
                <FitnessSummaryCard
                  day={todayFitness}
                  onClick={() => router.push("/plan")}
                />
              ) : (
                <StepTile
                  step="Step 1"
                  title="Fitness"
                  description="Stage-appropriate exercise programming built from your recovery profile"
                  Icon={Dumbbell}
                  color="text-brand"
                  stepColor="text-brand/70"
                  borderColor="border-brand/20 hover:border-brand/40"
                  onClick={() => router.push("/questionnaire")}
                />
              )}
            </div>

            {/* Nutrition */}
            <div id="tour-nutrition" className="h-full">
              {todayNutrition ? (
                <NutritionSummaryCard
                  day={todayNutrition}
                  onClick={() => router.push("/nutrition/plan")}
                />
              ) : (
                <StepTile
                  step="Step 2"
                  title="Nutrition"
                  description="Structured fueling built from your treatment profile and recovery needs"
                  Icon={UtensilsCrossed}
                  color="text-brand"
                  stepColor="text-brand/70"
                  borderColor="border-brand/20 hover:border-brand/40"
                  onClick={() => router.push("/nutrition")}
                />
              )}
            </div>

            {/* Recovery & Resilience */}
            <div id="tour-mental-health" className="h-full">
              {hasMentalHealth ? (
                <MentalHealthSummaryCard
                  moodEntries={moodEntries}
                  journalEntries={journalEntries}
                  onClick={() => router.push("/mental-health")}
                />
              ) : (
                <StepTile
                  step="Step 3"
                  title="Recovery & Resilience"
                  description="Recovery check-ins, breathwork, mood tracking, and journaling"
                  Icon={Brain}
                  color="text-purple-400"
                  stepColor="text-purple-500/70"
                  borderColor="hover:border-purple-500/50"
                  onClick={() => router.push("/mental-health")}
                />
              )}
            </div>

            {/* Chat */}
            <div id="tour-chat" className="h-full">
              <StepTile
                step="Step 4"
                title={`Chat with ${trainerName}`}
                description="Ask questions about your plan, nutrition, recovery, or just check in with your coach"
                Icon={MessageCircle}
                color="text-sky-400"
                stepColor="text-sky-500/70"
                borderColor="hover:border-sky-500/50"
                onClick={() => router.push("/chat")}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Nutrition Reflection Modal */}
      <NutritionReflectionModal
        open={reflectionOpen}
        onSubmit={handleReflectionSubmit}
        onClose={() => setReflectionOpen(false)}
      />

      {/* Guided Tour */}
      {showTour && (
        <DashboardTour
          trainerName={trainerName}
          firstName={displayName}
          onComplete={() => setShowTour(false)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step Tile                                                          */
/* ------------------------------------------------------------------ */

function StepTile({
  step,
  title,
  description,
  Icon,
  color,
  stepColor,
  borderColor,
  onClick,
}: {
  step: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  stepColor: string;
  borderColor: string;
  onClick: () => void;
}) {
  return (
    <div
      className={`cursor-pointer transition-all duration-200 bg-surface-card border border-surface-border rounded-2xl hover:bg-surface-elevated h-full ${borderColor}`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 lg:py-20 px-6 sm:px-10 lg:px-12 h-full min-h-[260px] sm:min-h-[300px] lg:min-h-[340px]">
        <p
          className={`text-xs sm:text-sm font-semibold uppercase tracking-widest mb-3 sm:mb-4 ${stepColor}`}
        >
          {step}
        </p>
        <Icon className={`size-10 sm:size-12 lg:size-14 ${color} mb-4 sm:mb-6`} />
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">{title}</h2>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fitness Summary Card                                               */
/* ------------------------------------------------------------------ */

function FitnessSummaryCard({
  day,
  onClick,
}: {
  day: DayPlan;
  onClick: () => void;
}) {
  const rest = isRestDay(day);
  const duration = estimateDuration(day);

  return (
    <div
      className="cursor-pointer transition-all duration-200 bg-surface-card border border-surface-border rounded-lg hover:bg-surface-elevated h-full"
      onClick={onClick}
    >
      <div>
        {/* Card header strip */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-surface-border/50">
          <div className="flex items-center gap-2.5">
            <Dumbbell className="size-5 text-brand" />
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Fitness
            </span>
          </div>
          <span className="text-sm text-muted-foreground">{day.day}</span>
        </div>

        <div className="px-7 py-6 space-y-6">
          {rest ? (
            <div className="text-center py-10">
              <Moon className="size-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-xl font-semibold">Rest Day</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Recovery is when your body gets stronger.
                <br />
                Light walking or stretching is fine.
              </p>
            </div>
          ) : (
            <>
              {/* Focus */}
              <div>
                <p className="text-base font-semibold mb-1">
                  Today&apos;s Focus
                </p>
                <p className="text-sm text-muted-foreground">{day.focus}</p>
              </div>

              {/* Stats row */}
              <div className="flex gap-4">
                <div className="flex-1 rounded-lg bg-muted/30 px-4 py-4 text-center">
                  <p className="text-3xl font-bold">{day.main?.length || 0}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                    Exercises
                  </p>
                </div>
                {duration > 0 && (
                  <div className="flex-1 rounded-lg bg-muted/30 px-4 py-4 text-center">
                    <p className="text-3xl font-bold">~{duration}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                      Minutes
                    </p>
                  </div>
                )}
              </div>

              {/* Exercise list */}
              <div className="space-y-2">
                {day.main?.slice(0, 4).map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-base text-muted-foreground"
                  >
                    <span className="size-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                    <span className="truncate">{ex.name}</span>
                  </div>
                ))}
                {(day.main?.length || 0) > 4 && (
                  <p className="text-sm text-muted-foreground/50 pl-4">
                    +{(day.main?.length || 0) - 4} more
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-surface-border/50">
          <span className="text-sm font-medium text-brand flex items-center gap-1.5">
            View Full Plan <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nutrition Summary Card                                             */
/* ------------------------------------------------------------------ */

function NutritionSummaryCard({
  day,
  onClick,
}: {
  day: MealDay;
  onClick: () => void;
}) {
  const mainMeals = day.meals.filter((m) => m.type !== "snack");
  const totalCal =
    day.daily_totals?.calories ??
    day.meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein =
    day.daily_totals?.protein_g ??
    day.meals.reduce((s, m) => s + (m.protein_g || 0), 0);

  return (
    <div
      className="cursor-pointer transition-all duration-200 bg-surface-card border border-surface-border rounded-lg hover:bg-surface-elevated h-full"
      onClick={onClick}
    >
      <div>
        {/* Card header strip */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-surface-border/50">
          <div className="flex items-center gap-2.5">
            <UtensilsCrossed className="size-5 text-brand" />
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Nutrition
            </span>
          </div>
          <span className="text-sm text-muted-foreground">{day.day}</span>
        </div>

        <div className="px-7 py-6 space-y-6">
          {/* Focus */}
          <div>
            <p className="text-base font-semibold mb-1">
              Today&apos;s Fueling
            </p>
            <p className="text-sm text-muted-foreground">
              {mainMeals.length} meal{mainMeals.length !== 1 ? "s" : ""} planned
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-4">
            <div className="flex-1 rounded-lg bg-muted/30 px-4 py-4 text-center">
              <p className="text-3xl font-bold">{totalCal.toLocaleString()}</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                Calories
              </p>
            </div>
            <div className="flex-1 rounded-lg bg-muted/30 px-4 py-4 text-center">
              <p className="text-3xl font-bold">{totalProtein}g</p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                Protein
              </p>
            </div>
          </div>

          {/* Meal list */}
          <div className="space-y-2">
            {mainMeals.slice(0, 4).map((meal, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-base text-muted-foreground"
              >
                <span className="size-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                <span className="truncate">{meal.name}</span>
              </div>
            ))}
            {mainMeals.length > 4 && (
              <p className="text-sm text-muted-foreground/50 pl-4">
                +{mainMeals.length - 4} more
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-surface-border/50">
          <span className="text-sm font-medium text-brand flex items-center gap-1.5">
            Open Today&apos;s Fueling <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* Mental Health Summary Card                                         */
/* ------------------------------------------------------------------ */

function MentalHealthSummaryCard({
  moodEntries,
  journalEntries,
  onClick,
}: {
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  onClick: () => void;
}) {
  const todayISO = new Date().toISOString().split("T")[0];
  const todayMood = moodEntries.find((e) => e.date === todayISO);
  const latestMood = moodEntries.length
    ? moodEntries[moodEntries.length - 1]
    : null;

  return (
    <div
      className="cursor-pointer transition-all duration-200 bg-surface-card border border-surface-border rounded-lg hover:bg-surface-elevated h-full"
      onClick={onClick}
    >
      <div>
        {/* Card header strip */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-surface-border/50">
          <div className="flex items-center gap-2.5">
            <Brain className="size-4 text-purple-400" />
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recovery & Resilience
            </span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Mood status */}
          <div className="flex items-center gap-4">
            <div className="size-11 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <BarChart3 className="size-5 text-blue-400" />
            </div>
            {todayMood ? (
              <div>
                <p className="text-base font-medium">
                  Mood: {todayMood.mood}/10
                </p>
                <p className="text-sm text-blue-400">
                  {MOOD_LABELS[todayMood.mood]}
                </p>
              </div>
            ) : latestMood ? (
              <div>
                <p className="text-base font-medium">
                  Last: {latestMood.mood}/10
                </p>
                <p className="text-sm text-muted-foreground">
                  Check in today
                </p>
              </div>
            ) : (
              <div>
                <p className="text-base font-medium">Mood Tracker</p>
                <p className="text-sm text-muted-foreground">
                  {moodEntries.length} entries logged
                </p>
              </div>
            )}
          </div>

          {/* Journal status */}
          <div className="flex items-center gap-4">
            <div className="size-11 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <BookOpen className="size-5 text-purple-400" />
            </div>
            <div>
              <p className="text-base font-medium">
                {journalEntries.length} Journal{" "}
                {journalEntries.length === 1 ? "Entry" : "Entries"}
              </p>
              {journalEntries.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Last:{" "}
                  {new Date(
                    journalEntries[journalEntries.length - 1].date,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-surface-border/50">
          <span className="text-sm font-medium text-purple-400 flex items-center gap-1.5">
            Open <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
