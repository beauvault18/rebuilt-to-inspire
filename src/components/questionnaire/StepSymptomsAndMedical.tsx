"use client";

import SymptomSelector from "./SymptomSelector";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  LYMPHEDEMA_STATUSES,
  BONE_MET_OPTIONS,
  BONE_MET_LOCATIONS,
} from "@/lib/constants";
import type { QuestionnaireData } from "@/types/questionnaire";

interface Props {
  data: QuestionnaireData;
  setField: (field: keyof QuestionnaireData, value: unknown) => void;
  toggleInList: (field: keyof QuestionnaireData, value: string) => void;
}

export default function StepSymptomsAndMedical({
  data,
  setField,
  toggleInList,
}: Props) {
  const hasLung = data.cancer_types.includes("lung");
  const hasProstate = data.cancer_types.includes("prostate");
  const hasColorectal = data.cancer_types.includes("colorectal");
  const hasTesticular = data.cancer_types.includes("testicular");
  const showLymphedemaLimb = data.lymphedema_status !== "none";
  const showBoneLocations = data.bone_metastases === "yes";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Your Recovery Status</h2>

      {/* --- Symptoms --- */}
      <p className="text-base text-muted-foreground">
        Rate any symptoms you are currently experiencing.
      </p>

      <SymptomSelector
        label="Fatigue"
        description="General tiredness or lack of energy"
        value={data.fatigue}
        onChange={(v) => setField("fatigue", v)}
      />
      <SymptomSelector
        label="Pain"
        description="Ongoing pain related to cancer or treatment"
        value={data.pain}
        onChange={(v) => setField("pain", v)}
      />
      <SymptomSelector
        label="Neuropathy"
        description="Tingling, numbness, or reduced sensation in hands/feet"
        value={data.neuropathy}
        onChange={(v) => setField("neuropathy", v)}
      />
      <SymptomSelector
        label="Balance Issues"
        description="Difficulty with balance or coordination"
        value={data.balance_issues}
        onChange={(v) => setField("balance_issues", v)}
      />

      {hasLung && (
        <SymptomSelector
          label="Shortness of Breath (Dyspnea)"
          description="Difficulty breathing during daily activities"
          value={data.dyspnea}
          onChange={(v) => setField("dyspnea", v)}
        />
      )}

      {hasProstate && (
        <SymptomSelector
          label="Urinary Incontinence"
          description="Bladder control difficulties"
          value={data.urinary_incontinence}
          onChange={(v) => setField("urinary_incontinence", v)}
        />
      )}

      {/* --- Visual Divider --- */}
      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Medical Details
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* --- Medical Details --- */}
      <div className="space-y-3">
        <Label className="text-base">Lymphedema Status</Label>
        <RadioGroup
          value={data.lymphedema_status}
          onValueChange={(v) => setField("lymphedema_status", v)}
          className="flex flex-wrap gap-4"
        >
          {LYMPHEDEMA_STATUSES.map((ls) => (
            <div key={ls.value} className="flex items-center gap-1.5">
              <RadioGroupItem
                value={ls.value}
                id={`lymph-${ls.value}`}
              />
              <Label
                htmlFor={`lymph-${ls.value}`}
                className="text-base cursor-pointer"
              >
                {ls.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {showLymphedemaLimb && (
        <div className="space-y-3">
          <Label htmlFor="lymphLimb" className="text-base">Affected Limb</Label>
          <Input
            id="lymphLimb"
            value={data.lymphedema_limb || ""}
            onChange={(e) =>
              setField("lymphedema_limb", e.target.value || null)
            }
            placeholder="e.g. left arm, right leg"
            className="h-11 text-base"
          />
        </div>
      )}

      {hasColorectal && (
        <div className="flex items-center gap-3">
          <Checkbox
            id="ostomy"
            checked={data.has_ostomy}
            onCheckedChange={(v) => setField("has_ostomy", !!v)}
          />
          <Label htmlFor="ostomy" className="cursor-pointer text-base">
            I have a colostomy or ileostomy
          </Label>
        </div>
      )}

      {hasTesticular && (
        <div className="flex items-center gap-3">
          <Checkbox
            id="rplnd"
            checked={data.had_rplnd}
            onCheckedChange={(v) => setField("had_rplnd", !!v)}
          />
          <Label htmlFor="rplnd" className="cursor-pointer text-base">
            I had retroperitoneal lymph node dissection (RPLND)
          </Label>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Checkbox
          id="hormone"
          checked={data.on_hormone_therapy}
          onCheckedChange={(v) => setField("on_hormone_therapy", !!v)}
        />
        <Label htmlFor="hormone" className="cursor-pointer text-base">
          Currently on hormone therapy (ADT or aromatase inhibitors)
        </Label>
      </div>

      <div className="space-y-3">
        <Label className="text-base">Bone Metastases</Label>
        <RadioGroup
          value={data.bone_metastases}
          onValueChange={(v) => setField("bone_metastases", v)}
          className="flex gap-6"
        >
          {BONE_MET_OPTIONS.map((opt) => (
            <div key={opt.value} className="flex items-center gap-1.5">
              <RadioGroupItem
                value={opt.value}
                id={`bone-${opt.value}`}
              />
              <Label
                htmlFor={`bone-${opt.value}`}
                className="text-base cursor-pointer"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {showBoneLocations && (
        <div className="space-y-3">
          <Label className="text-base">Bone Metastases Locations</Label>
          <div className="flex flex-wrap gap-3">
            {BONE_MET_LOCATIONS.map((loc) => (
              <div key={loc} className="flex items-center gap-2">
                <Checkbox
                  id={`boneloc-${loc}`}
                  checked={data.bone_metastases_locations.includes(
                    loc.toLowerCase(),
                  )}
                  onCheckedChange={() =>
                    toggleInList(
                      "bone_metastases_locations",
                      loc.toLowerCase(),
                    )
                  }
                />
                <Label
                  htmlFor={`boneloc-${loc}`}
                  className="text-base cursor-pointer"
                >
                  {loc}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Checkbox
          id="heartlung"
          checked={data.heart_or_lung_disease}
          onCheckedChange={(v) => setField("heart_or_lung_disease", !!v)}
        />
        <Label htmlFor="heartlung" className="cursor-pointer text-base">
          I have a heart or lung condition
        </Label>
      </div>
    </div>
  );
}
