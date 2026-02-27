import { Metadata } from "next";
import PricingSection from "@/components/marketing/PricingSection";
import FAQ from "@/components/marketing/FAQ";
import CTA from "@/components/marketing/CTA";

export const metadata: Metadata = {
  title: "Pricing - TestimonialBox",
  description:
    "Simple, transparent pricing for TestimonialBox. Start free, upgrade when you need more.",
};

export default function PricingPage() {
  return (
    <div className="pt-16">
      <PricingSection />
      <FAQ />
      <CTA />
    </div>
  );
}
