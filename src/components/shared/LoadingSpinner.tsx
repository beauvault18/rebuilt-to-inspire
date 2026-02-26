"use client";

import { useEffect, useState } from "react";

const messages = [
  "Analyzing your profile...",
  "Retrieving evidence-based guidelines...",
  "Building your personalized exercise plan...",
  "Applying safety considerations...",
  "Almost there...",
];

export default function LoadingSpinner() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-lg text-muted-foreground animate-pulse">
        {messages[messageIndex]}
      </p>
    </div>
  );
}
