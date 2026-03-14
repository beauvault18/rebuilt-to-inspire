"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FadeTransition from "@/components/shared/FadeTransition";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import QuestionLayout from "./QuestionLayout";
import OptionCard from "./OptionCard";
import InfoTip from "./InfoTip";
import StepWelcome from "./StepWelcome";
import StepEvidence from "./StepEvidence";
import { useQuestionnaireForm } from "@/hooks/useQuestionnaireForm";
import { generatePlan } from "@/lib/api";
import type { QuestionnaireData } from "@/types/questionnaire";
import {
  CANCER_TYPES,
  CANCER_STAGE_OPTIONS,
  TREATMENT_TYPES,
  SURGERY_TYPES,
  SYMPTOM_SEVERITIES,
  ACTIVITY_LEVELS,
  PRE_DIAGNOSIS_ACTIVITIES,
  PRIMARY_GOALS,
  LONG_TERM_AMBITIONS,
  EQUIPMENT_OPTIONS,
  LYMPHEDEMA_STATUSES,
  BONE_MET_OPTIONS,
  BONE_MET_LOCATIONS,
  SLEEP_OPTIONS,
  DAYS_OPTIONS,
  DURATION_OPTIONS,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------
interface StepDef {
  id: string;
  validate: (d: QuestionnaireData) => boolean;
  condition?: (d: QuestionnaireData) => boolean;
}

const STEPS: StepDef[] = [
  // Intro
  { id: "welcome", validate: () => true },
  { id: "evidence", validate: () => true },

  // Clearance
  { id: "clearance", validate: (d) => d.clinician_clearance },

  // Cancer history
  { id: "cancer_type", validate: (d) => d.cancer_types.length > 0 },
  {
    id: "treatment_date",
    validate: (d) => /^\d{4}-\d{2}$/.test(d.remissionDate),
  },
  { id: "treatments", validate: () => true },
  { id: "surgery", validate: () => true },

  // Symptoms
  { id: "fatigue", validate: () => true },
  { id: "pain", validate: () => true },
  { id: "neuropathy", validate: () => true },
  { id: "balance", validate: () => true },
  {
    id: "dyspnea",
    validate: () => true,
    condition: (d) => d.cancer_types.includes("lung"),
  },
  {
    id: "incontinence",
    validate: () => true,
    condition: (d) => d.cancer_types.includes("prostate"),
  },

  // Medical conditions
  { id: "medical", validate: () => true },

  // Fitness profile
  { id: "pre_activity", validate: () => true },
  { id: "current_activity", validate: () => true },

  // Goals
  { id: "goal", validate: (d) => d.primary_goal !== "" },
  { id: "ambition", validate: () => true },

  // Schedule & equipment
  { id: "days", validate: () => true },
  { id: "duration", validate: () => true },
  { id: "equipment", validate: () => true },

  // Sleep (NEW)
  { id: "sleep", validate: () => true },

  // Personal
  { id: "age", validate: (d) => d.age >= 18 },
  { id: "sex", validate: () => true },
  {
    id: "height_weight",
    validate: (d) => d.heightFeet > 0 && d.currentWeight > 0,
  },
];

// ---------------------------------------------------------------------------
// Month/Year helpers
// ---------------------------------------------------------------------------
const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function getYearOptions() {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= current - 30; y--) years.push(y);
  return years;
}

function parseMonthYear(v: string) {
  if (!v) return { month: "", year: "" };
  const [y, m] = v.split("-");
  return { month: m || "", year: y || "" };
}

function buildMonthYear(month: string, year: string) {
  if (!month && !year) return "";
  return `${year || ""}-${month || ""}`;
}

// Estimate weekly minutes from activity level
function minutesFromLevel(level: string): number {
  switch (level) {
    case "light":
      return 60;
    case "moderate":
      return 150;
    case "active":
      return 300;
    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------
export default function QuestionnaireShell() {
  const router = useRouter();
  const {
    data,
    setField,
    toggleInList,
    addToList,
    removeFromList,
    getApiPayload,
  } = useQuestionnaireForm();
  const [stepIndex, setStepIndex] = useState(0);
  const [show, setShow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Restriction input state (for clearance step)
  const [restriction, setRestriction] = useState("");

  // Compute active steps (filter out conditional ones that don't apply)
  const activeSteps = useMemo(
    () => STEPS.filter((s) => !s.condition || s.condition(data)),
    [data],
  );

  const currentStep = activeSteps[stepIndex] || activeSteps[0];
  const totalSteps = activeSteps.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  const canProceed = useCallback(
    () => currentStep.validate(data),
    [currentStep, data],
  );

  // Get filtered surgery types based on selected cancer types
  const filteredSurgeries = useMemo(
    () =>
      SURGERY_TYPES.filter(
        (st) =>
          st.cancerType === null ||
          data.cancer_types.includes(st.cancerType),
      ),
    [data.cancer_types],
  );

  // Navigation
  const handleNext = useCallback(async () => {
    if (!canProceed()) return;

    if (isLast) {
      setIsSubmitting(true);
      setShow(false);
      setError("");
      try {
        // Auto-estimate minutes from activity level
        data.minutes_per_week_current = minutesFromLevel(
          data.current_activity_level,
        );
        const payload = getApiPayload();
        const response = await generatePlan({
          questionnaire: payload,
          top_k: 5,
        });
        sessionStorage.setItem("rti_plan", JSON.stringify(response));
        sessionStorage.setItem(
          "rti_questionnaire",
          JSON.stringify({ questionnaire: payload, top_k: 5 }),
        );
        sessionStorage.setItem(
          "rti_profile",
          JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
          }),
        );
        sessionStorage.removeItem("rti_stage_revealed");
        router.push("/plan");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate plan. Is the backend running?",
        );
        setIsSubmitting(false);
        setShow(true);
      }
      return;
    }

    setDirection("forward");
    setShow(false);
  }, [canProceed, isLast, getApiPayload, data, router]);

  const handleBack = useCallback(() => {
    if (isFirst) return;
    setDirection("back");
    setShow(false);
  }, [isFirst]);

  const handleExited = useCallback(() => {
    if (isSubmitting) {
      router.push("/plan");
      return;
    }
    if (direction === "forward" && !isLast) {
      setStepIndex((s) => Math.min(s + 1, totalSteps - 1));
    } else if (direction === "back" && !isFirst) {
      setStepIndex((s) => Math.max(s - 1, 0));
    }
    setShow(true);
  }, [isSubmitting, router, direction, isLast, isFirst, totalSteps]);

  // Loading state
  if (isSubmitting && !show) {
    return <LoadingSpinner />;
  }

  const years = getYearOptions();
  const remission = parseMonthYear(data.remissionDate);

  // -------------------------------------------------------------------
  // Severity helper
  // -------------------------------------------------------------------
  function renderSeverity(
    title: string,
    description: string,
    value: string,
    onChange: (v: string) => void,
  ) {
    return (
      <QuestionLayout title={title} description={description}>
        <div className="space-y-4">
          {SYMPTOM_SEVERITIES.map((s) => (
            <OptionCard
              key={s.value}
              label={s.label}
              selected={value === s.value}
              onClick={() => onChange(s.value)}
            />
          ))}
        </div>
      </QuestionLayout>
    );
  }

  // -------------------------------------------------------------------
  // Medical conditions (grouped step)
  // -------------------------------------------------------------------
  function renderMedicalConditions() {
    const hasColorectal = data.cancer_types.includes("colorectal");
    const hasTesticular = data.cancer_types.includes("testicular");

    return (
      <QuestionLayout
        title="Medical Details"
        description="Check any that apply to your situation."
      >
        <div className="space-y-4">
          {/* Lymphedema */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Lymphedema Status</span>
              <InfoTip
                term="Lymphedema"
                definition="Swelling caused by a buildup of lymph fluid, usually in the arms or legs. It can happen when lymph nodes are removed or damaged during cancer treatment. Symptoms include heaviness, tightness, or visible swelling in the affected limb."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {LYMPHEDEMA_STATUSES.map((ls) => (
                <button
                  key={ls.value}
                  type="button"
                  onClick={() => setField("lymphedema_status", ls.value)}
                  className={`px-5 py-3.5 rounded-xl border text-base font-medium transition-all ${
                    data.lymphedema_status === ls.value
                      ? "border-brand bg-brand/8 text-foreground"
                      : "border-surface-border text-muted-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  {ls.label}
                </button>
              ))}
            </div>
          </div>

          {data.lymphedema_status !== "none" && (
            <Input
              value={data.lymphedema_limb || ""}
              onChange={(e) =>
                setField("lymphedema_limb", e.target.value || null)
              }
              placeholder="Affected limb (e.g. left arm)"
              className="h-14 text-lg rounded-2xl"
            />
          )}

          {/* Conditional: ostomy */}
          {hasColorectal && (
            <label className="flex items-center gap-4 px-7 py-5 rounded-2xl border-2 border-surface-border cursor-pointer hover:border-muted-foreground/25 transition-colors">
              <Checkbox
                checked={data.has_ostomy}
                onCheckedChange={(v) => setField("has_ostomy", !!v)}
                className="size-5"
              />
              <span className="text-lg">
                I have a colostomy or ileostomy
              </span>
            </label>
          )}

          {/* Conditional: RPLND */}
          {hasTesticular && (
            <label className="flex items-center gap-4 px-7 py-5 rounded-2xl border-2 border-surface-border cursor-pointer hover:border-muted-foreground/25 transition-colors">
              <Checkbox
                checked={data.had_rplnd}
                onCheckedChange={(v) => setField("had_rplnd", !!v)}
                className="size-5"
              />
              <span className="text-lg">
                I had RPLND (retroperitoneal lymph node dissection)
              </span>
            </label>
          )}

          {/* Hormone therapy */}
          <label className="flex items-center gap-4 px-7 py-5 rounded-2xl border-2 border-surface-border cursor-pointer hover:border-muted-foreground/25 transition-colors">
            <Checkbox
              checked={data.on_hormone_therapy}
              onCheckedChange={(v) =>
                setField("on_hormone_therapy", !!v)
              }
              className="size-5"
            />
            <span className="text-lg">
              Currently on hormone therapy (ADT or aromatase inhibitors)
            </span>
          </label>

          {/* Bone metastases */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Bone Metastases</span>
              <InfoTip
                term="Bone Metastases"
                definition="Cancer that has spread from its original site to the bones. This can affect bone strength and increase the risk of fractures. Knowing this helps us adjust your exercise plan to keep movements safe and avoid high-impact activities."
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {BONE_MET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setField("bone_metastases", opt.value)}
                  className={`px-5 py-3.5 rounded-xl border text-base font-medium transition-all ${
                    data.bone_metastases === opt.value
                      ? "border-brand bg-brand/8 text-foreground"
                      : "border-surface-border text-muted-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {data.bone_metastases === "yes" && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Bone metastases locations
              </Label>
              <div className="flex flex-wrap gap-2">
                {BONE_MET_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() =>
                      toggleInList(
                        "bone_metastases_locations",
                        loc.toLowerCase(),
                      )
                    }
                    className={`px-5 py-3 rounded-xl border text-base transition-all ${
                      data.bone_metastases_locations.includes(
                        loc.toLowerCase(),
                      )
                        ? "border-brand bg-brand/8 font-medium text-foreground"
                        : "border-surface-border text-muted-foreground hover:border-muted-foreground/30"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Heart or lung disease */}
          <label className="flex items-center gap-4 px-7 py-5 rounded-2xl border-2 border-surface-border cursor-pointer hover:border-muted-foreground/25 transition-colors">
            <Checkbox
              checked={data.heart_or_lung_disease}
              onCheckedChange={(v) =>
                setField("heart_or_lung_disease", !!v)
              }
              className="size-5"
            />
            <span className="text-lg">
              I have a heart or lung condition
            </span>
          </label>
        </div>
      </QuestionLayout>
    );
  }

  // -------------------------------------------------------------------
  // Step renderer
  // -------------------------------------------------------------------
  const renderStep = () => {
    switch (currentStep.id) {
      // --- Intro ---
      case "welcome":
        return <StepWelcome />;
      case "evidence":
        return <StepEvidence />;

      // --- Clearance ---
      case "clearance":
        return (
          <QuestionLayout
            title="Medical Clearance"
            description="This tool is designed for individuals who have received medical clearance to exercise."
          >
            <div className="space-y-5">
              <button
                type="button"
                onClick={() =>
                  setField(
                    "clinician_clearance",
                    !data.clinician_clearance,
                  )
                }
                className={`w-full text-left px-7 py-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                  data.clinician_clearance
                    ? "border-brand bg-brand/8 ring-1 ring-brand/20"
                    : "border-surface-border hover:border-muted-foreground/25"
                }`}
              >
                <Checkbox
                  checked={data.clinician_clearance}
                  onCheckedChange={(v) =>
                    setField("clinician_clearance", !!v)
                  }
                  className="size-6 pointer-events-none"
                />
                <div>
                  <p className="text-lg font-medium">
                    I have been cleared for exercise by my doctor or oncologist
                  </p>
                  <p className="text-base text-muted-foreground mt-1">
                    Please consult your care team before proceeding.
                  </p>
                </div>
              </button>

              <div className="space-y-4">
                <Label className="text-sm text-muted-foreground">
                  Clinician restrictions{" "}
                  <span className="opacity-60">(optional)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={restriction}
                    onChange={(e) => setRestriction(e.target.value)}
                    placeholder="e.g. No overhead lifting"
                    className="h-14 text-lg rounded-2xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = restriction.trim();
                        if (trimmed) {
                          addToList("clinician_restrictions", trimmed);
                          setRestriction("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      const trimmed = restriction.trim();
                      if (trimmed) {
                        addToList("clinician_restrictions", trimmed);
                        setRestriction("");
                      }
                    }}
                    disabled={!restriction.trim()}
                  >
                    Add
                  </Button>
                </div>
                {data.clinician_restrictions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {data.clinician_restrictions.map((r) => (
                      <Badge
                        key={r}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() =>
                          removeFromList("clinician_restrictions", r)
                        }
                      >
                        {r} &times;
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </QuestionLayout>
        );

      // --- Cancer type ---
      case "cancer_type":
        return (
          <QuestionLayout
            title="What type of cancer were you diagnosed with?"
            description="Select all that apply."
          >
            <div className="space-y-4">
              {CANCER_TYPES.map((ct) => {
                const isSelected = data.cancer_types.includes(ct.value);
                const stage = data.cancer_stages[ct.value] || "";
                return (
                  <div key={ct.value} className="space-y-0">
                    <OptionCard
                      label={ct.label}
                      selected={isSelected}
                      onClick={() => {
                        toggleInList("cancer_types", ct.value);
                        // Clean up stage when deselecting
                        if (isSelected) {
                          const updated = { ...data.cancer_stages };
                          delete updated[ct.value];
                          setField("cancer_stages", updated);
                        }
                      }}
                    />
                    {isSelected && (
                      <div className="ml-4 mt-2 mb-1">
                        <div className="flex flex-wrap gap-2">
                          {CANCER_STAGE_OPTIONS.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() =>
                                setField("cancer_stages", {
                                  ...data.cancer_stages,
                                  [ct.value]: s.value,
                                })
                              }
                              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                stage === s.value
                                  ? "border-brand bg-brand/8 text-foreground"
                                  : "border-surface-border text-muted-foreground hover:border-muted-foreground/30"
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </QuestionLayout>
        );

      // --- Treatment date ---
      case "treatment_date":
        return (
          <QuestionLayout
            title="When did you go into remission?"
            description="This helps us understand where you are in recovery."
          >
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={remission.month}
                onValueChange={(m) =>
                  setField(
                    "remissionDate",
                    buildMonthYear(m, remission.year),
                  )
                }
              >
                <SelectTrigger className="h-14 text-lg rounded-2xl">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={remission.year}
                onValueChange={(y) =>
                  setField(
                    "remissionDate",
                    buildMonthYear(remission.month, y),
                  )
                }
              >
                <SelectTrigger className="h-14 text-lg rounded-2xl">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </QuestionLayout>
        );

      // --- Treatments received ---
      case "treatments":
        return (
          <QuestionLayout
            title="What treatments did you receive?"
            description="Select all that apply."
          >
            <div className="space-y-4">
              {TREATMENT_TYPES.map((tt) => {
                const isSelected = data.treatments_received.includes(tt.value);
                const dateVal = data.treatment_dates[tt.value] || "";
                const parsed = parseMonthYear(dateVal);
                return (
                  <div key={tt.value} className="space-y-0">
                    <OptionCard
                      label={tt.label}
                      selected={isSelected}
                      onClick={() => {
                        toggleInList("treatments_received", tt.value);
                        if (isSelected) {
                          const updated = { ...data.treatment_dates };
                          delete updated[tt.value];
                          setField("treatment_dates", updated);
                        }
                      }}
                    />
                    {isSelected && (
                      <div className="ml-4 mt-2 mb-1">
                        <p className="text-sm text-muted-foreground mb-2">
                          When was your last {tt.label.toLowerCase()} treatment?
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <Select
                            value={parsed.month}
                            onValueChange={(m) =>
                              setField("treatment_dates", {
                                ...data.treatment_dates,
                                [tt.value]: buildMonthYear(m, parsed.year),
                              })
                            }
                          >
                            <SelectTrigger className="h-12 text-base rounded-xl">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {MONTHS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={parsed.year}
                            onValueChange={(y) =>
                              setField("treatment_dates", {
                                ...data.treatment_dates,
                                [tt.value]: buildMonthYear(parsed.month, y),
                              })
                            }
                          >
                            <SelectTrigger className="h-12 text-base rounded-xl">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map((y) => (
                                <SelectItem key={y} value={String(y)}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </QuestionLayout>
        );

      // --- Surgery type ---
      case "surgery": {
        const surgDate = parseMonthYear(data.surgeryDate);
        const showSurgeryDate =
          data.surgery_type !== "none" && data.surgery_type !== "";
        return (
          <QuestionLayout
            title="Did you have surgery?"
            description="Select the type of surgery, if any."
          >
            <div className="space-y-4">
              {filteredSurgeries.map((st) => (
                <OptionCard
                  key={st.value}
                  label={st.label}
                  selected={data.surgery_type === st.value}
                  onClick={() => {
                    setField("surgery_type", st.value);
                    if (st.value === "none") setField("surgeryDate", "");
                  }}
                />
              ))}
              {showSurgeryDate && (
                <div className="ml-4 mt-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    When was your surgery?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      value={surgDate.month}
                      onValueChange={(m) =>
                        setField(
                          "surgeryDate",
                          buildMonthYear(m, surgDate.year),
                        )
                      }
                    >
                      <SelectTrigger className="h-12 text-base rounded-xl">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={surgDate.year}
                      onValueChange={(y) =>
                        setField(
                          "surgeryDate",
                          buildMonthYear(surgDate.month, y),
                        )
                      }
                    >
                      <SelectTrigger className="h-12 text-base rounded-xl">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </QuestionLayout>
        );
      }

      // --- Symptoms ---
      case "fatigue":
        return renderSeverity(
          "How would you rate your current fatigue?",
          "General tiredness or lack of energy.",
          data.fatigue,
          (v) => setField("fatigue", v),
        );
      case "pain":
        return renderSeverity(
          "How would you rate your current pain?",
          "Ongoing pain related to cancer or treatment.",
          data.pain,
          (v) => setField("pain", v),
        );
      case "neuropathy":
        return renderSeverity(
          "Do you experience neuropathy?",
          "Tingling, numbness, or reduced sensation in hands or feet.",
          data.neuropathy,
          (v) => setField("neuropathy", v),
        );
      case "balance":
        return renderSeverity(
          "Do you have balance difficulties?",
          "Difficulty with balance or coordination.",
          data.balance_issues,
          (v) => setField("balance_issues", v),
        );
      case "dyspnea":
        return renderSeverity(
          "Do you experience shortness of breath?",
          "Difficulty breathing during daily activities.",
          data.dyspnea,
          (v) => setField("dyspnea", v),
        );
      case "incontinence":
        return renderSeverity(
          "Do you experience urinary incontinence?",
          "Bladder control difficulties.",
          data.urinary_incontinence,
          (v) => setField("urinary_incontinence", v),
        );

      // --- Medical conditions ---
      case "medical":
        return renderMedicalConditions();

      // --- Fitness profile ---
      case "pre_activity":
        return (
          <QuestionLayout
            title="How active were you before diagnosis?"
            description="This helps us understand your training baseline."
          >
            <div className="space-y-4">
              {PRE_DIAGNOSIS_ACTIVITIES.map((al) => (
                <OptionCard
                  key={al.value}
                  label={al.label}
                  description={al.description}
                  selected={data.pre_diagnosis_activity === al.value}
                  onClick={() =>
                    setField("pre_diagnosis_activity", al.value)
                  }
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "current_activity":
        return (
          <QuestionLayout
            title="How active are you now?"
            description="Be honest — this helps us start you at the right level."
          >
            <div className="space-y-4">
              {ACTIVITY_LEVELS.map((al) => (
                <OptionCard
                  key={al.value}
                  label={al.label}
                  description={al.description}
                  selected={data.current_activity_level === al.value}
                  onClick={() =>
                    setField("current_activity_level", al.value)
                  }
                />
              ))}
            </div>
          </QuestionLayout>
        );

      // --- Goals ---
      case "goal":
        return (
          <QuestionLayout
            title="What matters most to you right now?"
            description="Your primary goal drives your program structure."
          >
            <div className="space-y-4">
              {PRIMARY_GOALS.map((g) => (
                <OptionCard
                  key={g.value}
                  label={g.label}
                  description={g.description}
                  selected={data.primary_goal === g.value}
                  onClick={() => setField("primary_goal", g.value)}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "ambition":
        return (
          <QuestionLayout
            title="Where do you see yourself heading?"
            description="This shapes how we build your progression over the coming months."
          >
            <div className="space-y-4">
              {LONG_TERM_AMBITIONS.map((a) => (
                <OptionCard
                  key={a.value}
                  label={a.label}
                  description={a.description}
                  selected={data.long_term_ambition === a.value}
                  onClick={() => setField("long_term_ambition", a.value)}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      // --- Schedule & equipment ---
      case "days": {
        const WEEKDAYS = [
          { value: "monday", label: "Mon" },
          { value: "tuesday", label: "Tue" },
          { value: "wednesday", label: "Wed" },
          { value: "thursday", label: "Thu" },
          { value: "friday", label: "Fri" },
          { value: "saturday", label: "Sat" },
          { value: "sunday", label: "Sun" },
        ];
        const isFlexible = data.preferred_days.includes("flexible");
        const toggleDay = (day: string) => {
          if (day === "flexible") {
            setField("preferred_days", ["flexible"]);
            return;
          }
          const current = data.preferred_days.filter((d) => d !== "flexible");
          const updated = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day];
          setField("preferred_days", updated);
          setField("days_available", updated.length || 3);
        };
        return (
          <QuestionLayout
            title="How many days can you train?"
            description="We'll build your schedule around your availability."
          >
            <div className="space-y-6">
              {DAYS_OPTIONS.map((d) => (
                <OptionCard
                  key={d.value}
                  label={d.label}
                  selected={data.days_available === parseInt(d.value)}
                  onClick={() => {
                    setField("days_available", parseInt(d.value));
                    // Reset preferred days when changing count
                    if (!isFlexible) {
                      setField("preferred_days", []);
                    }
                  }}
                />
              ))}

              {/* Day picker */}
              {data.days_available > 0 && (
                <div className="space-y-3 pt-2">
                  <p className="text-sm text-muted-foreground">
                    Which days work best?
                  </p>
                  <div className="flex gap-2">
                    {WEEKDAYS.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          !isFlexible && data.preferred_days.includes(day.value)
                            ? "border-brand bg-brand/10 text-foreground"
                            : "border-surface-border text-muted-foreground hover:border-muted-foreground/30"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleDay("flexible")}
                    className={`w-full py-3.5 rounded-xl border-2 text-base font-medium transition-all ${
                      isFlexible
                        ? "border-brand bg-brand/10 text-foreground"
                        : "border-surface-border text-muted-foreground hover:border-muted-foreground/30"
                    }`}
                  >
                    I go when I can
                  </button>
                </div>
              )}
            </div>
          </QuestionLayout>
        );
      }

      case "duration":
        return (
          <QuestionLayout
            title="How long do you want sessions to be?"
            description="This helps design workouts that fit your schedule."
          >
            <div className="space-y-4">
              {DURATION_OPTIONS.map((d) => (
                <OptionCard
                  key={d.value}
                  label={d.label}
                  selected={
                    data.session_duration_preference === parseInt(d.value)
                  }
                  onClick={() =>
                    setField(
                      "session_duration_preference",
                      parseInt(d.value),
                    )
                  }
                />
              ))}
            </div>
          </QuestionLayout>
        );

      case "equipment":
        return (
          <QuestionLayout
            title="What equipment do you have access to?"
            description="Select all that apply. You can always update this later."
          >
            <div className="space-y-4">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <OptionCard
                  key={eq.value}
                  label={eq.label}
                  selected={data.equipment_access.includes(eq.value)}
                  onClick={() =>
                    toggleInList("equipment_access", eq.value)
                  }
                />
              ))}
            </div>
          </QuestionLayout>
        );

      // --- Sleep (NEW) ---
      case "sleep":
        return (
          <QuestionLayout
            title="How much do you usually sleep?"
            description="Sleep is crucial for recovery and performance."
          >
            <div className="space-y-4">
              {SLEEP_OPTIONS.map((s) => (
                <OptionCard
                  key={s.value}
                  label={s.label}
                  selected={data.sleep_hours === s.value}
                  onClick={() => setField("sleep_hours", s.value)}
                />
              ))}
            </div>
          </QuestionLayout>
        );

      // --- Personal info ---
      case "age":
        return (
          <QuestionLayout
            title="How old are you?"
            description="Your age helps fine-tune your recovery baselines."
          >
            <Input
              type="number"
              min={18}
              max={120}
              value={data.age || ""}
              onChange={(e) =>
                setField("age", parseInt(e.target.value) || 0)
              }
              placeholder="Age"
              className="h-16 text-3xl font-semibold text-center rounded-2xl"
            />
          </QuestionLayout>
        );

      case "sex":
        return (
          <QuestionLayout
            title="What is your sex?"
            description="This helps tailor your program to your physiology."
          >
            <div className="space-y-4">
              <OptionCard
                label="Male"
                selected={data.sex === "male"}
                onClick={() => setField("sex", "male")}
              />
              <OptionCard
                label="Female"
                selected={data.sex === "female"}
                onClick={() => setField("sex", "female")}
              />
            </div>
          </QuestionLayout>
        );

      case "height_weight":
        return (
          <QuestionLayout
            title="Height & Weight"
            description="This will be used to tailor training to your body."
          >
            <div className="space-y-5">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Height
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      type="number"
                      min={3}
                      max={8}
                      value={data.heightFeet || ""}
                      onChange={(e) =>
                        setField(
                          "heightFeet",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="5"
                      className="h-16 text-2xl font-semibold text-center rounded-2xl pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ft
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={11}
                      value={data.heightInches || ""}
                      onChange={(e) =>
                        setField(
                          "heightInches",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="6"
                      className="h-16 text-2xl font-semibold text-center rounded-2xl pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      in
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Current Weight
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={50}
                    max={600}
                    value={data.currentWeight || ""}
                    onChange={(e) =>
                      setField(
                        "currentWeight",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    placeholder="150"
                    className="h-16 text-2xl font-semibold text-center rounded-2xl pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    lb
                  </span>
                </div>
              </div>
            </div>
          </QuestionLayout>
        );

      default:
        return null;
    }
  };

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
      <div className="w-full space-y-8">
        {/* Progress bar */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirst}
            className={`shrink-0 p-1.5 -ml-1.5 rounded-lg hover:bg-surface-elevated transition-colors ${
              isFirst
                ? "invisible"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1 h-2.5 bg-muted/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step content */}
        <FadeTransition show={show} duration={250} onExited={handleExited}>
          {renderStep()}
        </FadeTransition>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Continue button — directly under content */}
        <Button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className="w-full h-14 text-lg font-semibold rounded-2xl bg-brand text-brand-foreground hover:bg-brand/90 disabled:bg-muted disabled:text-muted-foreground"
        >
          {isSubmitting
            ? "Generating..."
            : isLast
              ? "Design My Program"
              : "Continue"}
        </Button>
      </div>
    </div>
  );
}
