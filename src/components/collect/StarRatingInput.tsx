"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  error?: string;
  brandColor?: string;
}

export function StarRatingInput({
  value,
  onChange,
  error,
  brandColor,
}: StarRatingInputProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const displayRating = hoveredStar !== null ? hoveredStar : value;

  // Use brand color for stars, fallback to amber
  const starFillColor = brandColor || "#f59e0b";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= displayRating;

          return (
            <button
              key={starIndex}
              type="button"
              onClick={() => onChange(starIndex)}
              onMouseEnter={() => setHoveredStar(starIndex)}
              onMouseLeave={() => setHoveredStar(null)}
              className={cn(
                "inline-flex shrink-0 p-1 rounded-md cursor-pointer",
                "transition-all duration-150 ease-out",
                "hover:scale-125 active:scale-110",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              aria-label={`Rate ${starIndex} out of 5 stars`}
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors duration-150",
                  isFilled ? "fill-current" : "fill-transparent text-gray-300"
                )}
                style={isFilled ? { color: starFillColor } : undefined}
              />
            </button>
          );
        })}
        {value > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {value}/5
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
