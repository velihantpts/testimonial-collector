"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import {
  PLAN_LIMITS,
  canPerformAction,
  getPlanLimits,
  type PlanType,
} from "@/lib/plans";

export function usePlan() {
  const { data: session, status } = useSession();

  const plan = (session?.user?.plan as PlanType) ?? "FREE";

  const limits = useMemo(() => getPlanLimits(plan), [plan]);

  const canUse = useMemo(() => {
    return (
      feature: keyof (typeof PLAN_LIMITS)["FREE"],
      currentCount?: number
    ) => canPerformAction(plan, feature, currentCount);
  }, [plan]);

  const isFree = plan === "FREE";
  const isStarter = plan === "STARTER";
  const isPro = plan === "PRO";

  return {
    plan,
    limits,
    canUse,
    isFree,
    isStarter,
    isPro,
    loading: status === "loading",
  };
}
