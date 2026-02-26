"use client";

import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
}

export default function StepNavigation({
  onBack,
  onNext,
  canProceed,
  isFirst,
  isLast,
  isSubmitting = false,
}: StepNavigationProps) {
  return (
    <div className="flex justify-between pt-8">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={isFirst || isSubmitting}
        className={`h-11 px-6 text-base ${isFirst ? "invisible" : ""}`}
      >
        Back
      </Button>
      <Button
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className="h-11 px-6 text-base font-semibold"
      >
        {isSubmitting
          ? "Generating..."
          : isLast
            ? "Generate My Plan"
            : "Next"}
      </Button>
    </div>
  );
}
