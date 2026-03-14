"use client";

import { Check } from "lucide-react";

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export default function OptionCard({
  label,
  description,
  selected,
  onClick,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-7 py-5 rounded-2xl border-2 transition-all duration-150 flex items-center justify-between gap-4 ${
        selected
          ? "border-brand bg-brand/8"
          : "border-surface-border hover:border-muted-foreground/25 bg-transparent"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p
          className={`text-lg leading-snug ${
            selected
              ? "font-semibold text-foreground"
              : "font-medium text-foreground/90"
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="text-base text-muted-foreground mt-1 leading-snug">
            {description}
          </p>
        )}
      </div>
      {selected && (
        <div className="shrink-0 size-8 rounded-full bg-brand flex items-center justify-center">
          <Check className="size-4.5 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}
