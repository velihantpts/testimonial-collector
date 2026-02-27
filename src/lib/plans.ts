export const PLAN_LIMITS = {
  FREE: {
    maxTestimonials: 10,
    maxProjects: 1,
    maxWidgets: 1,
    maxRemindersPerMonth: 10,
    videoTestimonials: false,
    aiVariants: false,
    customBranding: false,
    removeBranding: false,
    googleReviewImport: false,
    prioritySupport: false,
  },
  STARTER: {
    maxTestimonials: 100,
    maxProjects: 3,
    maxWidgets: 5,
    maxRemindersPerMonth: 100,
    videoTestimonials: false,
    aiVariants: false,
    customBranding: true,
    removeBranding: true,
    googleReviewImport: false,
    prioritySupport: false,
  },
  PRO: {
    maxTestimonials: -1,
    maxProjects: -1,
    maxWidgets: -1,
    maxRemindersPerMonth: -1,
    videoTestimonials: true,
    aiVariants: true,
    customBranding: true,
    removeBranding: true,
    googleReviewImport: true,
    prioritySupport: true,
  },
} as const;

export const PLAN_PRICES = {
  STARTER: {
    monthly: 19,
    yearly: 190,
  },
  PRO: {
    monthly: 39,
    yearly: 390,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan];
}

export function canPerformAction(
  plan: PlanType,
  action: keyof (typeof PLAN_LIMITS)["FREE"],
  currentCount?: number
): boolean {
  const limits = PLAN_LIMITS[plan];
  const limit = limits[action];

  if (typeof limit === "boolean") return limit;
  if (typeof limit === "number" && typeof currentCount === "number") {
    return limit === -1 || currentCount < limit;
  }
  return true;
}
