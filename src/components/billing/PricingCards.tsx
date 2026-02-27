"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PLAN_PRICES, PLAN_LIMITS } from "@/lib/plans";

interface PricingCardsProps {
  currentPlan?: string;
}

const plans = [
  {
    name: "Free",
    key: "FREE" as const,
    description: "Get started with the basics",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      `${PLAN_LIMITS.FREE.maxTestimonials} testimonials`,
      `${PLAN_LIMITS.FREE.maxProjects} project`,
      `${PLAN_LIMITS.FREE.maxWidgets} widget`,
      `${PLAN_LIMITS.FREE.maxRemindersPerMonth} email reminders/mo`,
      "Basic embed widget",
    ],
    notIncluded: [
      "Custom branding",
      "Remove branding",
      "Video testimonials",
      "AI variants",
      "Google Review import",
      "Priority support",
    ],
    accent: "gray",
  },
  {
    name: "Starter",
    key: "STARTER" as const,
    description: "Perfect for growing businesses",
    monthlyPrice: PLAN_PRICES.STARTER.monthly,
    yearlyPrice: PLAN_PRICES.STARTER.yearly,
    features: [
      `${PLAN_LIMITS.STARTER.maxTestimonials} testimonials`,
      `${PLAN_LIMITS.STARTER.maxProjects} projects`,
      `${PLAN_LIMITS.STARTER.maxWidgets} widgets`,
      `${PLAN_LIMITS.STARTER.maxRemindersPerMonth} email reminders/mo`,
      "Custom branding",
      "Remove branding",
    ],
    notIncluded: [
      "Video testimonials",
      "AI variants",
      "Google Review import",
      "Priority support",
    ],
    accent: "indigo",
    popular: true,
  },
  {
    name: "Pro",
    key: "PRO" as const,
    description: "Unlimited everything for power users",
    monthlyPrice: PLAN_PRICES.PRO.monthly,
    yearlyPrice: PLAN_PRICES.PRO.yearly,
    features: [
      "Unlimited testimonials",
      "Unlimited projects",
      "Unlimited widgets",
      "Unlimited email reminders",
      "Custom branding",
      "Remove branding",
      "Video testimonials",
      "AI variants",
      "Google Review import",
      "Priority support",
    ],
    notIncluded: [],
    accent: "violet",
  },
];

export function PricingCards({ currentPlan }: PricingCardsProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleCheckout(planKey: string) {
    if (planKey === "FREE" || planKey === currentPlan) return;

    try {
      setLoadingPlan(planKey);

      // Determine the correct price ID based on plan and billing period
      const priceId =
        planKey === "STARTER"
          ? process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
          : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

      if (!priceId) {
        console.error(`No price ID configured for plan ${planKey}`);
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={cn(
            "text-sm font-medium",
            !isYearly ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Monthly
        </span>
        <Switch checked={isYearly} onCheckedChange={setIsYearly} />
        <span
          className={cn(
            "text-sm font-medium",
            isYearly ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Yearly
        </span>
        {isYearly && (
          <Badge variant="secondary" className="text-xs font-medium">
            Save ~17%
          </Badge>
        )}
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.key;
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isLoading = loadingPlan === plan.key;
          const isPopular = plan.popular;

          return (
            <Card
              key={plan.key}
              className={cn(
                "relative flex flex-col",
                isPopular && "border-indigo-500 shadow-md",
                isCurrent && "ring-2 ring-indigo-500"
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-indigo-600 text-white hover:bg-indigo-600">
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-600 text-white hover:bg-green-600">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    ${price}
                  </span>
                  {plan.key !== "FREE" && (
                    <span className="text-muted-foreground">
                      /{isYearly ? "year" : "month"}
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 opacity-0" />
                      <span className="text-sm line-through">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={cn(
                    "w-full",
                    isPopular && !isCurrent && "bg-indigo-600 hover:bg-indigo-700"
                  )}
                  variant={
                    isCurrent
                      ? "outline"
                      : plan.key === "FREE"
                        ? "outline"
                        : "default"
                  }
                  disabled={isCurrent || plan.key === "FREE" || isLoading}
                  onClick={() => handleCheckout(plan.key)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : plan.key === "FREE" ? (
                    "Free Forever"
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
