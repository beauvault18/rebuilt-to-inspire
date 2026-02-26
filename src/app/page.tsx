"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/landing/Hero";
import FadeTransition from "@/components/shared/FadeTransition";

export default function LandingPage() {
  const router = useRouter();
  const [show, setShow] = useState(true);

  const handleStart = useCallback(() => {
    setShow(false);
  }, []);

  const handleExited = useCallback(() => {
    router.push("/auth");
  }, [router]);

  return (
    <FadeTransition show={show} duration={600} onExited={handleExited}>
      <Hero onStart={handleStart} />
    </FadeTransition>
  );
}
