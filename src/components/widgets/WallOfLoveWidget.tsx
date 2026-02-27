"use client";

import { Star } from "lucide-react";
import type { WidgetConfig, TestimonialItem } from "./CarouselWidget";

interface WallOfLoveWidgetProps {
  config: WidgetConfig;
  testimonials: TestimonialItem[];
}

export function WallOfLoveWidget({
  config,
  testimonials,
}: WallOfLoveWidgetProps) {
  const themeStyles =
    config.theme === "DARK"
      ? { backgroundColor: "#1f2937", color: "#f9fafb" }
      : config.theme === "CUSTOM"
        ? { backgroundColor: config.bgColor, color: config.textColor }
        : { backgroundColor: "#ffffff", color: "#111827" };

  if (testimonials.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-8 text-center"
        style={{
          ...themeStyles,
          borderRadius: `${config.borderRadius}px`,
        }}
      >
        <p className="text-sm opacity-60">No testimonials to display</p>
      </div>
    );
  }

  return (
    <div
      className="gap-4"
      style={{
        columnCount: 3,
        columnGap: "1rem",
      }}
    >
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className="mb-4 break-inside-avoid border p-5"
          style={{
            ...themeStyles,
            borderRadius: `${config.borderRadius}px`,
            borderColor:
              config.theme === "DARK"
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
          }}
        >
          {/* Author - Top */}
          <div className="mb-3 flex items-center gap-3">
            {config.showAvatar && (
              <div
                className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: config.starColor }}
              >
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="size-full object-cover"
                  />
                ) : (
                  testimonial.name.charAt(0).toUpperCase()
                )}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">{testimonial.name}</p>
              {config.showCompany && testimonial.company && (
                <p className="text-xs opacity-60">{testimonial.company}</p>
              )}
            </div>
          </div>

          {/* Rating */}
          {config.showRating && (
            <div className="mb-2 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="size-3.5"
                  style={{
                    fill:
                      i < testimonial.rating
                        ? config.starColor
                        : "transparent",
                    color:
                      i < testimonial.rating
                        ? config.starColor
                        : "currentColor",
                    opacity: i < testimonial.rating ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          )}

          {/* Text */}
          <p className="text-sm leading-relaxed">{testimonial.text}</p>

          {/* Date */}
          {config.showDate && (
            <p className="mt-3 text-xs opacity-40">
              {new Date(testimonial.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
