"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TestimonialStatus = "APPROVED" | "PENDING" | "REJECTED";

interface StatusBadgeProps {
  status: TestimonialStatus;
  className?: string;
}

const statusConfig: Record<
  TestimonialStatus,
  { label: string; className: string }
> = {
  APPROVED: {
    label: "Approved",
    className: "bg-[#22c55e]/15 text-[#22c55e] hover:bg-[#22c55e]/25",
  },
  PENDING: {
    label: "Pending",
    className: "bg-[#f59e0b]/15 text-[#f59e0b] hover:bg-[#f59e0b]/25",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-[#ef4444]/15 text-[#ef4444] hover:bg-[#ef4444]/25",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-0 font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
