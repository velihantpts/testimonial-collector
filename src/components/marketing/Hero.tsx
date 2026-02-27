"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      {/* Browser chrome */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b bg-gray-50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="mx-auto rounded-md bg-gray-200 px-8 py-1 text-xs text-gray-500">
            testimonialbox.com/dashboard
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-4 sm:p-6">
          {/* Stats row */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: "128" },
              { label: "This Month", value: "24" },
              { label: "Rating", value: "4.9" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg bg-gray-50 p-3 text-center"
              >
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial cards */}
          <div className="space-y-3">
            {[
              {
                name: "Sarah M.",
                text: "Absolutely love this product! It transformed our workflow.",
                rating: 5,
              },
              {
                name: "James K.",
                text: "Best investment we made this year. Setup was a breeze.",
                rating: 5,
              },
              {
                name: "Lisa T.",
                text: "Customer support is phenomenal. Highly recommend!",
                rating: 4,
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
              >
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6366f1]/10 text-xs font-bold text-[#6366f1]">
                    {testimonial.name[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {testimonial.name}
                  </span>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-gray-600">
                  {testimonial.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#6366f1]/10 blur-2xl" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-[#8b5cf6]/10 blur-2xl" />
    </div>
  );
}

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#6366f1]/5 via-white to-[#8b5cf6]/5" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div
          className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Left: copy */}
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#6366f1]/20 bg-[#6366f1]/5 px-4 py-1.5 text-sm font-medium text-[#6366f1]">
              <Star className="h-3.5 w-3.5 fill-[#6366f1] text-[#6366f1]" />
              Trusted by 500+ businesses
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Turn Happy Customers Into{" "}
              <span className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                Your Best Marketing
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
              Collect, manage, and showcase testimonials with a single link. No
              coding required.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 bg-[#6366f1] px-8 text-base font-semibold text-white hover:bg-[#4f46e5]"
              >
                <Link href="/register">
                  Start Free &mdash; No Credit Card
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base font-semibold"
              >
                <a href="#how-it-works">
                  <Play className="mr-1 h-4 w-4" />
                  See How It Works
                </a>
              </Button>
            </div>

            <p className="mt-4 text-sm text-gray-400">
              Free forever plan available. No credit card required.
            </p>
          </div>

          {/* Right: dashboard mockup */}
          <div
            className={`transition-all duration-700 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
