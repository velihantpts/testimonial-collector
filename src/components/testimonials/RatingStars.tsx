"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function RatingStars({
  rating,
  size = "md",
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const displayRating = hoveredStar !== null ? hoveredStar : rating;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => {
        const starIndex = i + 1;
        const isFilled = starIndex <= displayRating;

        return (
          <button
            key={starIndex}
            type="button"
            disabled={!interactive}
            onClick={() => {
              if (interactive && onChange) {
                onChange(starIndex);
              }
            }}
            onMouseEnter={() => {
              if (interactive) setHoveredStar(starIndex);
            }}
            onMouseLeave={() => {
              if (interactive) setHoveredStar(null);
            }}
            className={cn(
              "inline-flex shrink-0 p-0",
              interactive
                ? "cursor-pointer transition-transform hover:scale-110"
                : "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeMap[size],
                "transition-colors duration-150",
                isFilled
                  ? "fill-[#f59e0b] text-[#f59e0b]"
                  : "fill-transparent text-gray-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
