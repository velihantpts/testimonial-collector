import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PlanBadgeProps {
  plan: string;
  className?: string;
}

const planStyles: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  STARTER: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  PRO: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
};

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  return (
    <Badge
      className={cn(
        "text-[10px] font-semibold uppercase tracking-wide",
        planStyles[plan] ?? planStyles.FREE,
        className
      )}
    >
      {plan}
    </Badge>
  );
}
