"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThankYouScreenProps {
  message: string;
  brandColor?: string;
  onSubmitAnother: () => void;
}

// Generate random particles for the celebration effect
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1.5,
    size: 4 + Math.random() * 8,
    color: [
      "#6366f1",
      "#f59e0b",
      "#10b981",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
    ][Math.floor(Math.random() * 7)],
  }));
}

export function ThankYouScreen({
  message,
  brandColor,
  onSubmitAnother,
}: ThankYouScreenProps) {
  const [showContent, setShowContent] = useState(false);
  const [particles] = useState(() => generateParticles(20));
  const accentColor = brandColor || "#10b981";

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // CSS keyframes as a string injected via a <style> tag
  const animationStyles = `
    @keyframes ty-confetti-fall {
      0% {
        transform: translateY(-20px) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(400px) rotate(720deg);
        opacity: 0;
      }
    }
    @keyframes ty-checkmark-ring {
      0% {
        box-shadow: 0 0 0 0 ${accentColor}66;
      }
      50% {
        box-shadow: 0 0 0 20px ${accentColor}00;
      }
      100% {
        box-shadow: 0 0 0 0 ${accentColor}00;
      }
    }
    @keyframes ty-checkmark-appear {
      0% {
        transform: scale(0) rotate(-45deg);
        opacity: 0;
      }
      50% {
        transform: scale(1.2) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
    }
  `;

  return (
    <div className="relative flex flex-col items-center justify-center py-12 text-center overflow-hidden">
      {/* Injected animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

      {/* CSS Confetti Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animation: `ty-confetti-fall ${particle.duration}s ${particle.delay}s linear forwards`,
            }}
          />
        ))}
      </div>

      {/* Checkmark with animation */}
      <div
        className={`transition-all duration-700 ease-out ${
          showContent
            ? "scale-100 opacity-100"
            : "scale-50 opacity-0"
        }`}
      >
        <div
          className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${accentColor}15`,
            animation: "ty-checkmark-ring 1.5s ease-out",
          }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              backgroundColor: `${accentColor}20`,
            }}
          >
            <CheckCircle2
              className="h-10 w-10"
              style={{
                color: accentColor,
                animation: "ty-checkmark-appear 0.6s ease-out 0.3s both",
              }}
            />
          </div>
        </div>
      </div>

      {/* Thank you message */}
      <div
        className={`transition-all duration-700 delay-300 ease-out ${
          showContent
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        <h2 className="mb-3 text-2xl font-bold text-foreground">
          Thank You!
        </h2>
        <p className="mx-auto mb-8 max-w-md text-muted-foreground">
          {message}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onSubmitAnother}
          className="gap-2"
        >
          Submit Another Testimonial
        </Button>
      </div>
    </div>
  );
}
