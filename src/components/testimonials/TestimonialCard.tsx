"use client";

import { useRouter } from "next/navigation";
import { Check, X, Heart, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/testimonials/RatingStars";
import { StatusBadge } from "@/components/testimonials/StatusBadge";
import { cn } from "@/lib/utils";
import type { TestimonialWithProject } from "@/types";

interface TestimonialCardProps {
  testimonial: TestimonialWithProject;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  layout?: "grid" | "list";
}

export function TestimonialCard({
  testimonial,
  selected = false,
  onSelect,
  onApprove,
  onReject,
  onDelete,
  onToggleFavorite,
  layout = "grid",
}: TestimonialCardProps) {
  const router = useRouter();

  const initials = testimonial.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = new Date(testimonial.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  function handleCardClick(e: React.MouseEvent) {
    // Don't navigate when clicking buttons or checkboxes
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest('input[type="checkbox"]') ||
      target.closest("[data-slot='checkbox']")
    ) {
      return;
    }
    router.push(`/testimonials/${testimonial.id}`);
  }

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary",
        layout === "list" && "flex-row"
      )}
      onClick={handleCardClick}
    >
      <CardContent
        className={cn(
          "pt-0",
          layout === "list" && "flex items-start gap-4"
        )}
      >
        {/* Checkbox + Header */}
        <div
          className={cn(
            "flex items-start gap-3",
            layout === "list" && "flex-1"
          )}
        >
          {/* Checkbox */}
          {onSelect && (
            <div className="pt-0.5">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onSelect(testimonial.id)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          )}

          {/* Avatar */}
          <Avatar size="default" className="mt-0.5 shrink-0">
            <AvatarImage src={testimonial.avatar ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium truncate">
                {testimonial.name}
              </span>
              {testimonial.company && (
                <span className="text-sm text-muted-foreground truncate">
                  {testimonial.company}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2">
              <RatingStars rating={testimonial.rating} size="sm" />
              <StatusBadge status={testimonial.status} />
            </div>

            {/* Text preview */}
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {testimonial.text}
            </p>

            {/* Tags */}
            {testimonial.tags && testimonial.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {testimonial.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {testimonial.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{testimonial.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Footer: date + project + actions */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formattedDate}</span>
                {testimonial.project && (
                  <>
                    <span>-</span>
                    <span>{testimonial.project.name}</span>
                  </>
                )}
              </div>

              {/* Quick actions */}
              <div
                className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                {testimonial.status === "PENDING" && onApprove && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-[#22c55e] hover:bg-[#22c55e]/10 hover:text-[#22c55e]"
                    onClick={() => onApprove(testimonial.id)}
                    title="Approve"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                {testimonial.status === "PENDING" && onReject && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
                    onClick={() => onReject(testimonial.id)}
                    title="Reject"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className={cn(
                      "hover:text-[#f59e0b]",
                      testimonial.isFavorite
                        ? "text-[#f59e0b]"
                        : "text-muted-foreground"
                    )}
                    onClick={() =>
                      onToggleFavorite(
                        testimonial.id,
                        !testimonial.isFavorite
                      )
                    }
                    title={
                      testimonial.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Heart
                      className={cn(
                        "h-3.5 w-3.5",
                        testimonial.isFavorite && "fill-current"
                      )}
                    />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
                    onClick={() => onDelete(testimonial.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
