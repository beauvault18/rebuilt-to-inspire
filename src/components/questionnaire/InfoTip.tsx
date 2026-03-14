"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface InfoTipProps {
  term: string;
  definition: string;
}

export default function InfoTip({ term, definition }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative inline-flex items-center ml-2" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="inline-flex items-center justify-center size-6 rounded-full border-2 border-muted-foreground/50 text-muted-foreground hover:text-foreground hover:border-foreground/60 hover:bg-muted/30 transition-colors"
        aria-label={`What is ${term}?`}
      >
        <Info className="size-3.5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 p-4 rounded-xl bg-surface-elevated border-2 border-surface-border shadow-xl z-50">
          <p className="text-base font-semibold text-foreground mb-1.5">
            {term}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {definition}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-3 h-3 bg-surface-elevated border-r-2 border-b-2 border-surface-border rotate-45 -translate-y-1/2" />
          </div>
        </div>
      )}
    </div>
  );
}
