"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  UtensilsCrossed,
  Brain,
  LogOut,
  ArrowRight,
  Clock,
  Flame,
  Moon,
  BookOpen,
  BarChart3,
  Sunrise,
  Sun,
  Sunset,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import type { PlanResponse, DayPlan } from "@/types/plan";
import type { NutritionPlanResponse, MealDay } from "@/types/nutrition";
import type { MoodEntry, JournalEntry } from "@/types/mental-health";
import { MOOD_LABELS } from "@/types/mental-health";

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

const MEAL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Sunset,
};

export default function DashboardPage() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const [fitnessPlan, setFitnessPlan] = useState<PlanResponse | null>(null);
  const [nutritionPlan, setNutritionPlan] =
    useState<NutritionPlanResponse | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

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
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth");
    router.refresh();
  };

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Rebuilt To Inspire
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {profile?.first_name || "friend"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="size-4 mr-2" />
          Sign Out
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-8 py-12 -mt-28">
        <div className="max-w-7xl w-full space-y-10">
          <div className="text-center -mt-14">
            <h2 className="text-4xl font-bold tracking-tight">
              Start Rebuilding Your Journey Here
            </h2>
            <p className="text-lg text-muted-foreground mt-3">
              Complete each step to create your personalized homepage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            {/* Fitness */}
            {todayFitness ? (
              <FitnessSummaryCard
                day={todayFitness}
                onClick={() => router.push("/plan")}
              />
            ) : (
              <StepTile
                step="Step 1"
                title="Fitness"
                description="AI-generated exercise plans tailored to your cancer recovery journey"
                Icon={Dumbbell}
                color="text-green-400"
                stepColor="text-green-500/70"
                borderColor="hover:border-green-500/50"
                onClick={() => router.push("/questionnaire")}
              />
            )}

            {/* Nutrition */}
            {todayNutrition ? (
              <NutritionSummaryCard
                day={todayNutrition}
                onClick={() => router.push("/nutrition/plan")}
              />
            ) : (
              <StepTile
                step="Step 2"
                title="Nutrition"
                description="Personalized meal plans and dietary guidance for cancer survivors"
                Icon={UtensilsCrossed}
                color="text-orange-400"
                stepColor="text-orange-500/70"
                borderColor="hover:border-orange-500/50"
                onClick={() => router.push("/nutrition")}
              />
            )}

            {/* Mental Health */}
            {hasMentalHealth ? (
              <MentalHealthSummaryCard
                moodEntries={moodEntries}
                journalEntries={journalEntries}
                onClick={() => router.push("/mental-health")}
              />
            ) : (
              <StepTile
                step="Step 3"
                title="Mental Health"
                description="Guided journaling, mood tracking, and coping strategies"
                Icon={Brain}
                color="text-purple-400"
                stepColor="text-purple-500/70"
                borderColor="hover:border-purple-500/50"
                onClick={() => router.push("/mental-health")}
              />
            )}
          </div>
        </div>
      </main>
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
    <Card
      className={`cursor-pointer transition-all border-2 ${borderColor}`}
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center text-center py-16 px-8">
        <p
          className={`text-sm font-semibold uppercase tracking-widest mb-5 ${stepColor}`}
        >
          {step}
        </p>
        <Icon className={`size-20 ${color} mb-8`} />
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-base text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
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
    <Card
      className="cursor-pointer transition-all border border-green-500/20 hover:border-green-500/40 bg-green-500/[0.03]"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Card header strip */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-green-500/10">
          <div className="flex items-center gap-2.5">
            <Dumbbell className="size-5 text-green-400" />
            <span className="text-sm font-semibold uppercase tracking-wider text-green-400">
              Fitness
            </span>
          </div>
          <span className="text-sm text-muted-foreground">{day.day}</span>
        </div>

        <div className="px-7 py-6 space-y-6">
          {rest ? (
            <div className="text-center py-10">
              <Moon className="size-12 text-green-400/30 mx-auto mb-4" />
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
                    <span className="size-1.5 rounded-full bg-green-400 shrink-0" />
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
        <div className="px-7 py-4 border-t border-green-500/10">
          <span className="text-sm font-medium text-green-400 flex items-center gap-1.5">
            View Full Plan <ArrowRight className="size-4" />
          </span>
        </div>
      </CardContent>
    </Card>
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

  return (
    <Card
      className="cursor-pointer transition-all border border-orange-500/20 hover:border-orange-500/40 bg-orange-500/[0.03]"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Card header strip */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-orange-500/10">
          <div className="flex items-center gap-2.5">
            <UtensilsCrossed className="size-5 text-orange-400" />
            <span className="text-sm font-semibold uppercase tracking-wider text-orange-400">
              Nutrition
            </span>
          </div>
          <span className="text-sm text-muted-foreground">{day.day}</span>
        </div>

        <div className="px-7 py-6 space-y-6">
          {/* Calorie badge */}
          <div className="flex items-center gap-2.5">
            <Flame className="size-5 text-orange-400" />
            <span className="text-lg font-semibold">
              {totalCal.toLocaleString()} calories
            </span>
          </div>

          {/* Meals list */}
          <div className="space-y-4">
            {mainMeals.map((meal, i) => {
              const MealIcon = MEAL_ICON[meal.type] || Sun;
              return (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="size-9 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
                    <MealIcon className="size-4.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium leading-tight truncate">
                      {meal.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      <span className="capitalize">{meal.type}</span>
                      <span className="mx-1.5 text-border">|</span>
                      {meal.calories} cal
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Macros */}
          {day.daily_totals && (
            <div className="flex gap-3">
              <MacroPill label="Protein" value={`${day.daily_totals.protein_g}g`} />
              <MacroPill label="Carbs" value={`${day.daily_totals.carbs_g}g`} />
              <MacroPill label="Fat" value={`${day.daily_totals.fat_g}g`} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-orange-500/10">
          <span className="text-sm font-medium text-orange-400 flex items-center gap-1.5">
            View Full Plan <ArrowRight className="size-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function MacroPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-lg bg-muted/30 px-3 py-3 text-center">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
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
    <Card
      className="cursor-pointer transition-all border border-purple-500/20 hover:border-purple-500/40 bg-purple-500/[0.03]"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Card header strip */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-purple-500/10">
          <div className="flex items-center gap-2.5">
            <Brain className="size-5 text-purple-400" />
            <span className="text-sm font-semibold uppercase tracking-wider text-purple-400">
              Mental Health
            </span>
          </div>
        </div>

        <div className="px-7 py-6 space-y-5">
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
        <div className="px-7 py-4 border-t border-purple-500/10">
          <span className="text-sm font-medium text-purple-400 flex items-center gap-1.5">
            Open <ArrowRight className="size-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
