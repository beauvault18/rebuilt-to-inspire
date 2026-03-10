"use client";

import { useEffect, useState } from "react";

interface FadeTransitionProps {
  show: boolean;
  duration?: number;
  onExited?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function FadeTransition({
  show,
  duration = 300,
  onExited,
  children,
  className = "",
}: FadeTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        onExited?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onExited]);

  if (!shouldRender) return null;

  return (
    <div
      className={`transition-all ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(8px)",
      }}
    >
      {children}
    </div>
  );
}
