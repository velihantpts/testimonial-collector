"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  CreditCard,
  Loader2,
  ExternalLink,
  Zap,
  MessageSquareQuote,
  FolderOpen,
  Code2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlanBadge } from "@/components/billing/PlanBadge";
import { PricingCards } from "@/components/billing/PricingCards";
import { PLAN_LIMITS, type PlanType } from "@/lib/plans";

interface UsageStats {
  testimonials: number;
  projects: number;
  widgets: number;
  reminders: number;
}

export default function BillingPage() {
  const { data: session } = useSession();
  const [portalLoading, setPortalLoading] = useState(false);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  const plan = (session?.user?.plan as PlanType) ?? "FREE";
  const limits = PLAN_LIMITS[plan];

  useEffect(() => {
    async function fetchUsage() {
      try {
        const [testimonialsRes, projectsRes] = await Promise.all([
          fetch("/api/testimonials?limit=0"),
          fetch("/api/projects"),
        ]);

        let testimonialCount = 0;
        let projectCount = 0;
        let widgetCount = 0;

        if (testimonialsRes.ok) {
          const data = await testimonialsRes.json();
          testimonialCount = Array.isArray(data)
            ? data.length
            : data.total ?? 0;
        }

        if (projectsRes.ok) {
          const projects = await projectsRes.json();
          if (Array.isArray(projects)) {
            projectCount = projects.length;
            widgetCount = projects.reduce(
              (acc: number, p: { _count?: { widgets?: number } }) =>
                acc + (p._count?.widgets ?? 0),
              0
            );
          }
        }

        setUsage({
          testimonials: testimonialCount,
          projects: projectCount,
          widgets: widgetCount,
          reminders: 0,
        });
      } catch {
        setUsage({
          testimonials: 0,
          projects: 0,
          widgets: 0,
          reminders: 0,
        });
      } finally {
        setUsageLoading(false);
      }
    }

    fetchUsage();
  }, []);

  async function handleManageSubscription() {
    try {
      setPortalLoading(true);
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setPortalLoading(false);
    }
  }

  function formatLimit(value: number): string {
    return value === -1 ? "Unlimited" : value.toString();
  }

  function getUsagePercent(current: number, max: number): number {
    if (max === -1) return 0;
    if (max === 0) return 100;
    return Math.min(Math.round((current / max) * 100), 100);
  }

  const usageItems = [
    {
      label: "Testimonials",
      icon: MessageSquareQuote,
      current: usage?.testimonials ?? 0,
      max: limits.maxTestimonials,
      color: "#6366f1",
    },
    {
      label: "Projects",
      icon: FolderOpen,
      current: usage?.projects ?? 0,
      max: limits.maxProjects,
      color: "#8b5cf6",
    },
    {
      label: "Widgets",
      icon: Code2,
      current: usage?.widgets ?? 0,
      max: limits.maxWidgets,
      color: "#22c55e",
    },
    {
      label: "Email Reminders / mo",
      icon: Mail,
      current: usage?.reminders ?? 0,
      max: limits.maxRemindersPerMonth,
      color: "#f59e0b",
    },
  ];

  const planFeatures: Record<string, string[]> = {
    FREE: [
      "Up to 10 testimonials",
      "1 project",
      "1 widget",
      "10 email reminders per month",
      "Basic embed widget",
    ],
    STARTER: [
      "Up to 100 testimonials",
      "3 projects",
      "5 widgets",
      "100 email reminders per month",
      "Custom branding",
      "Remove TestimonialBox branding",
    ],
    PRO: [
      "Unlimited testimonials",
      "Unlimited projects",
      "Unlimited widgets",
      "Unlimited email reminders",
      "Video testimonials",
      "AI-generated variants",
      "Google Review import",
      "Priority support",
    ],
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Current plan card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Current Plan</CardTitle>
                  <PlanBadge plan={plan} />
                </div>
                <CardDescription>
                  {plan === "FREE"
                    ? "You are on the free plan"
                    : `You are subscribed to the ${plan.charAt(0) + plan.slice(1).toLowerCase()} plan`}
                </CardDescription>
              </div>
            </div>
            {plan !== "FREE" && (
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    Manage Subscription
                    <ExternalLink className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              What&apos;s included:
            </p>
            <ul className="grid gap-1 sm:grid-cols-2">
              {(planFeatures[plan] ?? planFeatures.FREE).map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Zap className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Usage stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>
            Your current resource usage this billing period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usageLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {usageItems.map((item) => {
                const percent = getUsagePercent(item.current, item.max);
                const isNearLimit = percent >= 80 && item.max !== -1;

                return (
                  <div
                    key={item.label}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon
                          className="h-4 w-4"
                          style={{ color: item.color }}
                        />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.current} of {formatLimit(item.max)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width:
                            item.max === -1
                              ? "5%"
                              : `${Math.max(percent, 2)}%`,
                          backgroundColor: isNearLimit
                            ? "#ef4444"
                            : item.color,
                        }}
                      />
                    </div>
                    {isNearLimit && (
                      <p className="text-xs text-red-500">
                        You&apos;re nearing your limit. Consider upgrading.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Change plan section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Change Plan</h2>
          <p className="text-sm text-muted-foreground">
            {plan === "FREE"
              ? "Upgrade to unlock more features and higher limits."
              : "Switch between plans or manage your subscription."}
          </p>
        </div>
        <PricingCards currentPlan={plan} />
      </div>
    </div>
  );
}
