"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export interface WidgetConfig {
  theme: string;
  layout: string;
  bgColor: string;
  textColor: string;
  starColor: string;
  borderRadius: number;
  showRating: boolean;
  showAvatar: boolean;
  showCompany: boolean;
  showDate: boolean;
  autoplay: boolean;
  autoplaySpeed: number;
}

export interface TestimonialItem {
  name: string;
  avatar?: string | null;
  company?: string | null;
  rating: number;
  text: string;
  createdAt: string | Date;
}

interface CarouselWidgetProps {
  config: WidgetConfig;
  testimonials: TestimonialItem[];
}

export function CarouselWidget({ config, testimonials }: CarouselWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const total = testimonials.length;

  const goToNext = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!config.autoplay || isHovered || total <= 1) return;

    const interval = setInterval(goToNext, config.autoplaySpeed * 1000);
    return () => clearInterval(interval);
  }, [config.autoplay, config.autoplaySpeed, isHovered, total, goToNext]);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center p-8 text-center"
        style={{
          backgroundColor: config.bgColor,
          color: config.textColor,
          borderRadius: `${config.borderRadius}px`,
        }}
      >
        <p className="text-sm opacity-60">No testimonials to display</p>
      </div>
    );
  }

  const testimonial = testimonials[currentIndex];

  const themeStyles =
    config.theme === "DARK"
      ? { backgroundColor: "#1f2937", color: "#f9fafb" }
      : config.theme === "CUSTOM"
        ? { backgroundColor: config.bgColor, color: config.textColor }
        : { backgroundColor: "#ffffff", color: "#111827" };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        ...themeStyles,
        borderRadius: `${config.borderRadius}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 transition-opacity duration-500">
        {/* Quote */}
        <div className="mb-4">
          <svg
            className="mb-2 size-8 opacity-20"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" />
          </svg>
          <p className="text-base leading-relaxed">{testimonial.text}</p>
        </div>

        {/* Rating */}
        {config.showRating && (
          <div className="mb-3 flex items-center gap-0.5">
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

        {/* Author */}
        <div className="flex items-center gap-3">
          {config.showAvatar && (
            <div
              className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white"
              style={{
                backgroundColor: config.starColor,
              }}
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
            {config.showDate && (
              <p className="text-xs opacity-40">
                {new Date(testimonial.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/10 opacity-0 transition-opacity hover:bg-black/20"
            style={{ opacity: isHovered ? 1 : 0 }}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/10 opacity-0 transition-opacity hover:bg-black/20"
            style={{ opacity: isHovered ? 1 : 0 }}
            aria-label="Next testimonial"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-4">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
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
