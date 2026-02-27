import { Metadata } from "next";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import HowItWorks from "@/components/marketing/HowItWorks";
import PricingSection from "@/components/marketing/PricingSection";
import FAQ from "@/components/marketing/FAQ";
import CTA from "@/components/marketing/CTA";

export const metadata: Metadata = {
  title: "TestimonialBox - Collect & Showcase Customer Testimonials",
  description:
    "Collect, manage, and showcase customer testimonials with a single link. No coding required. Free plan available.",
};

export default function MarketingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <PricingSection />
      <FAQ />
      <CTA />
    </>
  );
}
