"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANCER_TYPES, TREATMENT_TYPES, SURGERY_TYPES } from "@/lib/constants";
import type { QuestionnaireData } from "@/types/questionnaire";

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
] as const;

function getYearOptions() {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= current - 30; y--) {
    years.push(y);
  }
  return years;
}

function parseMonthYear(value: string): { month: string; year: string } {
  if (!value) return { month: "", year: "" };
  const [y, m] = value.split("-");
  return { month: m || "", year: y || "" };
}

function buildMonthYear(month: string, year: string): string {
  if (!month && !year) return "";
  return `${year || ""}-${month || ""}`;
}

interface Props {
  data: QuestionnaireData;
  setField: (field: keyof QuestionnaireData, value: unknown) => void;
  toggleInList: (field: keyof QuestionnaireData, value: string) => void;
}

export default function StepCancerHistory({
  data,
  setField,
  toggleInList,
}: Props) {
  const filteredSurgeries = SURGERY_TYPES.filter(
    (st) =>
      st.cancerType === null || data.cancer_types.includes(st.cancerType),
  );

  const years = getYearOptions();
  const diagnosis = parseMonthYear(data.diagnosisDate);
  const remission = parseMonthYear(data.remissionDate);
  const surgery = parseMonthYear(data.surgeryDate);
  const lastChemo = parseMonthYear(data.lastChemoDate);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Cancer History</h2>

      <div className="space-y-3">
        <Label className="text-base">Type of Cancer (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-4">
          {CANCER_TYPES.map((ct) => (
            <div key={ct.value} className="flex items-center gap-3">
              <Checkbox
                id={`cancer-${ct.value}`}
                checked={data.cancer_types.includes(ct.value)}
                onCheckedChange={() => toggleInList("cancer_types", ct.value)}
                className="size-5"
              />
              <Label htmlFor={`cancer-${ct.value}`} className="cursor-pointer text-base">
                {ct.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base">When were you diagnosed?</Label>
        <div className="grid grid-cols-2 gap-4">
          <Select
            value={diagnosis.month}
            onValueChange={(m) =>
              setField("diagnosisDate", buildMonthYear(m, diagnosis.year))
            }
          >
            <SelectTrigger className="h-11 text-base">
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
            value={diagnosis.year}
            onValueChange={(y) =>
              setField("diagnosisDate", buildMonthYear(diagnosis.month, y))
            }
          >
            <SelectTrigger className="h-11 text-base">
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

      <div className="space-y-3">
        <Label className="text-base">
          When did you go into remission / complete treatment?
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <Select
            value={remission.month}
            onValueChange={(m) =>
              setField("remissionDate", buildMonthYear(m, remission.year))
            }
          >
            <SelectTrigger className="h-11 text-base">
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
              setField("remissionDate", buildMonthYear(remission.month, y))
            }
          >
            <SelectTrigger className="h-11 text-base">
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

      <div className="space-y-3">
        <Label className="text-base">Treatments Received (select all that apply)</Label>
        <div className="grid grid-cols-2 gap-4">
          {TREATMENT_TYPES.map((tt) => (
            <div key={tt.value} className="flex items-center gap-3">
              <Checkbox
                id={`treatment-${tt.value}`}
                checked={data.treatments_received.includes(tt.value)}
                onCheckedChange={() =>
                  toggleInList("treatments_received", tt.value)
                }
                className="size-5"
              />
              <Label
                htmlFor={`treatment-${tt.value}`}
                className="cursor-pointer text-base"
              >
                {tt.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base">Surgery Type</Label>
        <Select
          value={data.surgery_type}
          onValueChange={(v) => setField("surgery_type", v)}
        >
          <SelectTrigger className="h-11 text-base">
            <SelectValue placeholder="Select surgery type" />
          </SelectTrigger>
          <SelectContent>
            {filteredSurgeries.map((st) => (
              <SelectItem key={st.value} value={st.value}>
                {st.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data.surgery_type !== "none" && (
        <div className="space-y-3">
          <Label className="text-base">Date of Surgery</Label>
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={surgery.month}
              onValueChange={(m) =>
                setField("surgeryDate", buildMonthYear(m, surgery.year))
              }
            >
              <SelectTrigger className="h-11 text-base">
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
              value={surgery.year}
              onValueChange={(y) =>
                setField("surgeryDate", buildMonthYear(surgery.month, y))
              }
            >
              <SelectTrigger className="h-11 text-base">
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

      {data.treatments_received.includes("chemotherapy") && (
        <div className="space-y-3">
          <Label className="text-base">Last Date of Chemotherapy</Label>
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={lastChemo.month}
              onValueChange={(m) =>
                setField("lastChemoDate", buildMonthYear(m, lastChemo.year))
              }
            >
              <SelectTrigger className="h-11 text-base">
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
              value={lastChemo.year}
              onValueChange={(y) =>
                setField("lastChemoDate", buildMonthYear(lastChemo.month, y))
              }
            >
              <SelectTrigger className="h-11 text-base">
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
}
