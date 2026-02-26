"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SYMPTOM_SEVERITIES } from "@/lib/constants";

interface SymptomSelectorProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function SymptomSelector({
  label,
  description,
  value,
  onChange,
}: SymptomSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex gap-5"
      >
        {SYMPTOM_SEVERITIES.map((s) => (
          <div key={s.value} className="flex items-center gap-1.5">
            <RadioGroupItem value={s.value} id={`${label}-${s.value}`} />
            <Label
              htmlFor={`${label}-${s.value}`}
              className="text-base cursor-pointer"
            >
              {s.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
