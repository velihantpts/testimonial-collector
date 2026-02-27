"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PlanBadge } from "@/components/billing/PlanBadge";

interface UpgradePromptProps {
  feature: string;
  requiredPlan: "STARTER" | "PRO";
  className?: string;
  inline?: boolean;
}

export function UpgradePrompt({
  feature,
  requiredPlan,
  className,
  inline = false,
}: UpgradePromptProps) {
  if (inline) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/30",
          className
        )}
      >
        <Lock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            {feature}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Requires{" "}
            <PlanBadge plan={requiredPlan} className="ml-0.5 inline-flex" /> plan
            or higher
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/settings/billing">Upgrade</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold">Upgrade to unlock this feature</h3>
          <p className="text-sm text-muted-foreground">{feature}</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>Requires</span>
          <PlanBadge plan={requiredPlan} />
          <span>plan or higher</span>
        </div>
        <Button asChild>
          <Link href="/settings/billing">Upgrade Now</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
