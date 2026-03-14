"use client";

interface QuestionLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function QuestionLayout({
  title,
  description,
  children,
}: QuestionLayoutProps) {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-4xl font-bold tracking-tight leading-[1.15]">
          {title}
        </h2>
        {description && (
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
