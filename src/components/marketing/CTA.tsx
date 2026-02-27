import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] px-6 py-16 text-center shadow-xl sm:px-12 sm:py-20">
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to collect your first testimonial?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-indigo-100">
              Join 500+ businesses already using TestimonialBox to turn happy
              customers into powerful social proof.
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="h-12 bg-white px-8 text-base font-semibold text-[#6366f1] shadow-lg hover:bg-gray-50"
              >
                <Link href="/register">
                  Start Free &mdash; No Credit Card Required
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-indigo-200">
              Free forever plan available. Setup takes less than 2 minutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
