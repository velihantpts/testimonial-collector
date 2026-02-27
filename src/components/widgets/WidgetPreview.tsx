"use client";

import { CarouselWidget } from "./CarouselWidget";
import { GridWidget } from "./GridWidget";
import { WallOfLoveWidget } from "./WallOfLoveWidget";
import { MinimalWidget } from "./MinimalWidget";
import type { WidgetConfig, TestimonialItem } from "./CarouselWidget";

interface WidgetPreviewProps {
  config: WidgetConfig;
  testimonials?: TestimonialItem[];
}

const MOCK_TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Sarah Johnson",
    avatar: null,
    company: "TechCorp Inc.",
    rating: 5,
    text: "This product has completely transformed how we handle customer feedback. The interface is intuitive and the results speak for themselves. Highly recommended!",
    createdAt: new Date("2025-12-15").toISOString(),
  },
  {
    name: "Michael Chen",
    avatar: null,
    company: "StartupFlow",
    rating: 4,
    text: "Great tool for collecting and displaying testimonials. The widget customization options are fantastic and easy to set up.",
    createdAt: new Date("2025-11-20").toISOString(),
  },
  {
    name: "Emily Rodriguez",
    avatar: null,
    company: "Design Studio",
    rating: 5,
    text: "We've seen a 40% increase in conversions since adding the testimonial widget to our landing page. The social proof makes a real difference.",
    createdAt: new Date("2025-10-05").toISOString(),
  },
  {
    name: "David Kim",
    avatar: null,
    company: "CloudSync",
    rating: 5,
    text: "The best testimonial collection tool I've used. Clean design and powerful features.",
    createdAt: new Date("2025-09-18").toISOString(),
  },
  {
    name: "Lisa Thompson",
    avatar: null,
    company: "Marketing Pro",
    rating: 4,
    text: "Easy to integrate, beautiful design, and our customers love sharing their feedback through the collection page. A must-have for any SaaS business.",
    createdAt: new Date("2025-08-22").toISOString(),
  },
];


export function WidgetPreview({ config, testimonials }: WidgetPreviewProps) {
  const items = testimonials || MOCK_TESTIMONIALS;

  const renderWidget = () => {
    switch (config.layout) {
      case "CAROUSEL":
        return <CarouselWidget config={config} testimonials={items} />;
      case "GRID":
        return <GridWidget config={config} testimonials={items} />;
      case "LIST":
        return (
          <div className="grid grid-cols-1 gap-4">
            <GridWidget config={config} testimonials={items} />
          </div>
        );
      case "MASONRY":
      case "WALL_OF_LOVE":
        return <WallOfLoveWidget config={config} testimonials={items} />;
      case "MINIMAL":
        return <MinimalWidget config={config} testimonials={items} />;
      default:
        return <CarouselWidget config={config} testimonials={items} />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Preview
        </span>
        <span className="text-muted-foreground text-xs">
          {items.length} testimonial{items.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border bg-muted/30 p-4">
        <div
          className="mx-auto w-full"
          style={{
            maxWidth:
              config.layout === "MINIMAL" || config.layout === "CAROUSEL"
                ? "500px"
                : undefined,
          }}
        >
          {renderWidget()}
        </div>
      </div>
    </div>
  );
}
