import { Lightbulb } from "lucide-react";

interface PromptQuestionsProps {
  questions: string[];
  brandColor?: string;
}

export function PromptQuestions({ questions, brandColor }: PromptQuestionsProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Lightbulb className="h-4 w-4" />
        <span>Consider these questions as you write:</span>
      </div>
      <div className="space-y-2">
        {questions.map((question, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-lg border bg-muted/30 px-4 py-3"
            style={{
              borderLeftWidth: "3px",
              borderLeftColor: brandColor || "#6366f1",
            }}
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white mt-0.5"
              style={{ backgroundColor: brandColor || "#6366f1" }}
            >
              {index + 1}
            </span>
            <p className="text-sm text-foreground/80">{question}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
