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
  onNext,
  canProceed,
  isLast,
  isSubmitting = false,
}: StepNavigationProps) {
  return (
    <div className="pt-6">
      <Button
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className="w-full h-12 text-base font-semibold rounded-xl"
      >
        {isSubmitting
          ? "Generating..."
          : isLast
            ? "Design My Program"
            : "Continue"}
      </Button>
    </div>
  );
}
