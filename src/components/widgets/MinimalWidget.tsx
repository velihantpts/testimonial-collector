"use client";

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import type { WidgetConfig, TestimonialItem } from "./CarouselWidget";

interface MinimalWidgetProps {
  config: WidgetConfig;
  testimonials: TestimonialItem[];
}

export function MinimalWidget({ config, testimonials }: MinimalWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const total = testimonials.length;

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
      setIsFading(false);
    }, 400);
  }, [total]);

  useEffect(() => {
    if (!config.autoplay || total <= 1) return;

    const interval = setInterval(goToNext, config.autoplaySpeed * 1000);
    return () => clearInterval(interval);
  }, [config.autoplay, config.autoplaySpeed, total, goToNext]);

  const themeStyles =
    config.theme === "DARK"
      ? { backgroundColor: "#1f2937", color: "#f9fafb" }
      : config.theme === "CUSTOM"
        ? { backgroundColor: config.bgColor, color: config.textColor }
        : { backgroundColor: "#ffffff", color: "#111827" };

  if (total === 0) {
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

  const testimonial = testimonials[currentIndex];

  return (
    <div
      className="p-8 text-center"
      style={{
        ...themeStyles,
        borderRadius: `${config.borderRadius}px`,
      }}
    >
      <div
        className="transition-opacity duration-400"
        style={{ opacity: isFading ? 0 : 1 }}
      >
        {/* Large quote mark */}
        <svg
          className="mx-auto mb-4 size-10 opacity-15"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" />
        </svg>

        {/* Text */}
        <blockquote className="mb-6 text-lg font-medium italic leading-relaxed">
          &ldquo;{testimonial.text}&rdquo;
        </blockquote>

        {/* Rating */}
        {config.showRating && (
          <div className="mb-4 flex items-center justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="size-4"
                style={{
                  fill:
                    i < testimonial.rating ? config.starColor : "transparent",
                  color:
                    i < testimonial.rating ? config.starColor : "currentColor",
                  opacity: i < testimonial.rating ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        )}

        {/* Avatar */}
        {config.showAvatar && (
          <div className="mb-3 flex justify-center">
            <div
              className="flex size-12 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white"
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
          </div>
        )}

        {/* Name + Company */}
        <p className="text-base font-semibold">{testimonial.name}</p>
        {config.showCompany && testimonial.company && (
          <p className="mt-0.5 text-sm opacity-60">{testimonial.company}</p>
        )}
        {config.showDate && (
          <p className="mt-1 text-xs opacity-40">
            {new Date(testimonial.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Dots for multiple */}
      {total > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsFading(true);
                setTimeout(() => {
                  setCurrentIndex(i);
                  setIsFading(false);
                }, 400);
              }}
              className="size-2 rounded-full transition-all"
              style={{
                backgroundColor:
                  i === currentIndex ? config.starColor : "currentColor",
                opacity: i === currentIndex ? 1 : 0.2,
              }}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
