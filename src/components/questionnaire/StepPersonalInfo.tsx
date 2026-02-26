"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { QuestionnaireData } from "@/types/questionnaire";

interface Props {
  data: QuestionnaireData;
  setField: (field: keyof QuestionnaireData, value: unknown) => void;
}

export default function StepPersonalInfo({ data, setField }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Personal Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="firstName" className="text-base">First Name</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            placeholder="First name"
            className="h-11 text-base"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="lastName" className="text-base">Last Name</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            placeholder="Last name"
            className="h-11 text-base"
          />
        </div>
      </div>
      <div className="space-y-3">
        <Label htmlFor="email" className="text-base">Email</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="your@email.com"
          className="h-11 text-base"
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="age" className="text-base">Age</Label>
        <Input
          id="age"
          type="number"
          min={18}
          max={120}
          value={data.age || ""}
          onChange={(e) => setField("age", parseInt(e.target.value) || 0)}
          placeholder="Age"
          className="h-11 text-base"
        />
      </div>
      <div className="space-y-3">
        <Label className="text-base">Sex</Label>
        <RadioGroup
          value={data.sex}
          onValueChange={(v) => setField("sex", v)}
          className="flex gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="male" id="sex-male" />
            <Label htmlFor="sex-male" className="cursor-pointer text-base">
              Male
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="female" id="sex-female" />
            <Label htmlFor="sex-female" className="cursor-pointer text-base">
              Female
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-base">Height</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Input
              id="heightFeet"
              type="number"
              min={3}
              max={8}
              value={data.heightFeet || ""}
              onChange={(e) =>
                setField("heightFeet", parseInt(e.target.value) || 0)
              }
              placeholder="Feet"
              className="h-11 text-base"
            />
            <span className="text-sm text-muted-foreground">ft</span>
          </div>
          <div className="space-y-1">
            <Input
              id="heightInches"
              type="number"
              min={0}
              max={11}
              value={data.heightInches || ""}
              onChange={(e) =>
                setField("heightInches", parseInt(e.target.value) || 0)
              }
              placeholder="Inches"
              className="h-11 text-base"
            />
            <span className="text-sm text-muted-foreground">in</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="currentWeight" className="text-base">Current Weight (lbs)</Label>
          <Input
            id="currentWeight"
            type="number"
            min={50}
            max={600}
            value={data.currentWeight || ""}
            onChange={(e) =>
              setField("currentWeight", parseInt(e.target.value) || 0)
            }
            placeholder="e.g. 180"
            className="h-11 text-base"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="goalWeight" className="text-base">Goal Weight (lbs)</Label>
          <Input
            id="goalWeight"
            type="number"
            min={50}
            max={600}
            value={data.goalWeight || ""}
            onChange={(e) =>
              setField("goalWeight", parseInt(e.target.value) || 0)
            }
            placeholder="e.g. 160"
            className="h-11 text-base"
          />
        </div>
      </div>
    </div>
  );
}
