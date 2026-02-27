"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PLAN_LIMITS, PLAN_PRICES } from "@/lib/plans";

function formatLimit(value: number | boolean): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === -1) return "Unlimited";
  return value.toString();
}

type PlanCard = {
  name: string;
  planKey: keyof typeof PLAN_LIMITS;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: { label: string; included: boolean; detail?: string }[];
  cta: string;
  popular?: boolean;
};

const plans: PlanCard[] = [
  {
    name: "Free",
    planKey: "FREE",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for trying out TestimonialBox",
    features: [
      { label: "10 testimonials", included: true },
      { label: "1 project", included: true },
      { label: "1 widget", included: true },
      { label: "Basic collection form", included: true },
      { label: "10 email reminders/month", included: true },
      { label: "Custom branding", included: false },
      { label: "Remove watermark", included: false },
      { label: "Video testimonials", included: false },
      { label: "AI-powered variants", included: false },
      { label: "Priority support", included: false },
    ],
    cta: "Get Started",
  },
  {
    name: "Starter",
    planKey: "STARTER",
    monthlyPrice: PLAN_PRICES.STARTER.monthly,
    yearlyPrice: PLAN_PRICES.STARTER.yearly,
    description: "For growing businesses that need more",
    features: [
      { label: "100 testimonials", included: true },
      { label: "3 projects", included: true },
      { label: "5 widgets", included: true },
      { label: "Custom collection form", included: true },
      { label: "100 email reminders/month", included: true },
      { label: "Custom branding", included: true },
      { label: "Remove watermark", included: true },
      { label: "Video testimonials", included: false },
      { label: "AI-powered variants", included: false },
      { label: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Pro",
    planKey: "PRO",
    monthlyPrice: PLAN_PRICES.PRO.monthly,
    yearlyPrice: PLAN_PRICES.PRO.yearly,
    description: "For teams that want everything",
    features: [
      { label: "Unlimited testimonials", included: true },
      { label: "Unlimited projects", included: true },
      { label: "Unlimited widgets", included: true },
      { label: "Custom collection form", included: true },
      { label: "Unlimited email reminders", included: true },
      { label: "Custom branding", included: true },
      { label: "Remove watermark", included: true },
      { label: "Video testimonials", included: true },
      { label: "AI-powered variants", included: true },
      { label: "Priority support", included: true },
    ],
    cta: "Start Free Trial",
  },
];

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Start free, upgrade when you need more. No hidden fees.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-medium ${
                !yearly ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span
              className={`text-sm font-medium ${
                yearly ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Yearly
            </span>
            {yearly && (
              <Badge className="ml-1 bg-emerald-100 text-emerald-700 border-emerald-200">
                Save up to 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const displayPrice = yearly && plan.yearlyPrice > 0
              ? Math.round(plan.yearlyPrice / 12)
              : plan.monthlyPrice;

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                  plan.popular
                    ? "border-[#6366f1] ring-2 ring-[#6366f1]/20"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white px-3 py-0.5 text-xs">
                    Most Popular
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${displayPrice}
                    </span>
                    <span className="text-sm text-gray-500">/month</span>
                  </div>
                  {yearly && plan.yearlyPrice > 0 && (
                    <p className="mt-1 text-xs text-gray-400">
                      ${plan.yearlyPrice} billed annually
                    </p>
                  )}
                  {plan.monthlyPrice === 0 && (
                    <p className="mt-1 text-xs text-gray-400">
                      Free forever
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Button
                  asChild
                  className={`mb-6 w-full ${
                    plan.popular
                      ? "bg-[#6366f1] text-white hover:bg-[#4f46e5]"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/register">{plan.cta}</Link>
                </Button>

                {/* Feature list */}
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-start gap-2 text-sm"
                    >
                      {feature.included ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                      )}
                      <span
                        className={
                          feature.included ? "text-gray-700" : "text-gray-400"
                        }
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
