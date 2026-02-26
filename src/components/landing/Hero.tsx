"use client";

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10 px-4">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-7xl md:text-8xl font-bold tracking-tight text-center">
          Rebuilt To Inspire
        </h1>
        <div className="w-24 h-0.5 bg-primary/30 rounded-full" />
      </div>
      <p className="text-xl text-muted-foreground text-center max-w-lg">
        Your personalized wellness companion for cancer recovery
      </p>
      <button
        onClick={onStart}
        className="text-xl text-primary/60 hover:text-primary underline underline-offset-8 decoration-primary/30 hover:decoration-primary/60 transition-all cursor-pointer mt-4"
      >
        Click here to start your journey
      </button>
    </div>
  );
}
